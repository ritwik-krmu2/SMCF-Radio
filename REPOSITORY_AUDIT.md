# SMCF Radio — Repository Audit Report
**Date:** November 14, 2026  
**Auditor:** Senior Software Architect & Security Engineer  
**Target:** SGT University — School of Emerging Media, Communication and Film Studies (SMCF) Radio Platform

---

## Executive Summary
This audit inspects the SMCF Radio repository against production standards for a digital campus broadcasting and student media platform. The platform serves students, RJ creators, faculty, and administrative staff at SGT University.

While the existing codebase provides an appealing visual foundation inspired by modern broadcast design systems (deep navy slate, neon lime accents, glassmorphic surfaces), the underlying architecture previously lacked persistent storage, true role-based authentication, structured audio pipeline controls, and modular separation of concerns.

Below is the comprehensive evaluation across all 20 required investigation areas.

---

## Audit Across 20 Investigation Areas

### 1. Project Structure and Architecture
- **Finding:** Currently structured as a flat Vite single-page application.
- **Components:** In `src/components/`, several views (`AdminConsole.tsx`, `StudentPortal.tsx`, `AuthView.tsx`) were mixed with atomic UI elements (`NowPlayingBar.tsx`, `ProgramCard.tsx`, `TunerStrip.tsx`).
- **State Flow:** Navigation was handled through a single state variable (`'home' | 'portal' | 'admin' | 'auth'`) in `App.tsx` rather than a dedicated router or interface router.
- **Recommendation:** Refactor into 4 distinct modular interfaces:
  1. **Public Radio Website** (Home, Live Radio, Shows & Programs, Episode Archive, RJ Profiles, Announcements, About, Contact).
  2. **Student Portal** (Authentication, Profile, Saved Bookmarks, Listening History, Song Requests, Feedback).
  3. **RJ / Creator Studio** (RJ Login, Episode Submissions, Audio Metadata, Draft/Publish Status, Broadcast Schedules).
  4. **Admin Dashboard** (Real Metrics, RBAC User Management, Episode Approvals, Schedule Moderation, Song Request & Comment Moderation, Audit Logs).

### 2. Frontend Framework and Dependencies
- **Finding:** Running on **React 19.0.1** and **Vite 6.2.3**, with **TypeScript 5.8.3**, **Tailwind CSS v4.1.14**, **Lucide React 0.546.0**, and **Motion 12.23.24**.
- **Assessment:** Modern, highly capable, and performant. React 19 is fully supported with functional components and hooks.
- **Missing Dependencies:** Database/API client (`@supabase/supabase-js`), testing framework (`vitest`, `@testing-library/react`).

### 3. Existing Pages and Components
- **Finding:**
  - `App.tsx`: Monolithic container holding home page sections, audio element, state triggers, and modal logic.
  - `NowPlayingBar.tsx`: Compact player bar with play/pause, equalizer animation, and listener count.
  - `ProgramCard.tsx`: Display card for radio programs with plays, category, RJ name, and playback trigger.
  - `StudentPortal.tsx`: Tabbed student interface (Overview, Song Request, Community Feedback, Bookmarks).
  - `AdminConsole.tsx`: Tabbed admin interface (Overview, Song Requests, Feedback, Schedule, Announcements).
  - `AuthView.tsx`: Tabbed login/signup form with field validation.
- **Gaps:** Pages like Live Radio, Episode Archive, RJ Profiles, About SMCF, and Contact were either sections on the home page or completely missing standalone deep views. RJ / Creator Studio was absent.

### 4. Routing and Navigation
- **Finding:** Pure conditional rendering based on state in `App.tsx`. Browser back/forward navigation, deep linking, and bookmarkable URLs (`#archive`, `#live`, `#rjs`, `#creator`, `#portal`, `#admin`) were not supported.
- **Recommendation:** Implement client-side hash/path router supporting clean URLs and URL history synchronization.

### 5. Existing Authentication Implementation
- **Finding:**
  - `authService.ts` and `AuthContext.tsx` introduced mock authentication with `localStorage` fallback.
  - Simulated network delays (`setTimeout(..., 700)`).
  - Role check was hardcoded to email containing `'admin'` or student ID containing `'ADMIN'`.
- **Recommendation:**
  - Implement a dual-mode Auth Service:
    1. Supabase Auth (when credentials exist in `.env`).
    2. Secure Local Database Repository (when running offline or in demo mode) with salted password hashing, credential validation, session tokens, and strict role validation (`student`, `rj`, `admin`).

