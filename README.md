# SMCF Radio — Digital Campus Broadcasting & Student Media Platform
**School of emerging media Communication & Film studies (SMCF)**  
*Broadcast Frequency: 90.4 MHz Campus FM & 24/7 Digital Stereo Stream*

---

## 🎨 Visual Design System — Warm Editorial + Modern 3D + Premium SaaS
- **Color Palette**:
  - `Background`: `#F7F4ED` (warm cream paper)
  - `Background Secondary`: `#FBF9F4` (soft light cream)
  - `Surface`: `#FFFFFF` (crisp white cards)
  - `Foreground`: `#242522` (deep warm charcoal ink)
  - `Muted`: `#77766F` (refined warm slate grey)
  - `Primary`: `#E98268` (terracotta / coral peach)
  - `Secondary`: `#A99BCB` (soft lavender)
  - `Accent`: `#83AAA0` (sage green / muted teal)
  - `Border`: `#EAE5DC` (subtle warm border)
- **Typography**: Manrope for editorial headlines and UI typography; Inter for body copy; Noto Sans Devanagari for bilingual Hindi broadcasting subtitles.
- **Tasteful 3D Visual Experience**:
  - `HeroMic3D`: Interactive Three.js studio condenser microphone with floating sound wave rings and pointer tracking.
  - `VinylRecord3D`: 3D spinning vinyl record with realistic grooves and rotating tonearm needle during live streaming.
  - `Waveform3D`: Dynamic canvas audio ribbon waveform responding to audio state.
  - `AudioSphere3D`: Softly rendered 3D acoustic spheres for empty states and station highlights.

### Key Capabilities
- **Persistent Audio Stream**: HTML5 audio streaming architecture with volume, mute, buffering detection, scrubber progress for recorded episodes, and continuous playback across all pages.
- **4 Dedicated Interfaces**:
  1. **Public Radio Website**: Home, Live Radio (90.4 MHz On Air), Shows & Programs, Master Episode Vault (13 authentic recordings), RJ Profiles, Announcements, About SMCF, and Contact.
  2. **Student Portal**: Verified student accounts, saved bookmark vault, listening history logs, Friday song request queue with status tracking, and community feedback.
  3. **RJ / Creator Studio**: Broadcaster workspace for student Radio Jockeys to curate episode metadata, draft/publish shows, review audio archives, and manage assigned broadcast slots.
  4. **Admin Dashboard**: Real computed platform analytics (zero mock data), RBAC user management (switch roles between student, RJ, admin), episode approval queue, interactive schedule editor, song request moderation, comment moderation, announcement publisher, and security audit logs.
- **Dual-Mode Backend Architecture**:
  - Connects to **Supabase** (PostgreSQL, Auth, Storage, RLS) when configured in `.env`.
  - Runs in a synchronized **Persistent Local Repository** out-of-the-box when offline or in standalone deployments, ensuring 100% functionality without setup friction.

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone <repository-url>
cd SMCF-Radio
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional)* Add your Supabase credentials or custom backend URL:
```env
VITE_DATABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```
*Note: If left empty, SMCF Radio automatically boots in full persistent LocalRepository mode with seed accounts and all 13 authentic audio show records pre-loaded.*

### 3. Run Development Server
```bash
npm run dev
```
The platform will launch at `http://localhost:3000`.

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 👥 Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Student** | `student@smcf.edu.in` | `student123` | Portal access, bookmarks, song requests, feedback |
| **RJ Broadcaster** | `rj.ronit@smcf.edu.in` | `rj123` | RJ Creator Studio, episode submissions, catalog |
| **RJ Broadcaster** | `rj.diva@smcf.edu.in` | `rj123` | RJ Creator Studio, profile editor, catalog |
| **Station Admin** | `admin@smcf.edu.in` | `admin123` | Full admin suite, user RBAC, approvals, moderation |

---

## 📁 Repository Structure
```
SMCF-Radio/
├── public/
│   └── audio/                       # Spoken voice and station WAV audio files
├── src/
│   ├── __tests__/                   # Automated Vitest test suites
│   ├── components/
│   │   ├── AdminConsole.tsx         # Station administration suite
│   │   ├── AuthView.tsx             # Student & broadcaster login/signup
│   │   ├── CampusTicker.tsx         # Real-time bilingual announcement ticker
│   │   ├── Footer.tsx               # University campus radio footer
│   │   ├── Navbar.tsx               # Responsive navigation & role badges
│   │   ├── NowPlayingBar.tsx        # Persistent single-row audio player bar
│   │   ├── ProgramCard.tsx          # Program highlight display card
│   │   ├── PublicPages.tsx          # Live Radio, Shows, Archive, RJs, About, Contact
│   │   ├── RJStudio.tsx             # RJ creator upload and catalog workspace
│   │   ├── StudentPortal.tsx        # Bookmarks, listening history, song requests
│   │   └── TunerStrip.tsx           # Frequency visualizer strip
│   ├── context/
│   │   └── AuthContext.tsx          # React authentication state provider
│   ├── lib/
│   │   └── supabase.ts              # Supabase client initializer
│   ├── services/
│   │   ├── authService.ts           # RBAC authentication & session service
│   │   └── databaseService.ts       # Unified dual-mode database repository
│   ├── utils/
│   │   └── audioUrl.ts              # Audio & Google Drive link formatters
│   ├── App.tsx                      # Root coordinator & audio lifecycle engine
│   ├── data.ts                      # Authentic 13 audio show records & RJs
│   └── types.ts                     # TypeScript data contracts & models
├── supabase/
│   └── migrations/
│       └── 20261114_initial_schema.sql # PostgreSQL schema & RLS policies
├── ARCHITECTURE.md                  # Detailed system architecture
├── DATABASE_SCHEMA.md               # Database tables, relationships, & DDL
├── SECURITY.md                      # Security model & vulnerability analysis
├── DEPLOYMENT.md                    # Production hosting instructions
├── ADMIN_GUIDE.md                   # Operational manual for station managers
├── REPOSITORY_AUDIT.md              # 20-point codebase audit report
├── FEATURE_STATUS.md                # Feature completion matrix
└── TECHNICAL_ROADMAP.md             # SaaS transformation roadmap
```

---

## 📜 License
Developed for School of emerging media Communication & Film studies.
