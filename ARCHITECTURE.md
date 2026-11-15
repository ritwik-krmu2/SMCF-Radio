# SMCF Radio — System Architecture & Design Specification

## 1. High-Level Architecture

SMCF Radio is engineered as a modern digital campus broadcasting platform providing high-fidelity streaming, archived audio discovery, creator workflows, and administrative governance.

```mermaid
flowchart TD
    Client["Client Browser (React 19 + TypeScript + Vite)"]
    
    subgraph FrontendApp["Frontend Application Layer"]
        Nav["Navbar & Page Router"]
        AudioEngine["Persistent Audio Lifecycle Engine"]
        Views["4 Primary Interfaces: Public, Student, RJ Studio, Admin"]
    end

    subgraph ServiceLayer["Service Abstraction Layer"]
        AuthSvc["AuthService (RBAC: Student, RJ, Admin)"]
        DbSvc["DatabaseService (Reactive Event Bus)"]
    end

    subgraph DataPersistence["Persistence Layer (Dual-Mode)"]
        SupabaseClient["Supabase API (PostgreSQL + RLS + Storage)"]
        LocalStorageRepo["Persistent Local Storage Repository (Offline/Demo)"]
    end

    Client --> Nav
    Nav --> Views
    Views --> AudioEngine
    Views --> ServiceLayer
    AuthSvc --> DataPersistence
    DbSvc --> DataPersistence
```

---

## 2. Four Primary Interfaces

### A. Public Radio Website
- **Home**: Broadcast station hero, live tuner strip, on-air indicator, category chips, daily lineup strip, top highlights, and RJ voice preview cards.
- **Live Radio (`#/live`)**: Dedicated live broadcasting studio view, 90.4 MHz FM frequency telemetry, live listener counts, stereo stream metadata, and schedule timeline.
- **Shows & Programs (`#/shows`)**: Searchable and filterable directory across Music & Beats, Campus Buzz, Gyaan Time, Talkback, Masti Time, and Career Connect.
- **Episode Archive (`#/archive`)**: Master audio repository hosting all 13 authentic audio recordings from the SMCF Radio studio. Allows searching by host, language, or title, direct playback, bookmarking, and opening verified Google Drive files.
- **RJ Profiles (`#/rjs`)**: Individual profile cards showcasing RJ Priya, RJ Rahul, RJ Ananya, RJ Ronit, RJ Diva, and guest hosts with badges, biographies, and instant voice preview audio triggers.
- **Campus Announcements (`#/announcements`)**: Bilingual bulletin board broadcasting university media notices in English and Hindi.
- **About (`#/about`)**: Institutional overview of SGT University's School of Emerging Media, Communication and Film Studies.
- **Contact (`#/contact`)**: Campus studio location details, transmission hotline, and inquiry submission form.

### B. Student Portal (`#/portal`)
- **Verified Student Identity**: Displays department, student ID, and account statistics.
- **Saved Vault (Bookmarks)**: Dynamic list of episodes bookmarked by the user with one-click playback and removal.
- **Listening History**: Chronological log of recent audio sessions with replay triggers.
- **Friday Song Request Queue**: Form to request songs with live lifecycle tracking (`Pending` -> `Approved` -> `Queued` -> `Played` -> `Dismissed`).
- **Community Reviews**: Form to submit thoughts on specific episodes and browse peer comments.

### C. RJ / Creator Studio (`#/creator`)
- **Role Guard**: Requires `rj` or `admin` role.
- **Episode Master Uploader**: Form to register new episodes with titles (English & Hindi), description, category, duration, master audio URL, and Google Drive URL.
- **Draft vs. Published Workflow**: Creators can maintain drafts before publishing live to the campus catalog.
- **Episode Catalog**: Detailed table showing episode IDs, play counts, durations, and status with audio preview triggers and delete permissions.
- **RJ Card Editor**: Displays host alias, assigned weekly broadcast time slot, and bio.