### 6. Database and Backend Integrations
- **Finding:** No active backend connection. All state changes (song requests, comments, bookmarks) were volatile or stored in fragmented `localStorage` keys without a unified database service or sync mechanism.
- **Recommendation:**
  - Create Supabase client and PostgreSQL schema with Row Level Security (RLS).
  - Provide a robust `DatabaseService` abstraction that seamlessly bridges Supabase and persistent local storage.

### 7. API Endpoints and Server-Side Logic
- **Finding:** Project includes `express` and `dotenv` in `package.json`, but Vite frontend runs client-side.
- **Recommendation:** Use Supabase REST/PostgREST/Auth APIs directly from the client with Row Level Security, plus client-side service layer. Provide full SQL migrations for production Supabase deployments.

### 8. Audio Player and Streaming Implementation
- **Finding:**
  - `<audio>` element rendered in `App.tsx`.
  - Stream source supports live internet radio (e.g. SomaFM GrooveSalad stream) and local audio files in `public/audio/*.wav`.
  - Previously, attempting to feed Google Drive download links (`uc?export=download`) directly into `<audio>` failed due to Google's 2024 redirect-to-login policy and browser cross-origin cookie restrictions.
  - Local synthesized WAV voice files solved the audio output issue cleanly without CORS errors.
  - Missing features: volume control, mute, loading/buffering states, audio error recovery, audio duration/current time display.

### 9. Episode and Media Management
- **Finding:** 13 authentic audio show records extracted from user's Google Drive archive mapped in `src/data.ts`.
- **Gaps:** RJ creators could not upload or submit new episode records, metadata, audio URLs, or cover artwork. No draft vs published status workflow.

### 10. Admin Dashboard
- **Finding:** `AdminConsole.tsx` previously used hardcoded static numbers (`42,850` plays, `1,240` hours, `+18%` trends) and fabricated charts.
- **Requirement:** ALL metrics must be calculated strictly from real database items (real episode counts, real verified users, real pending requests, real comments, real play logs). No fabricated numbers.

### 11. Student Portal
- **Finding:** `StudentPortal.tsx` allowed submitting song requests and comments, but saved them in component state or disconnected storage keys.
- **Requirement:** Integrate with user profile, persist bookmarks to user ID, track real submission status (Pending -> Approved -> Played -> Dismissed).

### 12. RJ / Creator Functionality
- **Finding:** RJ functionality was entirely missing. Only static RJ display cards existed on the home page.
- **Requirement:** Build a dedicated **RJ / Creator Studio** where campus RJs can log in, edit their RJ profile, submit new show episodes, provide audio links, mark drafts, and submit for admin review.

### 13. Existing Forms and Interactions
- **Finding:** Song request form, comment form, and login/signup forms had basic inputs.
- **Gaps:** Need comprehensive validation, character counters, XSS sanitization, anti-spam rate limiting, and feedback toasts.

### 14. Environment Variables and Configuration
- **Finding:** `.env.example` and `.env` configured for `VITE_DATABASE_URL`.
- **Security Check:** Verified no secret keys or production passwords exist in tracked files.

### 15. Security Vulnerabilities
- **Vulnerabilities Identified:**
  - Lack of input sanitization on user comments and song requests.
  - Client-side role checking bypassable via localStorage tampering.
  - Missing Content Security Policy (CSP) headers recommendation.
- **Hardening Steps:** Strict schema validation, DOMPurify/sanitization, role verification guards, and secure RLS policies.

### 16. Responsive Design and Accessibility
- **Finding:** Tailwind CSS responsive classes (`sm:`, `md:`, `lg:`) are partially implemented.
- **Gaps:** Mobile drawer navigation, touch targets (<44px in some buttons), missing `aria-live` regions for screen readers, and focus indicators.

### 17. Build Errors and Console Errors
- **Finding:** Clean build achieved with `npm run build` (Vite v6.2.3, TypeScript v5.8.3).
- **Zero build errors currently.**

### 18. Unused Dependencies and Dead Code
- **Finding:** Unused express files in root (`server.js` was mentioned in clean script). Clean scripts should be streamlined.

### 19. Deployment Configuration
- **Finding:** Configured for standard static Vite build (`dist/`). Deployable to Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.

### 20. Existing Tests and Missing Tests
- **Finding:** Zero unit or integration tests exist in the repository.
- **Requirement:** Install Vitest and write automated tests for authentication, audio state, database repositories, and admin workflows.

---

## Conclusion
The project has outstanding visual aesthetic and authentic campus radio identity. Executing the technical transformation will elevate SMCF Radio into a true production-grade digital broadcasting platform.

