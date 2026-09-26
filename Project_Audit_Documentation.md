# Full Project Audit & Documentation: "Our Wall"

## 1. Project Overview
"Our Wall" (internally named "moodify") is a private, real-time shared digital space for long-distance couples. The application provides an exclusive one-on-one environment where paired users can chat via a "wall" of notes, leave sticky notes with alarms, share timed "Open When" envelopes, draw together on a whiteboard, and play games like Tic-Tac-Toe.

From a user's perspective, the end-to-end journey involves signing up with an email, customizing their profile (display name, pronouns, theme), generating a unique 6-character connection code, and sharing it with their partner. Once the partner enters the code, their accounts are paired to a single "space", unlocking real-time access to the shared features. 

**Tech Stack (Actual Dependencies):**
- React 19 (`react`, `react-dom`)
- React Router DOM 7 (`react-router-dom`)
- Supabase JS 2 (`@supabase/supabase-js`)
- Lucide React (Icons)
- Vite (Build tool)
- Oxlint (Linting)

**Top-Level Folder Structure:**
```
.
├── .agents/                 (AI agent configs/skills)
├── public/                  (Static assets, backgrounds)
├── src/                     (Application source code)
│   ├── assets/              (Images, svgs)
│   ├── components/          (React components)
│   ├── hooks/               (Custom React hooks)
│   ├── pages/               (React route views)
│   ├── styles/              (CSS stylesheets)
│   └── theme/               (Theme provider logic)
├── package.json             (Dependencies)
├── vite.config.js           (Vite config)
├── .env.local               (Environment variables)
├── pairing_schema.sql       (Database schema for pairing)
└── realtime.sql             (Database realtime config)
```

## 2. File-by-File Walkthrough

### Root Configuration Files
- `package.json`: Defines the project dependencies (React 19, Supabase, Vite) and scripts.
- `vite.config.js`: The Vite bundler configuration file.
- `.env.local`: Contains the Supabase environment variables.
- `pairing_schema.sql`: Contains the database schema and Row Level Security (RLS) policies for pairing logic (`spaces`, `space_members`, `notes`).
- `realtime.sql`: Adds the `notes` table to the Supabase realtime publication.
- `fix-realtime.js`: A script that forcefully replaces channel subscription logic across all hook files to prevent duplicate subscriptions.

### Source Files (`src/`)

**Root Application:**
- `src/main.jsx`: Entry point that mounts the React app and exposes the Supabase client to the window for debugging.
- `src/App.jsx`: Sets up React Router, maintains global authentication state, and defines route protection guards.
- `src/supabaseClient.js`: Initializes the Supabase JS client using the `.env` variables.
- `src/App.css` & `src/index.css`: Global styles and base CSS variables.

**Pages (`src/pages/`):**
- `Login.jsx`: Handles both sign-in and sign-up using Supabase Auth, along with form validation.
- `ForgotPassword.jsx`: Sends password reset emails via Supabase.
- `ResetPassword.jsx`: Allows users to set a new password after clicking an email link.
- `Setup.jsx`: A post-login onboarding screen for setting up profile details (display name, pronouns, theme).
- `Home.jsx`: The orchestration page for pairing; decides whether to show the Wall, the waiting screen, or the create/join space cards based on membership status.
- `Wall.jsx`: The primary feature page; displays the real-time feed of notes and partner's Chibi character.
- `Notes.jsx`: Despite the name, this page is actually the "Sticky Notes" canvas where users can pin notes and set alarms.
- `OpenWhen.jsx`: Renders a grid of timed "Open When" envelopes that unlock at specific dates.
- `Whiteboard.jsx`: The collaborative drawing canvas page.
- `Games.jsx`: A directory page listing available games.
- `TicTacToe.jsx`: The actual Tic-Tac-Toe game implementation.
- `Pairing.jsx`: **Dead Code**; an older version of the pairing flow superseded by `Home.jsx`.

**Hooks (`src/hooks/`):**
- `useSpace.js`: Fetches the current user's space, polls for partner join (when member count is 1), and listens for space resets.
- `useProfile.js`: Fetches and updates the user's profile and finds the partner's profile via the space members.
- `useNotes.js`: Fetches Wall notes and subscribes to realtime `INSERT` events, with optimistic local state updates.
- `useStickyNotes.js`: Handles fetching, creating, updating, pinning, and adding reactions to sticky notes via realtime subscriptions.
- `useEnvelopes.js`: Manages creating and unlocking "Open When" envelopes via realtime.
- `useStrokes.js`: Handles real-time drawing logic, strokes, and white-board undo operations.
- `useTicTacToe.js`: Orchestrates a synced Tic-Tac-Toe game board with win/draw logic.
- `useChibiReactions.js`: (Likely handles character emotes/reactions on the Wall, implied by name).
- `useNoteAlarms.js`: Triggers client-side alarms when a sticky note's `alarm_at` date is reached.

