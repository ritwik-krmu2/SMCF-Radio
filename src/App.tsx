import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Award,
  Sparkles,
  RadioTower,
  Headphones,
  Clock,
  Layers,
  ArrowRight,
  ChevronRight,
  Disc3,
  ExternalLink,
} from 'lucide-react';
import { STREAM_URL, CATEGORIES } from './data';
import { Program, RJ, ScheduleItem } from './types';
import { TunerStrip } from './components/TunerStrip';
import { CampusTicker } from './components/CampusTicker';
import { ProgramCard } from './components/ProgramCard';
import { StudentPortal } from './components/StudentPortal';
import { AdminConsole } from './components/AdminConsole';
import { RJStudio } from './components/RJStudio';
import { NowPlayingBar } from './components/NowPlayingBar';
import { Navbar, ActivePage } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthView } from './components/AuthView';
import { HeroMic3D } from './components/3d/HeroMic3D';
import { VinylRecord3D } from './components/3d/VinylRecord3D';
import { Waveform3D } from './components/3d/Waveform3D';
import {
  LiveRadioView,
  ShowsDirectoryView,
  EpisodeArchiveView,
  RJProfilesView,
  AnnouncementsView,
  AboutView,
  ContactView,
} from './components/PublicPages';
import { FreeSubscriptionModal } from './components/FreeSubscriptionModal';
import { useAuth } from './context/AuthContext';
import { authService } from './services/authService';
import { databaseService } from './services/databaseService';
import { getMediaAudioUrl } from './utils/audioUrl';