### D. Admin Dashboard (`#/admin`)
- **Role Guard**: Requires `admin` role with secure authentication.
- **Zero-Mock Metrics Engine**: Real-time computed platform statistics derived strictly from active database items:
  - Total verified episodes (published vs drafts).
  - Total verified audio plays.
  - Active registered student and faculty users.
  - Pending and queued song requests.
  - Real category distribution counts and play sums.
- **User Directory & RBAC**: Table of all registered campus accounts with live dropdown to switch roles (`student`, `rj`, `admin`).
- **Episode Moderation Queue**: Approve draft submissions or delete records.
- **Schedule Management**: Create, edit, and delete broadcast time slots.
- **Song Request Desk**: Moderate incoming requests (Approve, Queue for Friday, Mark Played, Dismiss).
- **Comment Moderation**: Approve or remove public feedback.
- **Announcement Publisher**: Post bilingual announcements to the ticker.
- **Activity & Security Audit Log**: Immutable log of administrative actions with timestamps and actor identities.

---

## 3. Audio Player Lifecycle & Streaming Pipeline

To ensure the user never experiences audio interruptions while browsing shows, switching tabs, or navigating portals, the HTML5 `<audio>` element is mounted at the root level in `src/App.tsx`.

```mermaid
sequenceDiagram
    participant User as Listener
    participant UI as Page View / RJ Card
    participant App as App Engine (Root)
    participant Audio as HTML5 Audio Element
    participant Bar as NowPlayingBar (Sleek Bottom Bar)

    User->>UI: Clicks "Play" on Episode or RJ Sample
    UI->>App: handlePlayProgram(episode)
    App->>Audio: Sets src = episode.audioUrl & calls .play()
    App->>Bar: Updates nowPlaying, isLive = false, duration
    Audio-->>Bar: Fires onTimeUpdate & onLoadedMetadata
    Bar-->>User: Displays Progress, Equalizer Animates, Plays Audio
```

### Audio Capabilities & Safety Controls
- **Live Stream**: Connects directly to streaming server (`STREAM_URL`) when "Listen Live" is clicked.
- **Recorded Master Audio**: Plays synthesized spoken voice WAV files located in `public/audio/*.wav` with zero CORS latency and 100% native browser support.
- **Volume & Mute**: Smooth inline volume slider revealed without layout shifts; instant mute toggle.
- **Scrubber & Progress**: Thin lime progress bar along the top edge of the player bar for recorded episodes.
- **Error Recovery**: Automatic reconnection attempt on network disconnect.

---

## 4. Dual-Mode Backend Service Pattern

```mermaid
classDiagram
    class DatabaseService {
        +getPrograms() Program[]
        +createProgram(p) Program
        +updateProgram(id, updates)
        +deleteProgram(id)
        +incrementPlays(id)
        +getRJs() RJ[]
        +getSchedule() ScheduleItem[]
        +getSongRequests() SongRequest[]
        +submitSongRequest(req)
        +updateSongRequestStatus(id, status)
        +getComments() Comment[]
        +submitComment(c)
        +getBookmarks(userId) number[]
        +toggleBookmark(userId, episodeId)
        +getListeningHistory(userId) ListenHistoryItem[]
        +logPlay(userId, program)
        +getPlatformStats() RealStats
        +subscribe(callback)
    }

    class SupabaseLayer {
        +PostgreSQL Tables
        +Row Level Security
        +Storage Buckets
    }

    class LocalStorageRepository {
        +Synchronized Keys
        +Seed Datasets (13 episodes)
        +Session Token Storage
    }

    DatabaseService --> SupabaseLayer : When VITE_SUPABASE_URL set
    DatabaseService --> LocalStorageRepository : Standalone Fallback
```

This dual-mode design guarantees that any developer, student, or evaluator can clone the repository and experience the complete SaaS platform immediately without provisioning cloud services first, while also offering a direct path to cloud PostgreSQL deployment.