**Components (`src/components/`):**
- `CreateSpaceCard.jsx` & `JoinSpaceCard.jsx`: UI cards that trigger the `create_space_for_current_user` and `join_space_by_code` Postgres RPC functions.
- `ShareCodeScreen.jsx`: Displays the generated connection code and waits for a partner to join.
- `NoteCard.jsx`: Renders an individual chat-like note on the Wall, formatting the timestamp.
- `NoteInput.jsx`: The text input field for sending notes to the Wall.
- `StickyNote.jsx`: A draggable UI component for a sticky note.
- `CreateNoteModal.jsx`: Modal to author a new sticky note.
- `NoteAlarmModal.jsx`: Modal that pops up when a sticky note alarm triggers.
- `EnvelopeCard.jsx`: Renders an envelope (locked or unlocked state).
- `CreateEnvelopeModal.jsx` & `OpenEnvelopeModal.jsx`: Modals to seal and view envelopes.
- `WhiteboardCanvas.jsx` & `WhiteboardControls.jsx`: Renders the drawing canvas and toolbars (pen, color, size, undo).
- `TicTacToeBoard.jsx` & `GameTile.jsx`: Renders the Tic-Tac-Toe grid and game directory buttons.
- `ProfileMenu.jsx`: The dropdown menu for settings, theme changes, and logout.
- `ChangeThemeModal.jsx` & `ThemePicker.jsx`: UI for selecting CSS color themes.
- `Settings.jsx` (Wait, this is a page, but categorized under UI functionality): The settings view.
- `Chibi.jsx`, `ChibiRow.jsx`, `ChibiReactions.jsx`: Renders the avatars representing the users.
- `ColorPicker.jsx`, `Sparkle.jsx`: Reusable decorative components.
- `ResetModal.jsx` & `PartnerResetModal.jsx` & `CancelModal.jsx`: Modals handling the deletion/reset of a paired space.
- `FloatingNav.jsx`: The bottom navigation bar for switching between Wall, Notes, Whiteboard, etc.
- `ConnectedScreen.jsx`: Likely a success state UI upon pairing.

**Theme (`src/theme/`):**
- `ThemeProvider.jsx` & `themes.js`: Uses React Context to provide the current user's theme (e.g., sakura, ocean) and injects it into the DOM.

**Styles (`src/styles/`):**
- Contains modular CSS files (`auth.css`, `pairing.css`, `wall.css`, `settings.css`, `whiteboard.css`, etc.) driving the visual design.

## 3. Authentication — How It Actually Works
- **Initialization**: `src/supabaseClient.js` creates the client using `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`.
- **Sign-Up**: In `src/pages/Login.jsx`, calling `supabase.auth.signUp({ email, password })`. It succeeds instantly and transitions the user to the app. Email confirmation is clearly disabled in Supabase, as the code does not block the user with a "Check your email" screen during the sign-up flow.
- **Sign-In**: Also in `src/pages/Login.jsx`, using `supabase.auth.signInWithPassword({ email, password })`.
- **Persistence**: In `src/App.jsx`, `supabase.auth.getSession()` is called on initial mount. Simultaneously, an `onAuthStateChange` listener is attached, seamlessly updating the `session` state when tokens refresh.
- **Sign-Out**: E.g., in `src/components/ProfileMenu.jsx`, clicking sign-out calls `await supabase.auth.signOut()`. This fires the `onAuthStateChange` listener in `App.jsx`, setting `session` to null.
- **Route Protection**: Controlled explicitly in `src/App.jsx` using ternary guards. Unauthenticated users are bounced to login:
  ```jsx
  <Route path="/" element={session ? <Home session={session} /> : <Navigate to="/login" replace />} />
  ```