export default function App() {
  const { user, logout } = useAuth();

  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');

  // Real database-driven entities
  const [programs, setPrograms] = useState<Program[]>(() => databaseService.getPrograms());
  const [rjs, setRJs] = useState<RJ[]>(() => databaseService.getRJs());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => databaseService.getSchedule());
  const [announcements, setAnnouncements] = useState(() => databaseService.getAnnouncements());

  // Persistent Audio State
  const [isLive, setIsLive] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<{
    title: string;
    rj: string;
    audioUrl?: string;
    driveUrl?: string;
    duration?: string;
  }>({
    title: '1 Live_SMCF_Promo_Gulam.mp3 (Live 90.4 FM)',
    rj: 'RJ Gulam & Priya',
    audioUrl: '/audio/live_smcf_promo_gulam.mp3',
    driveUrl: 'https://drive.google.com/file/d/1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m/view?usp=drivesdk',
    duration: '2 min',
  });
  const [playing, setPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState(STREAM_URL);
  const [listeners, setListeners] = useState(214);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Free Campus Subscription Modal State
  const [freeSubModalOpen, setFreeSubModalOpen] = useState(false);
  const [freeSubActionTitle, setFreeSubActionTitle] = useState('Song Requests & Comments');

  const handleRequestSubscriberAction = (actionTitle: string, onSuccess?: () => void) => {
    if (user && authService.isSubscriber(user)) {
      if (onSuccess) onSuccess();
      return;
    }
    setFreeSubActionTitle(actionTitle);
    setFreeSubModalOpen(true);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize hash routing with active page
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace('#/', '').replace('#', '');
      const hash = rawHash === '' ? 'home' : rawHash;
      const validPages: ActivePage[] = [
        'home',
        'live',
        'shows',
        'archive',
        'about',
        'contact',
        'portal',
        'portal-library',
        'portal-requests',
        'portal-playlists',
        'portal-comments',
        'portal-subscription',
        'portal-profile',
        'creator',
        'creator-episodes',
        'creator-upload',
        'admin',
        'admin-live',
        'admin-upload',
        'admin-shows',
        'admin-episodes',
        'admin-analytics',
        'admin-comments',
        'admin-requests',
        'admin-students',
        'admin-subscribers',
        'admin-rjs',
        'admin-schedule',
        'admin-announcements',
        'admin-settings',
        'announcements',
        'rjs',
        'auth',
      ];
      if (validPages.includes(hash as ActivePage)) {
        setCurrentPage(hash as ActivePage);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: ActivePage) => {
    setCurrentPage(page);
    window.location.hash = `/${page === 'home' ? '' : page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Subscribe to real-time database updates & sync with Supabase cloud
  useEffect(() => {
    // Initial cloud synchronization from Supabase
    databaseService.syncFromSupabase();

    // Enable Supabase Realtime push events
    const unsubRealtime = databaseService.initRealtime();

    const unsub = databaseService.subscribe(() => {
      setPrograms(databaseService.getPrograms());
      setRJs(databaseService.getRJs());
      setSchedule(databaseService.getSchedule());
      setAnnouncements(databaseService.getAnnouncements());
    });
    return () => {
      unsub();
      if (unsubRealtime) unsubRealtime();
    };
  }, []);

  // Audio Playback synchronization with HTML5 audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src !== audioSrc) {
      audio.src = audioSrc;
      audio.load();
    }

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    if (playing) {
      setIsLoading(true);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false);
            setErrorMessage(null);
          })
          .catch((err) => {
            console.warn('[SMCF Audio] Play rejected or waiting for user interaction:', err);
            setIsLoading(false);
          });
      }
    } else {
      audio.pause();
      setIsLoading(false);
    }
  }, [playing, audioSrc, volume, isMuted]);

  // Audio Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handleWaiting = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handleAudioError = () => {
    console.warn('[SMCF Audio] Audio playback error on src:', audioSrc);
    setIsLoading(false);
    setErrorMessage('Network error');
  };

  const handleSeek = (seconds: number) => {
    if (audioRef.current && isFinite(seconds)) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  // Session reference for real active concurrent listener telemetry
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  // Active Listener Heartbeat Telemetry (Non-simulated real activity tracking)
  useEffect(() => {
    // Immediate heartbeat ping if audio is actively playing
    if (playing) {
      databaseService.recordHeartbeat(
        sessionIdRef.current,
        user?.id,
        isLive ? 'live' : 'episode',
        nowPlaying.title ? 1 : undefined
      );
      setListeners(databaseService.getActiveConcurrentListeners(5));
    }

    const interval = setInterval(() => {
      if (playing) {
        databaseService.recordHeartbeat(
          sessionIdRef.current,
          user?.id,
          isLive ? 'live' : 'episode',
          nowPlaying.title ? 1 : undefined
        );
      }
      setListeners(databaseService.getActiveConcurrentListeners(5));
    }, 15000);

    return () => clearInterval(interval);
  }, [playing, isLive, user?.id, nowPlaying.title]);

  // Handler: Play recorded program episode
  const handlePlayProgram = (program: Program) => {
    const srcToPlay = getMediaAudioUrl(program) || program.audioUrl || '/audio/smcf_promo.wav';
    setAudioSrc(srcToPlay);
    setNowPlaying({
      title: program.title,
      rj: program.rj,
      audioUrl: srcToPlay,
      driveUrl: program.driveUrl,
      duration: program.duration,
    });
    setIsLive(false);
    setPlaying(true);
    databaseService.logPlay(user?.id, program);
  };

  // Handler: Play RJ voice preview
  const handlePlayRJ = (r: RJ) => {
    const srcToPlay = getMediaAudioUrl(r) || r.audioUrl || '/audio/rj_priya.wav';
    setAudioSrc(srcToPlay);
    setNowPlaying({
      title: r.audioTitle || `${r.alias} Broadcaster Special`,
      rj: r.alias,
      audioUrl: srcToPlay,
      driveUrl: r.driveUrl,
    });
    setIsLive(false);
    setPlaying(true);
  };

  // Handler: Connect to Live Radio Stream (Plays 1 Live_SMCF_Promo_Gulam.mp3)
  const handlePlayLiveStream = () => {
    const livePromoAudio = '/audio/live_smcf_promo_gulam.mp3';
    setAudioSrc(livePromoAudio);
    setNowPlaying({
      title: '1 Live_SMCF_Promo_Gulam.mp3 (Live 90.4 FM)',
      rj: 'RJ Gulam & Priya',
      audioUrl: livePromoAudio,
      driveUrl: 'https://drive.google.com/file/d/1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m/view?usp=drivesdk',
      duration: '2 min',
    });
    setIsLive(true);
    setPlaying(true);
  };

  const handleToggleLiveStream = () => {
    if (isLive && playing) {
      setPlaying(false);
    } else {
      handlePlayLiveStream();
    }
  };

  const currentLiveSlot = schedule.find((s) => s.status === 'live') || schedule[0];

  const isDashboardPage =
    currentPage.startsWith('portal') ||
    currentPage.startsWith('creator') ||
    currentPage.startsWith('admin');

  return (
    <div
      className={
        isDashboardPage
          ? 'min-h-screen bg-[#F7F8F5] text-[#202820] flex flex-col justify-between'
          : 'min-h-screen bg-[#060B06] text-[#F8FAFC] selection:bg-[#00FF00]/30 selection:text-[#00FF00] flex flex-col justify-between'
      }
    >
      {/* Native HTML5 Audio Controller (Persistent across whole session) */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onError={handleAudioError}
        onEnded={() => setPlaying(false)}
      />

      {/* Main Responsive Navigation Bar - Rendered on public pages; internal dashboards use their dedicated cyber aside */}
      {!isDashboardPage && (
        <Navbar
          currentPage={currentPage}
          onNavigate={navigateTo}
          currentUser={user}
          onLogout={logout}
          isAudioPlaying={playing && isLive}
        />
      )}

      {/* Primary Interface View Switcher */}
      <main
        className={
          isDashboardPage
            ? 'flex-1 w-full pb-20 sm:pb-24 bg-[#F7F8F5]'
            : 'flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-32 sm:pb-36 overflow-x-hidden'
        }
      >
        <AnimatePresence mode="wait">
          {/* ======================================================= */}
          {/* 1. PUBLIC WEBSITE: HOMEPAGE */}
          {/* ======================================================= */}
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-10 sm:space-y-16"
            >
              {/* Premium Editorial Hero Section with 3D Microphone */}
              <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#0A1A0A] via-[#061206] to-[#040804] border border-[#00FF00]/25 p-4 sm:p-10 lg:p-14 shadow-2xl card-warm">
                {/* Subtle Emerald & Mint Glow */}
                <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-gradient-to-br from-emerald-600/15 via-green-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left Column: Editorial Headline & Copy */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-6 min-w-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/30 text-[#00FF00] text-[10px] sm:text-xs font-bold tracking-wider uppercase max-w-full">
                      <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-ping shrink-0" />
                      <span className="truncate">Live 90.4 MHz FM · {listeners} Students Tuned In</span>
    </div>

                    <h1 className="font-display font-extrabold text-2xl xs:text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.12] tracking-tight break-words">
                      Your Campus.{' '}
                      <span className="bg-gradient-to-r from-[#00FF00] via-[#4ADE80] to-[#10B981] bg-clip-text text-transparent underline decoration-[#00FF00]/40 underline-offset-8">
                        Your Voices.
                      </span>
                    </h1>

                    <p className="text-slate-300 text-xs sm:text-base lg:text-lg leading-relaxed max-w-xl font-normal">
                      Discover the sounds, stories and people that bring our campus together.
                      Curated by students of the School of Emerging Media at SGT University.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1">
                      <button
                        onClick={handleToggleLiveStream}
                        className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00FF00]/30 hover:scale-105 active:scale-95 cursor-pointer w-full sm:w-auto text-center"
                      >
                        {playing && isLive ? (
                          <Pause className="w-4 h-4 fill-slate-950 text-slate-950" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5 fill-slate-950 text-slate-950" />
                        )}
                        <span>{playing && isLive ? 'Pause Stream' : 'Listen Live'}</span>
                      </button>

                      <button
                        onClick={() => navigateTo('shows')}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-[#00FF00]/30 transition-all cursor-pointer w-full sm:w-auto text-center"
                      >
                        <Layers className="w-4 h-4 text-[#00FF00]" />
                        <span>Explore Shows</span>
                      </button>
    </div>

                    {/* Audio Status Pill */}
                    <div className="flex items-center gap-2.5 sm:gap-3 pt-3 text-xs text-slate-400 border-t border-[#00FF00]/20 min-w-0">
                      <div className={`eq shrink-0 ${playing ? '' : 'paused'}`}>
                        <span /><span /><span /><span /><span />
      </div>
                      <p className="truncate min-w-0 text-[11px] sm:text-xs">
                        Currently Airing: <span className="font-bold text-white">{nowPlaying.title}</span> — {nowPlaying.rj}
                      </p>
    </div>
    </div>

                  {/* Right Column: Interactive 3D Microphone & Waves */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center min-w-0 w-full overflow-hidden">
                    <HeroMic3D />
    </div>
    </div>
              </section>

              {/* Endless Scrolling Campus Wire Ticker */}
              <CampusTicker />

              {/* SECTION: CURRENTLY ON AIR */}
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00FF00]">Live Transmission</span>
                    <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Currently On Air</h2>
    </div>
                  <button
                    onClick={() => navigateTo('live')}
                    className="text-xs font-bold text-[#00FF00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Studio Feed</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
    </div>

                <div className="card-warm p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 shadow-xl grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  <div className="lg:col-span-4 flex justify-center">
                    <VinylRecord3D
                      isPlaying={isLive && playing}
                      title={currentLiveSlot?.title || 'Live Studio Feed'}
                      rj={currentLiveSlot?.rj || 'RJ Priya'}
                      size="md"
                    />
    </div>

                  <div className="lg:col-span-8 space-y-4 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-ping shrink-0" />
                        Live 90.4 MHz FM Broadcast
                      </span>
                      <span className="text-xs font-mono text-slate-400">{currentLiveSlot?.time}</span>
    </div>

                    <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white leading-tight break-words">
                      {currentLiveSlot?.title || 'SMCF Live Campus Studio Stream'}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Broadcasting directly from Media Block 3rd Floor at SGT University. Join student hosts for talkbacks, career insights, and trending tracks.
                    </p>

                    <div className="pt-2">
                      <Waveform3D isPlaying={isLive && playing} height={40} />
    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                      <button
                        onClick={handleToggleLiveStream}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#00FF00]/30 cursor-pointer w-full sm:w-auto"
                      >
                        {isLive && playing ? <Pause className="w-3.5 h-3.5 fill-slate-950 text-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950 ml-0.5" />}
                        <span>{isLive && playing ? 'Pause Broadcast' : 'Listen Live'}</span>
                      </button>

                      <span className="text-xs text-slate-400 font-semibold text-center sm:text-left">
                        Host: <span className="text-white font-bold">{currentLiveSlot?.rj}</span>
                      </span>
    </div>
    </div>
    </div>
              </section>

              {/* SECTION: FEATURED SHOWS */}
              <section className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00FF00]">Weekly Catalog</span>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">Featured Shows</h2>
    </div>
                  <button
                    onClick={() => navigateTo('shows')}
                    className="text-xs font-bold text-[#00FF00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Browse All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
    </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {programs.filter((p) => p.featured).slice(0, 4).map((prog) => (
                    <ProgramCard
                      key={prog.id}
                      p={prog}
                      onPlay={handlePlayProgram}
                      showBookmark={false}
                    />
                  ))}
    </div>
              </section>

              {/* SECTION: POPULAR EPISODES FROM THE VAULT */}
              <section className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00FF00]">On-Demand Vault</span>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">Popular Episodes</h2>
    </div>
                  <button
                    onClick={() => navigateTo('archive')}
                    className="text-xs font-bold text-[#00FF00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore All ({programs.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
    </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {programs.slice(0, 6).map((prog) => (
                    <div
                      key={prog.id}
                      className="card-warm rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-[#0E1A0E] border border-[#00FF00]/20 flex flex-col justify-between hover:border-[#00FF00]/50 hover:shadow-xl hover:shadow-[#00FF00]/10 transition-all group"
                    >
                      <div className="space-y-3">
                        {/* Badges: Category, Language & Duration */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                              {prog.cat.replace('-', ' ')}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700/60">
                              {prog.lang}
                            </span>
          </div>
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-[#00FF00]" />
                            {prog.duration}
                          </span>
        </div>

                        {/* Title & Description with full wrap */}
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-[#00FF00] transition-colors break-words">
                            {prog.title}
                          </h4>
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mt-1.5">
                            {prog.desc}
                          </p>
        </div>
      </div>

                      {/* Footer: Broadcaster + Drive Link + Play Button */}
                      <div className="mt-4 pt-3.5 border-t border-[#00FF00]/15 flex items-center justify-between gap-3">
                        <div className="min-w-0 pr-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Broadcaster</span>
                          <span className="text-xs font-semibold text-white truncate block">
                            {prog.rj}
                          </span>
        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {prog.driveUrl && (
                            <a
                              href={prog.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Open Google Drive Recording"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => handlePlayProgram(prog)}
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#00FF00]/30 cursor-pointer"
                            aria-label={`Play ${prog.title}`}
                          >
                            <Play className="w-4 h-4 ml-0.5 fill-slate-950 text-slate-950" />
                          </button>
        </div>
      </div>
    </div>
                  ))}
    </div>
              </section>

              {/* SECTION: MEET OUR RJS */}
              <section className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00FF00]">Broadcaster Roster</span>
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">Meet Our Radio Jockeys</h2>
    </div>
                  <button
                    onClick={() => navigateTo('rjs')}
                    className="text-xs font-bold text-[#00FF00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Meet All RJs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
    </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {rjs.slice(0, 3).map((r, i) => (
                    <div
                      key={i}
                      className="card-warm p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 hover:border-[#00FF00]/50 hover:shadow-xl transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div
                            className="w-13 h-13 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-white shadow-md shadow-[#00FF00]/30 bg-gradient-to-tr from-[#00FF00] to-[#10B981]"
                          >
                            {r.initials}
          </div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                            {r.badge || 'Broadcaster'}
                          </span>
        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white">{r.alias}</h3>
                          <p className="text-xs text-slate-400">{r.name} · {r.dept}</p>
        </div>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{r.bio}</p>
      </div>

                      <div className="mt-5 pt-3.5 border-t border-[#00FF00]/15">
                        <button
                          onClick={() => handlePlayRJ(r)}
                          className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#00FF00] to-[#10B981] hover:from-[#33FF33] hover:to-[#059669] text-slate-950 font-black font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md shadow-[#00FF00]/30"
                        >
                          <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                          <span>Voice Introduction</span>
                        </button>
      </div>
    </div>
                  ))}
    </div>
              </section>

              {/* SECTION: TUNER & CAMPUS STATS */}
              <section className="card-warm p-4 sm:p-10 rounded-2xl sm:rounded-3xl bg-[#0E1A0E] border border-[#00FF00]/20 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center shadow-xl">
                <div className="lg:col-span-6 space-y-4 min-w-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 text-xs font-bold uppercase tracking-wider">
                    <RadioTower className="w-3.5 h-3.5" />
                    <span>Campus Transmission Network</span>
    </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white break-words">
                    Broadcasting on <span className="text-[#00FF00]">90.4 MHz FM</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    SMCF Radio operates an authorized campus broadcasting studio with physical transmission across SGT University and surrounding Gurugram academic hubs, complemented by this 24/7 digital SaaS stream.
                  </p>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
                    <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#060E06] border border-[#00FF00]/20 text-center">
                      <div className="text-xl sm:text-2xl font-display font-extrabold text-[#00FF00]">13</div>
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-0.5 truncate">Vaults</div>
    </div>
                    <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#060E06] border border-[#00FF00]/20 text-center">
                      <div className="text-xl sm:text-2xl font-display font-extrabold text-[#00FF00]">6</div>
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-0.5 truncate">Student RJs</div>
    </div>
                    <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#060E06] border border-[#00FF00]/20 text-center">
                      <div className="text-xl sm:text-2xl font-display font-extrabold text-teal-400">90.4</div>
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mt-0.5 truncate">FM Band</div>
    </div>
    </div>
    </div>

                <div className="lg:col-span-6 flex justify-center min-w-0 w-full overflow-hidden">
                  <TunerStrip />
    </div>
              </section>
            </motion.div>
          )}

          {/* ======================================================= */}
          {/* 2. PUBLIC WEBSITE: LIVE RADIO VIEW */}
          {/* ======================================================= */}
          {currentPage === 'live' && (
            <LiveRadioView
              isLive={isLive}
              playing={playing}
              onPlayLive={handlePlayLiveStream}
              onPause={() => setPlaying(false)}
              schedule={schedule}
              listeners={listeners}
              programs={programs}
              onPlayProgram={handlePlayProgram}
              onRequestSong={() =>
                handleRequestSubscriberAction('Live Song Requests', () => navigateTo('portal-requests'))
              }
            />
          )}

          {/* ======================================================= */}
          {/* 3. PUBLIC WEBSITE: SHOWS DIRECTORY */}
          {/* ======================================================= */}
          {currentPage === 'shows' && (
            <ShowsDirectoryView
              programs={programs}
              categories={CATEGORIES}
              onPlayProgram={handlePlayProgram}
            />
          )}

          {/* ======================================================= */}
          {/* 4. PUBLIC WEBSITE: EPISODE ARCHIVE / LIBRARY */}
          {/* ======================================================= */}
          {currentPage === 'archive' && (
            <EpisodeArchiveView
              programs={programs}
              onPlayProgram={handlePlayProgram}
              currentUserId={user?.id}
              onCommentEpisode={(item) =>
                handleRequestSubscriberAction(`Comments on "${item.title}"`, () => navigateTo('portal-comments'))
              }
            />
          )}

          {/* ======================================================= */}
          {/* 5. PUBLIC WEBSITE: RJ PROFILES */}
          {/* ======================================================= */}
          {currentPage === 'rjs' && (
            <RJProfilesView rjs={rjs} onPlayRJVoice={handlePlayRJ} />
          )}

          {/* ======================================================= */}
          {/* 6. PUBLIC WEBSITE: ANNOUNCEMENTS */}
          {/* ======================================================= */}
          {currentPage === 'announcements' && (
            <AnnouncementsView announcements={announcements} />
          )}

          {/* ======================================================= */}
          {/* 7. PUBLIC WEBSITE: ABOUT */}
          {/* ======================================================= */}
          {currentPage === 'about' && <AboutView />}

          {/* ======================================================= */}
          {/* 8. PUBLIC WEBSITE: CONTACT */}
          {/* ======================================================= */}
          {currentPage === 'contact' && <ContactView />}

          {/* ======================================================= */}
          {/* 9. STUDENT PORTAL (Dashboard, Library, Playlists, Comments, Requests, Subscription, Profile) */}
          {/* ======================================================= */}
          {(currentPage === 'portal' ||
            currentPage === 'portal-library' ||
            currentPage === 'portal-requests' ||
            currentPage === 'portal-playlists' ||
            currentPage === 'portal-comments' ||
            currentPage === 'portal-subscription' ||
            currentPage === 'portal-profile') && (
            <StudentPortal
              onPlay={handlePlayProgram}
              onNavigateHome={() => navigateTo('home')}
              initialTab={
                currentPage === 'portal-library'
                  ? 'bookmarks'
                  : currentPage === 'portal-requests'
                  ? 'requests'
                  : currentPage === 'portal-playlists'
                  ? 'playlists'
                  : currentPage === 'portal-comments'
                  ? 'comments'
                  : currentPage === 'portal-subscription'
                  ? 'subscription'
                  : currentPage === 'portal-profile'
                  ? 'profile'
                  : 'overview'
              }
            />
          )}

          {/* ======================================================= */}
          {/* 10. RJ / CREATOR STUDIO */}
          {/* ======================================================= */}
          {(currentPage === 'creator' ||
            currentPage === 'creator-episodes' ||
            currentPage === 'creator-upload') && (
            <RJStudio
              currentUser={user}
              onNavigateHome={() => navigateTo('home')}
              onPlayProgram={handlePlayProgram}
              initialTab={currentPage === 'creator-upload' ? 'upload' : 'episodes'}
            />
          )}

          {/* ======================================================= */}
          {/* 11. ADMIN CONSOLE */}
          {/* ======================================================= */}
          {(currentPage === 'admin' ||
            currentPage === 'admin-live' ||
            currentPage === 'admin-upload' ||
            currentPage === 'admin-shows' ||
            currentPage === 'admin-episodes' ||
            currentPage === 'admin-analytics' ||
            currentPage === 'admin-comments' ||
            currentPage === 'admin-requests' ||
            currentPage === 'admin-students' ||
            currentPage === 'admin-subscribers' ||
            currentPage === 'admin-rjs' ||
            currentPage === 'admin-schedule' ||
            currentPage === 'admin-announcements' ||
            currentPage === 'admin-settings') && (
            <AdminConsole
              isLive={isLive}
              setIsLive={setIsLive}
              nowPlaying={nowPlaying}
              setNowPlaying={setNowPlaying}
              listeners={listeners}
              onPlayProgram={handlePlayProgram}
              onNavigateHome={() => navigateTo('home')}
              initialTab={
                currentPage === 'admin-live'
                  ? 'live'
                  : currentPage === 'admin-upload'
                  ? 'upload'
                  : currentPage === 'admin-shows'
                  ? 'shows'
                  : currentPage === 'admin-episodes'
                  ? 'episodes'
                  : currentPage === 'admin-analytics'
                  ? 'analytics'
                  : currentPage === 'admin-comments'
                  ? 'comments'
                  : currentPage === 'admin-requests'
                  ? 'requests'
                  : currentPage === 'admin-students'
                  ? 'students'
                  : currentPage === 'admin-subscribers'
                  ? 'subscribers'
                  : currentPage === 'admin-rjs'
                  ? 'rjs'
                  : currentPage === 'admin-schedule'
                  ? 'schedule'
                  : currentPage === 'admin-announcements'
                  ? 'announcements'
                  : currentPage === 'admin-settings'
                  ? 'settings'
                  : 'overview'
              }
            />
          )}

          {/* ======================================================= */}
          {/* 12. AUTH VIEW */}
          {/* ======================================================= */}
          {currentPage === 'auth' && (
            <div className="py-8 flex items-center justify-center">
              <AuthView onSuccess={() => navigateTo('portal')} />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* University Footer - Shown only on public website */}
      {!isDashboardPage && <Footer onNavigate={navigateTo} />}

      {/* User-Approved Sleek Bottom NowPlayingBar (Single-row, persistent, adaptive theme) */}
      <NowPlayingBar
        isLive={isLive}
        nowPlaying={nowPlaying}
        playing={playing}
        setPlaying={setPlaying}
        listeners={listeners}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isLoading={isLoading}
        errorMessage={errorMessage}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        theme={isDashboardPage ? 'light' : 'dark'}
      />
      {/* 100% Free Campus Subscription Dialog */}
      <FreeSubscriptionModal
        isOpen={freeSubModalOpen}
        onClose={() => setFreeSubModalOpen(false)}
        actionTitle={freeSubActionTitle}
        onOpenAuth={(tab) => {
          navigateTo('auth');
        }}
        onActivated={() => {
          // If the user was trying to access a page, navigate or let them continue
        }}
      />
    </div>
  );
}
