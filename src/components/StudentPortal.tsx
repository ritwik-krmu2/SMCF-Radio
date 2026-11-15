import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Play,
  Clock,
  Music,
  Send,
  MessageSquare,
  UserCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
  Headphones,
  User as UserIcon,
  ChevronRight,
  ListMusic,
  Volume2,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  LayoutGrid,
  Radio,
  Settings,
  Menu,
  X,
  History,
  RadioTower,
  Plus,
  Edit2,
  ShieldCheck,
  AlertCircle,
  Check,
  FolderPlus,
} from 'lucide-react';
import { Program, SongRequest, Comment, ListenHistoryItem, Playlist } from '../types';
import { databaseService } from '../services/databaseService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { AuthView } from './AuthView';
import { HeadphonesHeroIllustration } from './DashboardIllustrations';

export type StudentTab =
  | 'overview'
  | 'bookmarks'
  | 'history'
  | 'comments'
  | 'requests'
  | 'playlists'
  | 'subscription'
  | 'profile';

interface StudentPortalProps {
  onPlay: (p: Program) => void;
  onNavigateHome?: () => void;
  initialTab?: StudentTab | 'feedback';
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  onPlay,
  onNavigateHome,
  initialTab = 'overview',
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<StudentTab>(
    initialTab === 'feedback' ? 'comments' : (initialTab as StudentTab)
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initialTab when props change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'feedback' ? 'comments' : (initialTab as StudentTab));
    }
  }, [initialTab]);

  // Database-driven states
  const [programs, setPrograms] = useState<Program[]>(() => databaseService.getPrograms());
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [history, setHistory] = useState<ListenHistoryItem[]>([]);
  const [myRequests, setMyRequests] = useState<SongRequest[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  // Subscriber entitlement status
  const isSubscriber = Boolean(user && authService.isSubscriber(user));

  // Song Request Form State
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [dedicatedTo, setDedicatedTo] = useState('');
  const [songMessage, setSongMessage] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Feedback / Comments Form State
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number>(1);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Playlist Form State
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [playlistNotice, setPlaylistNotice] = useState<string | null>(null);

  // Subscription management state
  const [subNotice, setSubNotice] = useState<string | null>(null);

  // Load user data on change
  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      setPrograms(databaseService.getPrograms());
      setBookmarkedIds(databaseService.getBookmarks(user.id));
      setHistory(databaseService.getListeningHistory(user.id));
      setComments(databaseService.getComments());
      setPlaylists(databaseService.getPlaylists(user.id));

      const allRequests = databaseService.getSongRequests();
      setMyRequests(
        allRequests.filter(
          (r) =>
            (r.userId && r.userId === user.id) ||
            r.from.toLowerCase().includes(user.name.toLowerCase()) ||
            r.from.toLowerCase().includes(user.email.toLowerCase())
        )
      );
    };

    loadData();
    const unsub = databaseService.subscribe(loadData);
    return unsub;
  }, [user]);

  const handleToggleBookmark = (episodeId: number) => {
    if (!user) return;
    databaseService.toggleBookmark(user.id, episodeId);
    setBookmarkedIds(databaseService.getBookmarks(user.id));
  };

  const handleSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isSubscriber) {
      setRequestError('Active campus subscription entitlement required to submit song requests.');
      return;
    }

    if (!songTitle.trim() || !songArtist.trim()) return;

    try {
      databaseService.submitSongRequest({
        song: songTitle.trim(),
        by: songArtist.trim(),
        from: `${user.name} (${user.department})`,
        userId: user.id,
        dedicatedTo: dedicatedTo.trim() || undefined,
        message: songMessage.trim() || undefined,
      });

      setRequestSubmitted(true);
      setRequestError(null);
      setSongTitle('');
      setSongArtist('');
      setDedicatedTo('');
      setSongMessage('');
      setTimeout(() => setRequestSubmitted(false), 3000);
    } catch (err: any) {
      setRequestError(err.message || 'Unable to transmit request.');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isSubscriber) {
      setCommentError('Active campus subscription entitlement required to post comments.');
      return;
    }

    if (!commentText.trim()) return;

    try {
      const prog = programs.find((p) => p.id === selectedEpisodeId) || programs[0];

      databaseService.submitComment({
        program: prog.title,
        programId: prog.id,
        author: `${user.name} (${user.department})`,
        userId: user.id,
        text: commentText.trim(),
        status: 'approved',
      });

      setCommentSubmitted(true);
      setCommentError(null);
      setCommentText('');
      setTimeout(() => setCommentSubmitted(false), 3000);
    } catch (err: any) {
      setCommentError(err.message || 'Failed to submit review.');
    }
  };

  const handleSaveEditComment = (id: number) => {
    if (!editingCommentText.trim() || !user) return;
    try {
      databaseService.editComment(id, editingCommentText.trim(), user.id);
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteComment = (id: number) => {
    if (!user) return;
    if (confirm('Delete this comment?')) {
      try {
        databaseService.deleteComment(id, user.id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPlaylistTitle.trim()) return;

    if (!isSubscriber) {
      alert('Active subscription required to create personal playlists.');
      return;
    }

    const created = databaseService.createPlaylist({
      userId: user.id,
      title: newPlaylistTitle.trim(),
      description: newPlaylistDesc.trim() || undefined,
      episodeIds: [programs[0]?.id || 1],
    });

    setPlaylists(databaseService.getPlaylists(user.id));
    setActivePlaylistId(created.id);
    setNewPlaylistTitle('');
    setNewPlaylistDesc('');
    setShowCreatePlaylist(false);
    setPlaylistNotice(`Created playlist "${created.title}"!`);
    setTimeout(() => setPlaylistNotice(null), 3000);
  };

  const handleDeletePlaylist = (id: string) => {
    if (!user) return;
    if (confirm('Delete this playlist?')) {
      databaseService.deletePlaylist(id, user.id);
      setPlaylists(databaseService.getPlaylists(user.id));
      if (activePlaylistId === id) setActivePlaylistId(null);
    }
  };

  const handlePlayAllPlaylist = (pl: Playlist) => {
    if (pl.episodeIds.length === 0) {
      alert('This playlist has no episodes yet. Add episodes from your library or shows catalog.');
      return;
    }
    const firstProg = programs.find((p) => p.id === pl.episodeIds[0]);
    if (firstProg) {
      onPlay(firstProg);
      setPlaylistNotice(`Now playing playlist: "${pl.title}" (${pl.episodeIds.length} tracks queued)`);
      setTimeout(() => setPlaylistNotice(null), 4000);
    }
  };

  const handleToggleSubscription = (targetStatus: 'active' | 'not_subscribed' | 'suspended' | 'deactivated') => {
    if (!user) return;
    authService.updateSubscription(
      user.id,
      targetStatus,
      'campus-free'
    );
    user.subscriptionStatus = targetStatus;
    setSubNotice(`Subscription entitlement updated to: ${targetStatus.toUpperCase()}`);
    setTimeout(() => setSubNotice(null), 3500);
  };

  if (!user) {
    return (
      <section className="w-full min-h-[75vh] flex items-center justify-center p-4 sm:p-8 bg-[#F7F8F5]">
        <AuthView onSuccess={() => setActiveTab('overview')} />
      </section>
    );
  }

  const bookmarkedPrograms = programs.filter((p) => bookmarkedIds.includes(p.id));

  // Navigation items covering student and subscriber features
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
    { id: 'bookmarks', label: 'My Library', icon: Bookmark },
    { id: 'history', label: 'Listening History', icon: History },
    { id: 'comments', label: 'Comments & Reviews', icon: MessageSquare },
    { id: 'requests', label: 'Send Requests', icon: Music },
    { id: 'playlists', label: 'My Playlists', icon: ListMusic },
    { id: 'subscription', label: 'Subscription', icon: Sparkles },
    { id: 'profile', label: 'Profile Details', icon: UserIcon },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F7F8F5] text-[#202820] flex flex-col lg:flex-row antialiased font-sans">
      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR (CYBER STATION BRANDING - EXACT PALETTE MATCH)   */}
      {/* ================================================================= */}
      <aside className="w-full lg:w-60 bg-[#060B06] border-b lg:border-b-0 lg:border-r border-[#00FF00]/20 flex flex-col justify-between shrink-0 p-4 sm:p-5 text-white">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.hash = '/';
              }}
              className="flex items-center gap-3 cursor-pointer group"
              title="Return to Public Site"
            >
              <div className="w-10 h-10 rounded-full bg-[#0E1A0E] border border-[#00FF00]/30 shadow-[0_0_12px_rgba(0,255,0,0.15)] flex items-center justify-center text-white group-hover:border-[#00FF00] transition-colors">
                <Radio className="w-5 h-5 text-[#00FF00]" />
              </div>
              <div>
                <span className="font-extrabold text-xs tracking-tight text-white block">
                  SMCF RADIO
                </span>
                <span className="text-[9px] text-[#00FF00] tracking-widest uppercase font-semibold block">
                  STUDENT PORTAL
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#00FF00]/10"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`space-y-1.5 ${mobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileSidebarOpen(false);
                    if (item.id === 'overview') window.location.hash = '/portal';
                    else if (item.id === 'bookmarks') window.location.hash = '/portal-library';
                    else if (item.id === 'requests') window.location.hash = '/portal-requests';
                    else if (item.id === 'profile') window.location.hash = '/portal-profile';
                  }}
                  className={`w-full relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/30 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#00FF00]/10'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#00FF00] shadow-[0_0_8px_#00FF00]" />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00FF00]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-[#00FF00]/15" />

            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileSidebarOpen(false);
                window.location.hash = '/portal-profile';
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/30 font-bold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-[#00FF00]/10'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#00FF00]' : 'text-slate-400'}`} />
              <span>Settings</span>
            </button>

            {/* Public Main Site Return Button */}
            <div className="pt-2 border-t border-[#00FF00]/15">
              <button
                onClick={() => {
                  if (onNavigateHome) onNavigateHome();
                  else window.location.hash = '/';
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-[#00FF00]/10 border border-[#00FF00]/25 transition-all cursor-pointer group"
                title="Return to Public Radio Station"
              >
                <Radio className="w-4 h-4 text-[#00FF00] group-hover:animate-pulse" />
                <span>Public Main Site</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Profile Card: Ayush Sharma, B.Tech CSE • 3rd Year */}
        <div
          className={`pt-4 border-t border-[#00FF00]/15 ${
            mobileSidebarOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="p-2.5 rounded-2xl bg-[#0A130A] border border-[#00FF00]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80"
                alt={user?.name || "Ayush Sharma"}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#00FF00]/30 shadow-xs"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || "Ayush Sharma"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.department || "B.Tech CSE • 3rd Year"}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                if (onNavigateHome) onNavigateHome();
                else window.location.hash = '/';
              }}
              title="Sign Out / Return to Public Station"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00FF00] hover:bg-[#0E1A0E] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* 2. MAIN STUDENT WORKSPACE (EXACT MATCH TO SCREENSHOT 2)           */}
      {/* ================================================================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Header Row: Breadcrumb + Search + Bell + Help + Avatar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#778078] font-medium">
            <span>Student Portal</span>
            <span>&gt;</span>
            <span className="text-[#202820] font-bold capitalize">
              {activeTab === 'overview' ? 'Dashboard' : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778078]" />
              <input
                type="text"
                placeholder="Search episodes, shows, RJs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-60 sm:w-72 pl-9 pr-4 py-2 text-xs bg-white border border-[#E8EAE2] rounded-full text-[#202820] placeholder-[#778078] focus:outline-none focus:border-[#10B981] shadow-xs"
              />
            </div>

            <button
              title="Notifications"
              className="relative p-2.5 rounded-full bg-white border border-[#E8EAE2] text-[#778078] hover:text-[#202820] shadow-xs cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>

            <button
              title="Help & Support"
              className="p-2.5 rounded-full bg-white border border-[#E8EAE2] text-[#778078] hover:text-[#202820] shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80"
              alt="Ayush Sharma"
              className="w-9 h-9 rounded-full object-cover border border-[#E8EAE2] shadow-xs shrink-0"
            />
          </div>
        </div>

        {/* =============================================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW (EXACT SCREENSHOT 2 LAYOUT)           */}
        {/* =============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Hero Banner Card with 3D Headphones Graphic */}
            <div className="bg-gradient-to-r from-[#EAF5EC] via-[#EDF7EF] to-[#DDF0E2] border border-[#E8EAE2] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
              <div className="space-y-3 z-10 max-w-xl">
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#202820] tracking-tight">
                  Good morning, Ayush! 👋
                </h2>
                <p className="text-xs sm:text-sm text-[#5F6B61]">
                  Discover something new from your campus radio today.
                </p>

                {/* 3 White Rounded Pills */}
                <div className="flex items-center gap-2.5 flex-wrap pt-1">
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8EAE2] text-xs font-semibold text-[#202820] shadow-xs flex items-center gap-1.5">
                    <span>🔖</span> Saved Episodes: {bookmarkedIds.length || 12}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8EAE2] text-xs font-semibold text-[#202820] shadow-xs flex items-center gap-1.5">
                    <span>🕒</span> Recently Played: {history.length || 8}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8EAE2] text-xs font-semibold text-[#202820] shadow-xs flex items-center gap-1.5">
                    <span>✏️</span> Active Song Requests: {myRequests.length || 3}
                  </span>
                </div>
              </div>

              {/* 3D Floating Mint-Green Headphones Illustration */}
              <div className="shrink-0 self-center md:self-auto">
                <HeadphonesHeroIllustration className="w-52 h-32" />
              </div>
            </div>

            {/* ROW 2: Featured For You, Recently Played & Saved, Upcoming Broadcasts */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              {/* Card 1: Featured for You (approx 30%) */}
              <div className="lg:col-span-4 space-y-2">
                <h3 className="text-xs font-bold text-[#202820]">Featured for You</h3>
                <div className="bg-gradient-to-b from-[#145A42] to-[#0D3829] text-white rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs relative overflow-hidden">
                  <div className="relative rounded-xl overflow-hidden h-32 w-full">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Campus Chronicles"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      45 min
                    </span>
                    <span className="absolute bottom-2 left-2.5 text-xs font-extrabold uppercase tracking-wider text-white">
                      CAMPUS CHRONICLES
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (programs[0]) onPlay(programs[0]);
                      }}
                      className="w-9 h-9 rounded-full bg-white text-[#145A42] flex items-center justify-center shrink-0 cursor-pointer shadow-md hover:scale-105 transition-transform"
                    >
                      <Play className="w-4 h-4 ml-0.5 fill-[#145A42]" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white leading-snug line-clamp-2">
                        EP 14: Navigating 3rd Year Exams & Internships
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      alt="RJ Anya"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-[11px] text-emerald-200 font-semibold">RJ Anya • Friday, 4:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Recently Played & Saved (approx 45%) */}
              <div className="lg:col-span-5 space-y-2">
                <h3 className="text-xs font-bold text-[#202820]">Recently Played & Saved</h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* Show 1: Techno Sapiens */}
                  <div
                    onClick={() => {
                      if (programs[1]) onPlay(programs[1]);
                    }}
                    className="bg-white border border-[#E8EAE2] rounded-2xl p-2.5 space-y-2 shadow-xs cursor-pointer hover:border-[#10B981]/50 transition-colors group"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-square w-full">
                      <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"
                        alt="Techno Sapiens"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-[#145A42] flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-[#145A42]" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[11px] text-[#202820] truncate">Techno Sapiens</h4>
                      <p className="text-[10px] text-[#778078] truncate">• RJ Rohan</p>
                      <span className="text-[9px] font-semibold text-[#10B981] block mt-0.5">32m remaining</span>
                    </div>
                  </div>

                  {/* Show 2: Sur & Taal */}
                  <div
                    onClick={() => {
                      if (programs[2]) onPlay(programs[2]);
                    }}
                    className="bg-white border border-[#E8EAE2] rounded-2xl p-2.5 space-y-2 shadow-xs cursor-pointer hover:border-[#10B981]/50 transition-colors group"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-square w-full">
                      <img
                        src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80"
                        alt="Sur & Taal"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-[#145A42] flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-[#145A42]" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[11px] text-[#202820] truncate">Sur & Taal</h4>
                      <p className="text-[10px] text-[#778078] truncate">• RJ Sneha</p>
                      <span className="text-[9px] text-[#778078] block mt-0.5">50m • Played 2d ago</span>
                    </div>
                  </div>

                  {/* Show 3: The Hostel Diaries */}
                  <div
                    onClick={() => {
                      if (programs[0]) onPlay(programs[0]);
                    }}
                    className="bg-white border border-[#E8EAE2] rounded-2xl p-2.5 space-y-2 shadow-xs cursor-pointer hover:border-[#10B981]/50 transition-colors group"
                  >
                    <div className="relative rounded-xl overflow-hidden aspect-square w-full">
                      <img
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80"
                        alt="The Hostel Diaries"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-[#145A42] flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-[#145A42]" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[11px] text-[#202820] truncate">The Hostel Diaries</h4>
                      <p className="text-[10px] text-[#778078] truncate">• RJ Kabir</p>
                      <span className="text-[9px] text-[#778078] block mt-0.5">42m • Saved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Upcoming Broadcasts (approx 25%) */}
              <div className="lg:col-span-3 space-y-2">
                <h3 className="text-xs font-bold text-[#202820]">Upcoming Broadcasts</h3>
                <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 space-y-3.5 shadow-xs">
                  {/* Live Now */}
                  <div className="p-3 rounded-xl bg-[#EAF5EC] border border-[#10B981]/25 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#145A42]">Live Now</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                        LIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                        alt="RJ Neha"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#202820] truncate">Morning Raga</p>
                        <p className="text-[10px] text-[#778078] truncate">• RJ Neha • 09:00 - 10:30 AM</p>
                      </div>
                    </div>
                  </div>

                  {/* Next */}
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-[#778078]">Next</span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80"
                          alt="RJ Aryan"
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#202820] text-xs truncate">SGT Sports Pulse</p>
                          <p className="text-[10px] text-[#778078] truncate">• RJ Aryan</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#778078] shrink-0">12:30 PM</span>
                    </div>
                  </div>

                  {/* Friday Jam */}
                  <div className="pt-2 border-t border-[#E8EAE2] text-[11px] text-[#778078]">
                    <p className="font-semibold text-[#202820]">Friday Jam Request Session</p>
                    <p className="text-[10px] text-[#10B981]">tomorrow, 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold text-[#202820]">Quick Actions:</span>
              <button
                onClick={() => setActiveTab('requests')}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#EAF5EC] text-[#145A42] hover:bg-[#DDF0E2] transition-colors cursor-pointer shadow-xs"
              >
                🎵 Request a Song
              </button>
              <button
                onClick={() => (window.location.hash = '/shows')}
                className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-[#E8EAE2] text-[#202820] hover:bg-[#F8F9FA] transition-colors cursor-pointer shadow-xs"
              >
                📻 Explore Shows
              </button>
              <button
                onClick={() => (window.location.hash = '/archive')}
                className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-[#E8EAE2] text-[#202820] hover:bg-[#F8F9FA] transition-colors cursor-pointer shadow-xs"
              >
                🎧 Browse Episodes
              </button>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 2: MY LIBRARY (BOOKMARKS)                                   */}
        {/* =============================================================== */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#202820]">Your Saved Audio Library</h3>
              <span className="text-xs text-[#778078]">{bookmarkedPrograms.length} items saved</span>
            </div>

            {bookmarkedPrograms.length === 0 ? (
              <div className="bg-white border border-[#E8EAE2] rounded-2xl py-16 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#F0F2EC] text-[#778078] flex items-center justify-center mx-auto">
                  <Bookmark className="w-6 h-6 text-[#778078]" />
                </div>
                <h4 className="text-sm font-bold text-[#202820]">Your library is empty</h4>
                <p className="text-xs text-[#778078] max-w-sm mx-auto">
                  Browse the public episode catalog or shows directory and click the bookmark icon to save episodes here for easy listening.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedPrograms.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        onClick={() => onPlay(p)}
                        className="w-11 h-11 rounded-xl bg-[#EAF5EC] text-[#10B981] flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:bg-[#10B981] hover:text-white transition-colors"
                      >
                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                      </button>

                      <div className="min-w-0 space-y-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#F8F9FA] text-[#778078] border border-[#E8EAE2]">
                          {p.cat}
                        </span>
                        <h4 className="text-sm font-bold text-[#202820] truncate">{p.title}</h4>
                        <p className="text-xs text-[#778078] truncate">{p.rj} · {p.duration} · {p.plays.toLocaleString()} plays</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleBookmark(p.id)}
                        className="p-2 rounded-full hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 3: LISTENING HISTORY                                          */}
        {/* =============================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202820]">Listening History</h3>

            {history.length === 0 ? (
              <div className="bg-white border border-[#E8EAE2] rounded-2xl py-16 text-center space-y-3 shadow-xs">
                <Clock className="w-8 h-8 text-[#778078] mx-auto" />
                <h4 className="text-sm font-bold text-[#202820]">No listening history yet</h4>
                <p className="text-xs text-[#778078]">Play any campus show to automatically record your listening logs.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E8EAE2] rounded-2xl divide-y divide-[#E8EAE2] overflow-hidden shadow-xs">
                {history.map((h) => {
                  const prog = programs.find((p) => p.id === h.episodeId);
                  return (
                    <div key={h.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#F8F9FA] transition-colors">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#202820] truncate">{h.title}</h4>
                        <p className="text-[10px] text-[#778078]">
                          {h.rj} · Played on {new Date(h.playedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {prog && (
                        <button
                          onClick={() => onPlay(prog)}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAF5EC] text-[#145A42] flex items-center gap-1 cursor-pointer hover:bg-[#DDF0E2] transition-colors"
                        >
                          <Play className="w-3 h-3 ml-0.5 fill-current" />
                          <span>Replay</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4: SEND REQUESTS (SUBSCRIBER ONLY)                          */}
        {/* =============================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {!isSubscriber && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-[#202820]">Campus Subscription Entitlement Required</p>
                    <p className="text-[#778078]">Song dedications and broadcast requests are available to authorized subscribers.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSubscription('active')}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
                >
                  Activate Campus Pass
                </button>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6 bg-white border border-[#E8EAE2] rounded-2xl p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#202820] flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#10B981]" />
                    <span>Send Song & Broadcast Request</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF5EC] text-[#145A42]">
                    Subscriber Priority
                  </span>
                </div>

                {requestError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{requestError}</span>
                  </div>
                )}

                {requestSubmitted ? (
                  <div className="p-6 text-center space-y-2 bg-[#EAF5EC] rounded-2xl border border-[#10B981]/25">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                    <h4 className="text-sm font-bold text-[#202820]">Song Request Transmitted!</h4>
                    <p className="text-xs text-[#778078]">Our student broadcaster will review it for the upcoming broadcast.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSongSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Song Title *</label>
                      <input
                        type="text"
                        required
                        disabled={!isSubscriber}
                        placeholder="e.g. Kasoor, Kun Faya Kun, Yellow"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981] disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Artist / Band *</label>
                      <input
                        type="text"
                        required
                        disabled={!isSubscriber}
                        placeholder="e.g. Prateek Kuhad, A.R. Rahman, Coldplay"
                        value={songArtist}
                        onChange={(e) => setSongArtist(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981] disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Shoutout / Dedicated To</label>
                      <input
                        type="text"
                        disabled={!isSubscriber}
                        placeholder="e.g. All CSE batchmates preparing for semester exams!"
                        value={dedicatedTo}
                        onChange={(e) => setDedicatedTo(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981] disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Personal Message to RJ (Optional)</label>
                      <textarea
                        rows={2}
                        disabled={!isSubscriber}
                        placeholder="Add a special broadcast note, memory, or greeting..."
                        value={songMessage}
                        onChange={(e) => setSongMessage(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981] disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!isSubscriber}
                      className="w-full py-2.5 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-[#059669] flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transmit Song Request</span>
                    </button>
                  </form>
                )}
              </div>

              <div className="lg:col-span-6 space-y-3">
                <h3 className="text-base font-bold text-[#202820]">Your Request History & Status</h3>

                {myRequests.length === 0 ? (
                  <div className="bg-white border border-[#E8EAE2] rounded-2xl p-8 text-center text-xs text-[#778078] shadow-xs">
                    You have no active song requests submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRequests.map((req) => {
                      const isPending = req.status === 'pending';
                      const isApproved = req.status === 'approved' || req.status === 'queued';
                      const isPlayed = req.status === 'played' || req.status === 'completed';
                      const isRejected = req.status === 'rejected' || req.status === 'dismissed';

                      return (
                        <div key={req.id} className="bg-white border border-[#E8EAE2] rounded-2xl p-4 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isPlayed
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {req.status === 'pending' ? 'Under Review' : req.status}
                            </span>
                            <span className="text-[10px] font-mono text-[#778078]">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Active'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#202820]">{req.song}</h4>
                          <p className="text-xs text-[#778078]">By {req.by}</p>
                          {req.dedicatedTo && (
                            <p className="text-[11px] text-[#10B981] italic">Dedicated to: {req.dedicatedTo}</p>
                          )}
                          {req.message && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">"{req.message}"</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 5: COMMENTS & REVIEWS (SUBSCRIBER ONLY)                     */}
        {/* =============================================================== */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            {!isSubscriber && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-[#202820]">Campus Subscription Entitlement Required</p>
                    <p className="text-[#778078]">Posting comments and reviews on station episodes requires an active subscription.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSubscription('active')}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
                >
                  Activate Campus Pass
                </button>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5 bg-white border border-[#E8EAE2] rounded-2xl p-6 space-y-4 shadow-xs">
                <h3 className="text-base font-bold text-[#202820] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#10B981]" />
                  <span>Submit Episode Review</span>
                </h3>

                {commentError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{commentError}</span>
                  </div>
                )}

                {commentSubmitted ? (
                  <div className="p-6 text-center space-y-2 bg-[#EAF5EC] rounded-2xl border border-[#10B981]/25">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                    <h4 className="text-sm font-bold text-[#202820]">Review Submitted!</h4>
                    <p className="text-xs text-[#778078]">Your comment is processed and viewable by our broadcast community.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Select Episode / Show *</label>
                      <select
                        disabled={!isSubscriber}
                        value={selectedEpisodeId}
                        onChange={(e) => setSelectedEpisodeId(Number(e.target.value))}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
                      >
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.rj})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Your Review / Comments *</label>
                      <textarea
                        required
                        disabled={!isSubscriber}
                        rows={4}
                        placeholder="Share feedback on discussion pacing, audio levels, or topics..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981] disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!isSubscriber}
                      className="w-full py-2.5 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-[#059669] flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Subscriber Feedback</span>
                    </button>
                  </form>
                )}
              </div>

              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#202820]">Community & Personal Reviews</h3>
                  <span className="text-xs text-[#778078]">{comments.length} total comments</span>
                </div>

                <div className="bg-white border border-[#E8EAE2] rounded-2xl divide-y divide-[#E8EAE2] max-h-[500px] overflow-y-auto shadow-xs">
                  {comments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#778078]">No comments posted yet.</div>
                  ) : (
                    comments.map((c) => {
                      const isMyComment = (c.userId && c.userId === user.id) || c.author.includes(user.name);
                      const isEditing = editingCommentId === c.id;

                      return (
                        <div key={c.id} className="p-4 space-y-2 hover:bg-[#FDFDFD] transition-colors">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#202820]">{c.author}</span>
                              {isMyComment && (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-[#EAF5EC] text-[#145A42]">
                                  You
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                                  c.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : c.status === 'rejected' || c.status === 'removed'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#778078]">
                              {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#145A42] font-semibold">Episode: {c.program}</p>

                          {isEditing ? (
                            <div className="space-y-2 pt-1">
                              <textarea
                                rows={2}
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                                className="w-full p-2 text-xs border border-[#10B981] rounded-lg focus:outline-none"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSaveEditComment(c.id)}
                                  className="px-3 py-1 bg-[#10B981] text-white rounded-lg text-[11px] font-bold cursor-pointer"
                                >
                                  Save Edit
                                </button>
                                <button
                                  onClick={() => setEditingCommentId(null)}
                                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-[#202820] leading-relaxed">{c.text}</p>
                          )}

                          {isMyComment && !isEditing && (
                            <div className="flex items-center gap-3 pt-1 text-[11px]">
                              <button
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditingCommentText(c.text);
                                }}
                                className="text-slate-600 hover:text-[#10B981] flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 6: MY PLAYLISTS (SUBSCRIBER ONLY)                            */}
        {/* =============================================================== */}
        {activeTab === 'playlists' && (
          <div className="space-y-6">
            {!isSubscriber && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-[#202820]">Campus Subscription Entitlement Required</p>
                    <p className="text-[#778078]">Creating and managing personal radio playlists is a subscriber privilege.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSubscription('active')}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
                >
                  Activate Campus Pass
                </button>
              </div>
            )}

            {playlistNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{playlistNotice}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#202820]">Personal Radio Playlists</h3>
                <p className="text-xs text-[#778078]">Organize campus podcasts and shows into custom listening queues.</p>
              </div>
              <button
                disabled={!isSubscriber}
                onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>New Playlist</span>
              </button>
            </div>

            {/* Create Playlist Form */}
            {showCreatePlaylist && (
              <form onSubmit={handleCreatePlaylist} className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-4 shadow-sm text-xs">
                <h4 className="font-bold text-sm text-[#202820]">Create a Personal Playlist</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[#202820] font-semibold mb-1">Playlist Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hostels Exam Revision Mix"
                      value={newPlaylistTitle}
                      onChange={(e) => setNewPlaylistTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#202820] font-semibold mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Deep discussions and evening motivation"
                      value={newPlaylistDesc}
                      onChange={(e) => setNewPlaylistDesc(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer transition-colors"
                  >
                    Save Playlist
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePlaylist(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Playlists Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((pl) => {
                const isSelected = activePlaylistId === pl.id;
                const plPrograms = programs.filter((p) => pl.episodeIds.includes(p.id));

                return (
                  <div
                    key={pl.id}
                    className={`bg-white border rounded-2xl p-5 space-y-4 shadow-xs transition-all ${
                      isSelected ? 'border-[#10B981] ring-2 ring-[#10B981]/20' : 'border-[#E8EAE2]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF5EC] text-[#145A42] flex items-center justify-center shrink-0">
                        <ListMusic className="w-5 h-5 text-[#10B981]" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePlayAllPlaylist(pl)}
                          title="Play entire playlist"
                          className="p-2 rounded-xl bg-[#10B981] text-white hover:bg-[#059669] transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                        </button>
                        <button
                          onClick={() => handleDeletePlaylist(pl.id)}
                          title="Delete playlist"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#202820] truncate">{pl.title}</h4>
                      <p className="text-xs text-[#778078] line-clamp-2 mt-0.5">{pl.description || 'Personal campus mix'}</p>
                    </div>

                    <div className="pt-2 border-t border-[#E8EAE2] flex items-center justify-between text-xs text-[#778078]">
                      <span>{pl.episodeIds.length} episodes</span>
                      <button
                        onClick={() => setActivePlaylistId(isSelected ? null : pl.id)}
                        className="font-bold text-[#10B981] hover:underline cursor-pointer"
                      >
                        {isSelected ? 'Hide Tracks' : 'Manage Tracks'}
                      </button>
                    </div>

                    {/* Expanded Tracklist & Add Dropdown */}
                    {isSelected && (
                      <div className="pt-3 border-t border-[#E8EAE2] space-y-2 text-xs animate-in fade-in duration-150">
                        <p className="font-bold text-[#202820] text-[11px]">Included Tracks:</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {plPrograms.map((track) => (
                            <div key={track.id} className="p-2 rounded-lg bg-[#F8F9FA] flex items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center gap-2 truncate">
                                <button
                                  onClick={() => onPlay(track)}
                                  className="text-[#10B981] hover:underline shrink-0"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                </button>
                                <span className="truncate">{track.title}</span>
                              </div>
                              <button
                                onClick={() => {
                                  databaseService.removeEpisodeFromPlaylist(pl.id, track.id);
                                  setPlaylists(databaseService.getPlaylists(user?.id));
                                }}
                                className="text-rose-500 hover:text-rose-700 shrink-0 cursor-pointer"
                                title="Remove track"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add Track Selector */}
                        <div className="pt-2">
                          <label className="block text-[10px] uppercase font-bold text-[#778078] mb-1">Add Track to Playlist</label>
                          <select
                            onChange={(e) => {
                              const epId = Number(e.target.value);
                              if (epId) {
                                databaseService.addEpisodeToPlaylist(pl.id, epId);
                                setPlaylists(databaseService.getPlaylists(user?.id));
                              }
                            }}
                            className="w-full p-2 text-xs bg-[#F8F9FA] border border-[#E8EAE2] rounded-lg cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>Choose an episode to add...</option>
                            {programs
                              .filter((p) => !pl.episodeIds.includes(p.id))
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  + {p.title} ({p.rj})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 7: SUBSCRIPTION MANAGEMENT                                    */}
        {/* =============================================================== */}
        {activeTab === 'subscription' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-extrabold text-[#202820]">Campus Subscription Pass</h3>
                <p className="text-xs text-[#778078]">Manage your university station listener tier and broadcast perks.</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user.subscriptionStatus === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : user.subscriptionStatus === 'suspended'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : user.subscriptionStatus === 'deactivated'
                    ? 'bg-slate-100 text-slate-700 border border-slate-300'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                ● Status: {user.subscriptionStatus?.replace('_', ' ').toUpperCase() || 'NOT SUBSCRIBED'}
              </span>
            </div>

            {subNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{subNotice}</span>
              </div>
            )}

            {/* Instant Free Activation Banner if not active */}
            {user.subscriptionStatus !== 'active' && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#202820]">100% Free Campus Subscription Available</h4>
                    <p className="text-xs text-[#778078]">
                      Free for all SGT University students. Zero charges, no hidden fees, instant activation.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSubscription('active')}
                  className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm shadow-emerald-500/20 transition-all hover:scale-102"
                >
                  Activate Free Pass Now
                </button>
              </div>
            )}

            {/* Subscription Card */}
            <div className="bg-white border border-[#E8EAE2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#047857] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#202820]">
                      {user.subscriptionTier === 'vip-pass' ? 'VIP All-Access Pass' : 'Student Campus Free Pass'}
                    </h4>
                    <p className="text-xs text-[#778078]">Sponsored by School of Emerging Media · SGT University</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#10B981] block">100% FREE · NO BILLING</span>
                  <span className="text-[10px] text-[#778078]">Valid through {user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString() : 'Dec 2027'}</span>
                </div>
              </div>

              {/* Perks Checklist */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#202820] uppercase tracking-wider">Entitlements Included:</p>
                <div className="grid gap-3 sm:grid-cols-2 text-xs text-[#202820]">
                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Submit episode comments & reviews</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Send Friday Jam song requests to RJs</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Create & manage custom playlists</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>Access high-definition studio master audio</span>
                  </div>
                </div>
              </div>

              {/* Entitlement State Switcher (University Demo Controls) */}
              <div className="pt-4 border-t border-[#E8EAE2] space-y-3 text-xs">
                <p className="font-bold text-[#778078] text-[11px] uppercase tracking-wider">
                  Entitlement State Simulation (Test Access Controls):
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleToggleSubscription('active')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 cursor-pointer transition-colors"
                  >
                    ✓ Set Active (Subscribed)
                  </button>
                  <button
                    onClick={() => handleToggleSubscription('not_subscribed')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold hover:bg-amber-100 cursor-pointer transition-colors"
                  >
                    ○ Set Not Subscribed
                  </button>
                  <button
                    onClick={() => handleToggleSubscription('suspended')}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold hover:bg-rose-100 cursor-pointer transition-colors"
                  >
                    ⚠ Set Suspended
                  </button>
                  <button
                    onClick={() => handleToggleSubscription('deactivated')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-bold hover:bg-slate-200 cursor-pointer transition-colors"
                  >
                    ✕ Set Deactivated
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 8: PROFILE DETAILS                                            */}
        {/* =============================================================== */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-[#E8EAE2] rounded-2xl max-w-xl mx-auto p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80"
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border border-[#E8EAE2]"
              />
              <div>
                <h2 className="text-xl font-bold text-[#202820]">{user.name}</h2>
                <p className="text-xs text-[#778078]">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#EAF5EC] text-[#145A42]">
                    {user.role} Account
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {user.subscriptionStatus || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#202820]">
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2]">
                <span className="text-[#778078] block text-[10px] uppercase font-bold mb-0.5">Academic Department</span>
                <span className="font-semibold">{user.department}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2]">
                <span className="text-[#778078] block text-[10px] uppercase font-bold mb-0.5">Student Registration ID</span>
                <span className="font-mono font-semibold">{user.studentId || '220101048'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2]">
                <span className="text-[#778078] block text-[10px] uppercase font-bold mb-0.5">Program</span>
                <span className="font-semibold">B.Tech Computer Science & Engineering (3rd Year)</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
