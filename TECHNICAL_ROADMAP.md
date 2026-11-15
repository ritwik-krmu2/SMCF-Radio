# SMCF Radio — Technical Roadmap & Architecture Plan

## 1. Vision & Strategy
Transform SMCF Radio from a static demo into an enterprise-ready digital campus broadcasting and student media platform for SGT University's School of Emerging Media, Communication and Film Studies.

---

## 2. Target System Architecture

```
                       +---------------------------------------+
                       |           SMCF Radio Platform         |
                       |       (React 19 + TypeScript + Vite)  |
                       +-------------------+-------------------+
                                           |
    +-----------------------+--------------+---------------+------------------------+
    |                       |                              |                        |
+---v----------------+  +---v---------------+       +------v-------------+   +------v---------------+
| 1. Public Website  |  | 2. Student Portal |       | 3. Creator Studio  |   | 4. Admin Dashboard   |
| - Home & Hero      |  | - Student Auth    |       | - RJ Auth & Studio |   | - Real Analytics     |
| - Live Radio       |  | - Bookmarks       |       | - Episode Creator  |   | - User & RBAC Mgmt   |
| - Shows & Programs |  | - Song Requests   |       | - Draft Management |   | - Approval Queue     |
| - Episode Archive  |  | - Listen History  |       | - Slot Assignment  |   | - Moderation (Songs) |
| - RJ Profiles      |  | - Feedback        |       | - Profile Editor   |   | - Announcement Mgr   |
| - Announcements    |  +-------------------+       +--------------------+   | - Audit Log          |
| - About & Contact  |                                                       +----------------------+
+--------------------+
          |
          +------------------------------------+
                                               |
                                    +----------v----------+
                                    | Persistent Audio    |
                                    | Stream & Player Bar |
                                    +----------+----------+
                                               |
    +------------------------------------------+------------------------------------------+
    |                                                                                     |
+---v--------------------------------------------------+        +-------------------------v------------------+
| Backend Service Layer (Dual-Mode Architecture)      |        | Static Media & Audio Pipeline              |
| - Supabase Client (PostgreSQL, Auth, RLS, Storage)   |        | - Internet Live Radio Stream               |
| - Persistent Local Database Fallback Repository      |        | - Local Spoken WAV Audio Archive           |
+------------------------------------------------------+        +--------------------------------------------+
```

---

## 3. Implementation Phases & Milestones

### Phase 1: Repository Audit & Planning [COMPLETED]
- Comprehensive 20-point audit (`REPOSITORY_AUDIT.md`).
- Feature status matrix (`FEATURE_STATUS.md`).
- Architectural roadmap (`TECHNICAL_ROADMAP.md`).

### Phase 2: Database Schema & Migration Layer
- Define normalized relational schema: `profiles`, `roles`, `rj_profiles`, `shows`, `episodes`, `playlists`, `schedules`, `announcements`, `song_requests`, `comments`, `bookmarks`, `listening_history`, `activity_logs`, `platform_settings`.
- Implement Row Level Security (RLS) policies for PostgreSQL.
- Deliver migration file `supabase/migrations/20261114_initial_schema.sql`.
- Build unified `DatabaseService` with automatic Supabase-or-LocalStorage dual-mode sync.

### Phase 3: Public Website Refactoring
- Establish seamless hash/path routing for:
  - `#/` - Home (Hero, Featured, Categories, RJs, Ticker)
  - `#/live` - Dedicated Live Radio Stream
  - `#/shows` - Shows and Programs Directory
  - `#/archive` - Episode Archive with filter and search
  - `#/rjs` - RJ Profiles & Voice Introductions
  - `#/announcements` - Campus Announcements Bulletin
  - `#/about` - About SMCF Radio & School of Emerging Media
  - `#/contact` - Campus Studio Contact & Direction
- Maintain persistent audio playback across all navigation transitions.

### Phase 4: Student Portal Enhancement
- Real student registration, login, and profile editing.
- Persistent bookmarks synchronized with user accounts.
- Listening history tracking recently played episodes.
- Song request submission with status lifecycle (Pending -> Approved -> Played -> Dismissed).
- Student feedback and episode review submissions.

### Phase 5: RJ / Creator Studio Implementation
- Creator dashboard for users with `rj` or `admin` role.
- RJ profile bio and schedule editor.
- Episode creator form: title, description, category, language, duration, audio URL, cover URL.
- Draft vs Published workflow with admin review request.

### Phase 6: Production Admin Dashboard
- Metrics calculated dynamically from real database records (no mock numbers).
- User management table with role assignment (`student`, `rj`, `admin`).
- Episode approval queue for creator submissions.
- Interactive schedule slot editor.
- Song request moderation (approve, queue, dismiss).
- Comment and feedback moderation (approve, remove).
- Campus announcement publisher.
- System activity audit log.

### Phase 7: Persistent Audio Player Refinement
- Retain the exact single-row layout user approved (`NowPlayingBar`).
- Add sleek inline volume slider and mute toggle.
- Add buffering/loading spinners and stream error handling.
- Add playback progress scrubber for recorded episodes.
- Unify playback between live stream and recorded archive.

### Phase 8: Testing & Quality Assurance
- Setup Vitest and React Testing Library.
- Unit tests for authentication, role guards, data store, and audio controller.
- Integration tests for song request and comment moderation flows.

### Phase 9: Production Documentation
- `README.md`
- `ARCHITECTURE.md`
- `DATABASE_SCHEMA.md`
- `SECURITY.md`
- `DEPLOYMENT.md`
- `ADMIN_GUIDE.md`

