-- ===================================================================
-- SMCF Radio — Production Database Schema & Migration
-- SGT University - School of Emerging Media, Communication & Film
-- Generated: 2026-11-14
-- ===================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('student', 'rj', 'admin');
CREATE TYPE episode_status AS ENUM ('draft', 'pending', 'published', 'archived');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'queued', 'played', 'dismissed');
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'removed');
CREATE TYPE schedule_status AS ENUM ('done', 'live', 'next', 'scheduled');

-- 3. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Media Studies',
  student_id TEXT,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. RJ PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.rj_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  alias TEXT,
  department TEXT NOT NULL,
  bio TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#90F34F',
  initials TEXT NOT NULL,
  badge TEXT,
  audio_url TEXT,
  drive_url TEXT,
  show_time TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SHOWS TABLE
CREATE TABLE IF NOT EXISTS public.shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_hi TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Hindi/English',
  rj_id UUID REFERENCES public.rj_profiles(id) ON DELETE SET NULL,
  rj_name TEXT NOT NULL,
  cover_image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EPISODES TABLE
CREATE TABLE IF NOT EXISTS public.episodes (
  id SERIAL PRIMARY KEY,
  show_id UUID REFERENCES public.shows(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Hindi',
  rj_name TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '00:00',
  plays INTEGER NOT NULL DEFAULT 0,
  audio_url TEXT NOT NULL,
  drive_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  status episode_status NOT NULL DEFAULT 'published',
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BROADCAST SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.schedules (
  id SERIAL PRIMARY KEY,
  time_slot TEXT NOT NULL,
  title TEXT NOT NULL,
  rj_name TEXT NOT NULL,
  day_of_week TEXT NOT NULL DEFAULT 'Friday',
  status schedule_status NOT NULL DEFAULT 'scheduled',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id SERIAL PRIMARY KEY,
  en TEXT NOT NULL,
  hi TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. SONG REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.song_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  song_title TEXT NOT NULL,
  artist TEXT NOT NULL,
  dedicated_to TEXT,
  requested_by TEXT NOT NULL,
  department TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COMMUNITY COMMENTS / FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  program_id INTEGER REFERENCES public.episodes(id) ON DELETE CASCADE,
  program_title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  status comment_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. USER BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id INTEGER NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- 12. USER LISTENING HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.listening_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id INTEGER NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  episode_title TEXT NOT NULL,
  rj_name TEXT NOT NULL,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT & ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rj_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view; users can update own profile; admins can update all.
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public content: Viewable by anyone
CREATE POLICY "Public RJ profiles are viewable" ON public.rj_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Public shows are viewable" ON public.shows FOR SELECT USING (is_active = true);
CREATE POLICY "Published episodes are viewable" ON public.episodes FOR SELECT USING (status = 'published');
CREATE POLICY "Active schedules are viewable" ON public.schedules FOR SELECT USING (is_active = true);
CREATE POLICY "Active announcements are viewable" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Approved comments are viewable" ON public.comments FOR SELECT USING (status = 'approved');

-- Bookmarks & History: Private to user
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own listening history" ON public.listening_history FOR ALL USING (auth.uid() = user_id);

-- Song Requests: Users can view own; public can insert; admins can manage
CREATE POLICY "Anyone can submit song request" ON public.song_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own requests" ON public.song_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Creator / RJ: Can manage own episodes
CREATE POLICY "RJs can submit and edit own episodes" ON public.episodes FOR ALL USING (auth.uid() = submitted_by);

-- Admin: Full access across tables
CREATE POLICY "Admins have full access to episodes" ON public.episodes FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
CREATE POLICY "Admins have full access to song requests" ON public.song_requests FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
CREATE POLICY "Admins have full access to comments" ON public.comments FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
CREATE POLICY "Admins have full access to schedules" ON public.schedules FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
CREATE POLICY "Admins have full access to announcements" ON public.announcements FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
CREATE POLICY "Admins have full access to audit logs" ON public.activity_logs FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