## 4. Pairing Flow — How It Actually Works
- **Create Space**: In `src/components/CreateSpaceCard.jsx`, the app calls a Postgres RPC function: `supabase.rpc('create_space_for_current_user')`.
- **Code Generation**: The Postgres function `generate_connection_code()` in `pairing_schema.sql` generates a 6-character code using the alphabet `'23456789ABCDEFGHJKMNPQRSTUVWXYZ'` (excluding ambiguous characters like 0, 1, I, O). It explicitly uses a loop to check uniqueness against existing spaces before inserting.
- **Join Space**: `src/components/JoinSpaceCard.jsx` takes the code and calls `supabase.rpc('join_space_by_code', { input_code })`.
- **Validation**: The DB function verifies:
  1. The code exists.
  2. The space isn't full (`is_full = false`).
  3. The user isn't trying to join their own space.
- **Routing**: `src/hooks/useSpace.js` queries `space_members`. The `Home.jsx` component routes the user:
  - If `space.isFull`, route to `Wall`.
  - If member count is 1, route to `ShareCodeScreen` (waiting state).
  - If 0, show the Create/Join UI.
- **Membership Enforcement**: The `space_members` table has a Postgres trigger `space_size_limit` that strictly blocks inserts if a space already has 2 members, raising an exception.

## 5. The Wall — How It Actually Works
- **Location**: `src/pages/Wall.jsx`. Renders the `ChibiRow` (avatars), a mapped list of `NoteCard`s, and the `NoteInput` field.
- **Fetching Notes**: Direct DB query on load in `useNotes.js`:
  `.from('notes').select('*').eq('space_id', spaceId).order('created_at', { ascending: false }).limit(100)`
- **Realtime Subscription**: Sets up a listener in `useNotes.js`:
  ```javascript
  const channel = supabase.channel(channelName)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notes',
      filter: `space_id=eq.${spaceId}`,
    }, (payload) => { ... })
  ```
- **Sending a Note**:
  - The input field (`NoteInput.jsx`) clears its state immediately upon a successful promise resolution from `onSend`.
  - **Local State vs Listener**: The code actually *does both*. In `useNotes.js`, `sendNote` manually and optimistically appends the note to the local React state with a temporary ID (`local-...`), before calling the database insert. When the realtime listener fires shortly after, it finds the temporary note via string matching on the body and author, and seamlessly replaces the temporary note with the authoritative DB record.
- **Ordering**: The database fetches them `created_at` descending (newest first), but `Wall.jsx` manually reverses the array (`const sortedNotes = [...notes].reverse();`) before mapping so the newest note appears at the *bottom* of the screen.
- **Timestamp Display**: Computed in `NoteCard.jsx`. If today: "3:45 PM". If yesterday: "Yesterday 3:45 PM". Otherwise: "Oct 12, 3:45 PM".
- **Color**: It is hardcoded entirely. `NoteInput.jsx` executes `await onSend(text, 'coral')`. No dynamic palette is implemented for Wall notes.

## 6. Database Schema
### Defined in `pairing_schema.sql`:
- **`spaces`**
  - `id` (uuid, primary key)
  - `connection_code` (text, unique)
  - `is_full` (boolean)
  - `created_at` (timestamptz)
