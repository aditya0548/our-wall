-- Drop existing objects
drop trigger if exists space_size_limit on space_members;
drop function if exists check_space_size;
drop function if exists generate_connection_code;
drop function if exists create_space_for_current_user;
drop function if exists join_space_by_code;
drop function if exists join_space;

drop table if exists notes cascade;
drop table if exists space_members cascade;
drop table if exists spaces cascade;

-- spaces: a private shared space
create table spaces (
  id uuid primary key default gen_random_uuid(),
  connection_code text unique not null,
  is_full boolean default false,     -- becomes true once 2 members are in
  created_at timestamptz default now()
);

-- space_members: which users belong to which space (max 2 per space)
create table space_members (
  space_id uuid references spaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (space_id, user_id)
);

-- notes: will be used later. Create the table now, but do not build any UI for it.
create table notes (
  id uuid primary key default gen_random_uuid(),
  space_id uuid references spaces(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  body text not null check (char_length(body) <= 140),
  color text not null default 'coral',
  created_at timestamptz default now()
);

-- Enforce max 2 members per space at the database level
create or replace function check_space_size()
returns trigger as $$
begin
  if (select count(*) from space_members where space_id = new.space_id) >= 2 then
    raise exception 'Space already has 2 members';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger space_size_limit
  before insert on space_members
  for each row execute function check_space_size();

-- Enable RLS
alter table spaces enable row level security;
alter table space_members enable row level security;
alter table notes enable row level security;

-- spaces: users can read spaces they belong to; anyone logged in can insert (to create a space)
create policy "read own spaces" on spaces for select
  using (exists (
    select 1 from space_members
    where space_members.space_id = spaces.id
    and space_members.user_id = auth.uid()
  ));

create policy "anyone can create a space" on spaces for insert
  with check (auth.uid() is not null);

-- space_members: users can see members of spaces they belong to; anyone can insert themselves
create policy "read members of own spaces" on space_members for select
  using (exists (
    select 1 from space_members sm
    where sm.space_id = space_members.space_id
    and sm.user_id = auth.uid()
  ));

create policy "join a space" on space_members for insert
  with check (
    user_id = auth.uid()  -- can only add yourself
    and exists (
      select 1 from spaces
      where spaces.id = space_members.space_id
      and spaces.is_full = false
    )
  );

-- notes: only members of the space can read/write (UI comes later)
create policy "read notes in own spaces" on notes for select
  using (exists (
    select 1 from space_members
    where space_members.space_id = notes.space_id
    and space_members.user_id = auth.uid()
  ));

create policy "insert notes in own spaces" on notes for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from space_members
      where space_members.space_id = notes.space_id
      and space_members.user_id = auth.uid()
    )
  );

-- Generate a random 6-char code (no ambiguous chars)
create or replace function generate_connection_code()
returns text as $$
declare
  chars text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars)) + 1, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Create a new space and add creator as first member
create or replace function create_space_for_current_user()
returns table(space_id uuid, code text) as $$
declare
  new_code text;
  new_id uuid;
begin
  -- If user already has a space, delete it first
  delete from spaces where id in (
    select space_id from space_members where user_id = auth.uid()
  );

  -- Generate a unique code
  loop
    new_code := generate_connection_code();
    exit when not exists (select 1 from spaces where connection_code = new_code);
  end loop;

  insert into spaces (connection_code) values (new_code) returning id into new_id;
  insert into space_members (space_id, user_id) values (new_id, auth.uid());

  return query select new_id, new_code;
end;
$$ language plpgsql security definer;

-- Join a space by code
create or replace function join_space_by_code(input_code text)
returns table(success boolean, error_message text, space_id uuid) as $$
declare
  target_space record;
  existing_space uuid;
begin
  input_code := upper(trim(input_code));

  -- Find the space
  select * into target_space from spaces where connection_code = input_code;

  if not found then
    return query select false, 'We couldn''t find that code. Double-check it.', null::uuid;
    return;
  end if;

  -- Already full?
  if target_space.is_full then
    return query select false, 'This space is already paired.', null::uuid;
    return;
  end if;

  -- Is this the user's own space?
  if exists (
    select 1 from space_members
    where space_members.space_id = target_space.id and user_id = auth.uid()
  ) then
    return query select false, 'You can''t join your own space.', null::uuid;
    return;
  end if;

  -- If user already has a pending space, delete it
  delete from spaces where id in (
    select space_id from space_members where user_id = auth.uid()
  );

  -- Join the new space
  insert into space_members (space_id, user_id) values (target_space.id, auth.uid());

  -- Mark space as full
  update spaces set is_full = true where id = target_space.id;

  return query select true, null::text, target_space.id;
end;
$$ language plpgsql security definer;
