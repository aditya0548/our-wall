begin;
  -- remove the publication if it already exists
  drop publication if exists supabase_realtime;
  
  -- create publication for the entire db
  create publication supabase_realtime;
commit;

-- add table to publication
alter publication supabase_realtime add table notes;
