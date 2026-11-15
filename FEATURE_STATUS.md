# SMCF Radio — Feature Status Matrix

This document provides a feature-by-feature classification of the SMCF Radio platform prior to and during the production transformation.

Status Legend:
- **Working**: Fully operational, verified, with real logic and proper presentation.
- **Partially working**: Functional in some aspects, but missing edge cases, persistence, or complete UI polish.
- **Mock implementation**: Uses static stubs, hardcoded numbers, or simulated delays without actual backend persistence.
- **Broken**: Throws errors or fails to perform intended action.
- **Not implemented**: Completely absent from codebase.

---

## 1. Core Audio & Streaming
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Live Audio Stream (Icecast/Shoutcast)** | Working | Plays verified live audio stream via HTML5 Audio element. |
| **Local Spoken Voice Archive Audio** | Working | Synthesized spoken audio WAV files in `public/audio/` play reliably. |
| **Google Drive Direct Audio Links** | Partially working | Direct Google Drive download URLs block inline `<audio>` due to Google login redirect; fallback to local audio works. |
| **Persistent NowPlayingBar** | Working | Sleek bottom player bar with play/pause, equalizer animation, and station metadata. |
| **Volume & Mute Controls** | Partially working | Audio volume defaults to 100%; needs dedicated volume slider and mute toggle in player. |
| **Buffering & Loading States** | Partially working | Basic playing/paused state; needs explicit audio buffer and connection error indicators. |
| **Seek & Duration Controls** | Partially working | Shows duration badge; needs full scrubber bar for recorded episodes. |

---

## 2. Public Website Pages
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Home Page Hero & Highlights** | Working | High aesthetic hero section with live indicator, featured show banner, and category chips. |
| **Live Radio Dedicated Page** | Partially working | Live stream section exists on Home, but lacks dedicated view with schedule timeline. |
| **Shows and Programs Directory** | Working | 13 authentic audio episodes categorized and searchable. |
| **Episode Archive Page** | Partially working | Filterable list exists; needs dedicated archive view with full search, sorting, and metadata. |
| **RJ Profiles Page** | Working | Profiles for RJ Priya, RJ Rahul, RJ Ananya, RJ Ronit, RJ Diva, RJ Shivam with badges and voice previews. |
| **Campus Announcements** | Working | Dynamic bilingual ticker (English & Hindi) and announcement cards. |
| **About SMCF Radio** | Partially working | Basic mission statement; needs dedicated page covering SGT University School of Emerging Media. |
| **Contact & Feedback Page** | Partially working | Feedback form exists in Student Portal; needs public campus studio contact page with map and directory. |

---

## 3. Student Portal
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Student Registration & Login** | Working | Validates student ID, department, email, password; persists session. |
| **Student Profile Management** | Partially working | Displays student information; needs edit profile and avatar selection. |
| **Saved Shows & Bookmarks** | Working | Allows bookmarking episodes with real persistence in database/localStorage. |
| **Listening History** | Partially working | Tracks recently played items; needs persistent history log with timestamps. |
| **Song Request Submissions** | Working | Form allows song title, artist, and shoutout; submits to moderation queue. |
| **Request Status Tracking** | Partially working | Displays requests; needs live status badges (Pending, Approved, Played, Rejected). |
| **Episode Comments & Reviews** | Working | Allows submitting feedback on programs; routes to moderation queue. |

---

## 4. RJ / Creator Studio
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **RJ Authentication & Portal Access** | Partially working | Role system supports 'student' and 'admin'; needs dedicated 'rj' role with creator dashboard. |
| **RJ Profile Editor** | Not implemented | Needs interface for RJs to update bio, social links, and broadcast time slots. |
| **Episode Upload & Metadata** | Not implemented | Needs form for RJs to input title, description, category, audio URL, and duration. |
| **Draft vs Published Workflow** | Not implemented | Needs episode draft state management and publish requests. |
| **Broadcast Schedule Management** | Not implemented | Needs creator view of assigned upcoming live broadcast slots. |

---

## 5. Admin Dashboard
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Real Platform Analytics** | Partially working | Previously used static hardcoded numbers; now calculating strictly from real database items. |
| **User & Account Management** | Partially working | Lists users; needs role switcher (`student` <-> `rj` <-> `admin`) and account status toggle. |
| **Episode Approval & Moderation** | Not implemented | Needs queue for admins to approve/reject creator episode submissions. |
| **Schedule Slot Editor** | Partially working | Displays schedule; needs interactive slot creation and assignment to RJs. |
| **Song Request Moderation** | Working | Admins can approve, queue, or dismiss student song requests. |
| **Comment Moderation** | Working | Admins can approve or remove user feedback. |
| **Announcement Editor** | Working | Admins can post and delete campus broadcast announcements. |
| **Activity & Audit Logs** | Partially working | Basic logs; needs structured audit logging for all moderation and administrative actions. |

---

## 6. Security & Infrastructure
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Environment Variable Management** | Working | Clean `.env.example` and `.env` with no secrets exposed. |
| **Database Schema & Migrations** | Partially working | Local schema designed; needs production SQL migration script for Supabase. |
| **Row Level Security (RLS)** | Not implemented | Needs PostgreSQL RLS policies defined for all tables. |
| **Automated Testing Suite** | Not implemented | Needs Vitest integration and unit tests for auth, audio, and repositories. |