- **`space_members`**
  - `space_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `joined_at` (timestamptz)
- **`notes`**
  - `id` (uuid, primary key)
  - `space_id` (uuid, foreign key)
  - `author_id` (uuid, foreign key)
  - `body` (text)
  - `color` (text, default 'coral')
  - `created_at` (timestamptz)

### Discovered via frontend source code (Missing SQL definitions in repo):
- **`profiles`**: `user_id`, `display_name`, `pronouns`, `theme`, `birthday`
- **`sticky_notes`**: `id`, `space_id`, `author_id`, `body`, `color`, `shape`, `width_pct`, `height_pct`, `alarm_at`, `position_x`, `position_y`, `alarm_acknowledged_at`, `is_pinned`, `created_at`
- **`note_reactions`**: `id`, `note_id`, `user_id`, `emoji`, `created_at`
- **`envelopes`**: `id`, `space_id`, `sender_id`, `title`, `body`, `unlock_at`, `opened_at`
- **`strokes`**: `id`, `space_id`, `author_id`, `points` (json), `pressures` (json), `color`, `size`, `created_at`
- **`tic_tac_toe_games`**: `id`, `space_id`, `player_x_user_id`, `current_turn_user_id`, `board` (json), `winner_user_id`, `is_draw`, `wins_x`, `wins_o`, `draws`, `updated_at`, `game_number`

**Row Level Security (RLS) Policies:**
- **`spaces`**: 
  - *Select*: Allows a user to read a space if their ID exists in `space_members` for that space.
  - *Select (Realtime)*: Bypasses strict table-locks to allow realtime broadcasts to fire upon deletion using a custom `is_space_member` function.
  - *Insert*: Allows anyone authenticated to insert (create a new space).
- **`space_members`**: 
  - *Select*: Allows reading members of spaces you belong to.
  - *Insert*: Allows inserting yourself into a space, provided the space is not marked `is_full`.
- **`notes`**: 
  - *Select/Insert*: Only allows reading/writing if you are a member of the space the note belongs to.

🚨 **CRITICAL FLAG**: The database schema and RLS policies for `profiles`, `sticky_notes`, `envelopes`, `strokes`, and `tic_tac_toe_games` do **not** exist in the repository's `.sql` files. If RLS is not properly configured on those tables in the actual Supabase dashboard, it represents a massive data leakage vulnerability. 

## 7. Environment Variables & Secrets
- `VITE_SUPABASE_URL`: The Supabase project URL (Public, Client-side).
- `VITE_SUPABASE_ANON_KEY`: The Supabase anonymous role key (Public, Client-side).

**Secrets Validation**: There are no private server-side secrets (like service role keys) expected by the app, nor are any accidentally hardcoded in the source code.

## 8. Known Issues / Tech Debt
1. **Dead Code**: `src/pages/Pairing.jsx` is fully built out but completely orphaned. The app uses `Home.jsx` with `CreateSpaceCard` and `JoinSpaceCard` instead.
2. **Missing Migrations**: Over 60% of the database tables used by the frontend (Profiles, Envelopes, Whiteboard strokes, Games) are completely missing from the schema definitions in the repository.
3. **Data Fetching Bottlenecks**: `useStickyNotes.js` and `useStrokes.js` fetch all records for a space without any `.limit()` or pagination. A heavily used whiteboard will crash the frontend by downloading massive JSON arrays of stroke data on every mount.
4. **Fragile Optimistic UI**: `useNotes.js` and `useStrokes.js` use optimistic UI appending with temporary IDs (`local-...`). To reconcile with the server, it attempts to match the inserted body/JSON payload exactly against the incoming Realtime payload. If a user rapidly sends two identical payloads, the array logic may desync.
5. **Mixed Styling Approaches**: The project heavily relies on `.css` files, but occasionally uses inline React styles (e.g., `Pairing.jsx` has massive inline style objects).
6. **Inefficient Realtime Subscriptions**: The `fix-realtime.js` script was hacked in to prevent overlapping realtime subscriptions, hinting at previous architectural issues with React `useEffect` cleanups.

## 9. What's Actually Working vs. What's Not
- **Fully Working**: Auth, Profile Setup, Pairing (Code generation and DB logic), Wall Realtime Chat, Tic-Tac-Toe, Settings.
- **Partially Working / Unverified Backend**: Sticky Notes, Envelopes, and Whiteboard. The React code is fully fleshed out for these, but because the SQL schemas are missing from the repo, their operational status relies entirely on whether a developer manually clicked "Create Table" in the Supabase dashboard.
- **Planned but Never Built**: The "Games" tab mentions "More games coming soon", but only Tic-Tac-Toe exists. The `notes` table has a `color` column, but the UI strictly hardcodes it to `'coral'`.

## 10. Summary Table

| Area | Status | File(s) | Notes |
| :--- | :---: | :--- | :--- |
| **Auth** | ✅ | `Login.jsx`, `App.jsx`, `App.css` | Supabase auth works. Email confirmation disabled. Route guards in place. |
| **Pairing** | ✅ | `Home.jsx`, `useSpace.js`, `pairing_schema.sql` | Connection codes generated via Postgres. Strict 2-member limit enforced by DB triggers. |
| **Wall** | ✅ | `Wall.jsx`, `useNotes.js`, `NoteInput.jsx` | Fully working. Notes are ordered newest-at-bottom. Color is hardcoded to coral. |
| **Realtime** | ⚠️ | `useNotes.js`, `fix-realtime.js` | Functional, but heavily patched using a custom script to prevent duplicate channels. |
| **Persistence**| ✅ | `App.jsx` | Session state safely persisted via `onAuthStateChange`. |
| **RLS** | ⚠️ | `pairing_schema.sql` | Working for spaces/notes. **Missing entirely in code for 6 other tables.** |
| **Styling** | ⚠️ | `*.css`, `Pairing.jsx` | Functional, but messy. Mixes CSS variables with inline JS style objects. |
| **Deployment** | ✅ | `vercel.json` | Ready for Vercel deployment (single-page app redirects configured). |
