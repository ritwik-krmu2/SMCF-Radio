import React, { useState, useEffect } from 'react';
import {
  Mic,
  PlusCircle,
  FileAudio,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  AlertTriangle,
  Send,
  Radio,
  Music,
  ExternalLink,
  Play,
  Layers,
  Sparkles,
  Calendar,
  User as UserIcon,
  Search,
  Check,
  UploadCloud,
  Bell,
  HelpCircle,
  LogOut,
  Tv,
  MessageSquare,
  Menu,
  X,
  Settings,
  Headphones,
} from 'lucide-react';
import { User, Program, RJ, SongRequest, ScheduleItem } from '../types';
import { CATEGORIES } from '../data';
import { databaseService } from '../services/databaseService';
import { formatAudioUrl, isGoogleDriveUrl } from '../utils/audioUrl';
import { StudioMicHeroIllustration } from './DashboardIllustrations';

interface RJStudioProps {
  currentUser: User | null;
  onNavigateHome: () => void;
  onPlayProgram: (prog: Program) => void;
  initialTab?: 'overview' | 'shows' | 'episodes' | 'upload' | 'schedule' | 'requests' | 'profile';
}

export const RJStudio: React.FC<RJStudioProps> = ({
  currentUser,
  onNavigateHome,
  onPlayProgram,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shows' | 'episodes' | 'upload' | 'schedule' | 'requests' | 'profile'>(initialTab);
  const [programs, setPrograms] = useState<Program[]>(() => databaseService.getPrograms());
  const [rjs, setRJs] = useState<RJ[]>(() => databaseService.getRJs());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => databaseService.getSchedule());
  const [requests, setRequests] = useState<SongRequest[]>(() => databaseService.getSongRequests());

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Form states for new episode
  const [formData, setFormData] = useState({
    title: '',
    titleHi: '',
    desc: '',
    cat: 'campus-buzz',
    lang: 'HI',
    duration: '15 min',
    audioUrl: '',
    driveUrl: '',
    status: 'published' as 'draft' | 'pending' | 'published',
  });
  const [formSuccess, setFormSuccess] = useState(false);

  // Subscribe to database updates
  useEffect(() => {
    const unsub = databaseService.subscribe(() => {
      setPrograms(databaseService.getPrograms());
      setRJs(databaseService.getRJs());
      setSchedule(databaseService.getSchedule());
      setRequests(databaseService.getSongRequests());
    });
    return unsub;
  }, []);

  const myRJProfile = rjs.find(
    (r) =>
      r.name.toLowerCase().includes(currentUser?.name.toLowerCase() || '') ||
      currentUser?.name.toLowerCase().includes(r.name.toLowerCase())
  ) || rjs[0];

  const [profileBio, setProfileBio] = useState(myRJProfile?.bio || '');
  const [profileShowTime, setProfileShowTime] = useState(myRJProfile?.showTime || 'Fridays 4:00 PM');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (myRJProfile) {
      setProfileBio(myRJProfile.bio);
      setProfileShowTime(myRJProfile.showTime || 'Fridays 4:00 PM');
    }
  }, [myRJProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myRJProfile) return;
    databaseService.updateRJ(myRJProfile.name, {
      bio: profileBio,
      showTime: profileShowTime,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleCreateEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.desc) {
      alert('Please fill out the episode title and description.');
      return;
    }

    const resolvedAudio = formData.driveUrl
      ? formatAudioUrl(formData.driveUrl)
      : formData.audioUrl
      ? formatAudioUrl(formData.audioUrl)
      : '';

    databaseService.createProgram({
      title: formData.title,
      titleHi: formData.titleHi || formData.title,
      desc: formData.desc,
      cat: formData.cat,
      lang: formData.lang,
      rj: currentUser?.name || 'RJ Priya',
      duration: formData.duration || '15 min',
      featured: false,
      audioUrl: resolvedAudio,
      driveUrl: formData.driveUrl || undefined,
      status: formData.status,
      submittedBy: currentUser?.id,
    });

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('episodes');
      setFormData({
        title: '',
        titleHi: '',
        desc: '',
        cat: 'campus-buzz',
        lang: 'HI',
        duration: '15 min',
        audioUrl: '',
        driveUrl: '',
        status: 'published',
      });
    }, 1200);
  };

  const handleDeleteEpisode = (id: number) => {
    const prog = programs.find((p) => p.id === id);
    if (!prog) return;

    const isMine =
      currentUser?.role === 'admin' ||
      prog.submittedBy === currentUser?.id ||
      prog.rj.toLowerCase().includes(currentUser?.name.toLowerCase() || '') ||
      (currentUser?.name && prog.rj.toLowerCase().includes(currentUser.name.toLowerCase()));

    if (!isMine) {
      alert(`Access Restricted: This episode belongs to ${prog.rj}.`);
      return;
    }

    if (confirm(`Delete episode "${prog.title}"?`)) {
      databaseService.deleteProgram(id);
    }
  };

  // Role guard in warm SaaS light theme
  if (!currentUser || (currentUser.role !== 'rj' && currentUser.role !== 'admin')) {
    return (
      <div className="w-full min-h-[75vh] flex items-center justify-center p-4 sm:p-8 bg-[#F7F8F5]">
        <div className="max-w-md p-8 sm:p-10 text-center space-y-4 bg-white border border-[#E8EAE2] rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-serif font-extrabold text-[#202820]">RJ Studio Access Required</h2>
          <p className="text-xs text-[#778078] leading-relaxed">
            This creator workspace is designated for student Radio Jockeys and broadcast team members.
            Please sign in with an RJ account to manage episodes, broadcast schedules, and audio master links.
          </p>
          <button
            onClick={onNavigateHome}
            className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold cursor-pointer transition-colors"
          >
            Return to Public Station
          </button>
        </div>
      </div>
    );
  }

  // Navigation Items matched exactly to Screenshot 3
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Tv, count: null },
    { id: 'shows', label: 'My Shows', icon: Tv, count: null },
    { id: 'episodes', label: 'My Episodes', icon: Layers, count: null },
    { id: 'schedule', label: 'Broadcast Schedule', icon: Calendar, count: null },
    { id: 'upload', label: 'Upload Audio', icon: UploadCloud, count: null },
    { id: 'requests', label: 'Listener Requests', icon: MessageSquare, count: 8 },
    { id: 'profile', label: 'Settings', icon: Settings, count: null },
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
              onClick={onNavigateHome}
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
                  RJ STUDIO
                </span>
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/25">
                  RJ PORTAL
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
                    if (item.id === 'overview') window.location.hash = '/creator';
                    else if (item.id === 'episodes') window.location.hash = '/creator-episodes';
                    else if (item.id === 'upload') window.location.hash = '/creator-upload';
                  }}
                  className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/30 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#00FF00]/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#00FF00] shadow-[0_0_8px_#00FF00]" />
                    )}
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00FF00]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#00FF00]/25 text-[#00FF00] border border-[#00FF00]/40'
                          : 'bg-[#0E1A0E] text-slate-300 border border-[#00FF00]/20'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Public Main Site Return Button */}
            <div className="pt-2 border-t border-[#00FF00]/15">
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-[#00FF00]/10 border border-[#00FF00]/25 transition-all cursor-pointer group"
                title="Return to Public Radio Station"
              >
                <Radio className="w-4 h-4 text-[#00FF00] group-hover:animate-pulse" />
                <span>Public Main Site</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Profile Card: RJ Priya, Senior Broadcaster */}
        <div
          className={`pt-4 border-t border-[#00FF00]/15 ${
            mobileSidebarOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="p-2.5 rounded-2xl bg-[#0A130A] border border-[#00FF00]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                alt={currentUser?.name || "RJ Priya"}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#00FF00]/30 shadow-xs"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name || "RJ Priya"}</p>
                <p className="text-[10px] text-slate-400 truncate">Senior Broadcaster</p>
              </div>
            </div>
            <button
              onClick={onNavigateHome}
              title="Return to Public Station"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00FF00] hover:bg-[#0E1A0E] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* 2. MAIN RJ WORKSPACE (EXACT MATCH TO SCREENSHOT 3)                */}
      {/* ================================================================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Header Row: Breadcrumb + Search + Bell + Help + Avatar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#778078] font-medium">
            <span>Broadcaster Workspace</span>
            <span>&gt;</span>
            <span className="text-[#202820] font-bold capitalize">
              {activeTab === 'overview' ? 'Overview' : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778078]" />
              <input
                type="text"
                placeholder="Search shows, episodes, audio files... (⌘K)"
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
              title="Help & Guidelines"
              className="p-2.5 rounded-full bg-white border border-[#E8EAE2] text-[#778078] hover:text-[#202820] shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
              alt="RJ Priya"
              className="w-9 h-9 rounded-full object-cover border border-[#E8EAE2] shadow-xs shrink-0"
            />
          </div>
        </div>

        {/* =============================================================== */}
        {/* TAB 1: OVERVIEW (EXACT SCREENSHOT 3 LAYOUT)                     */}
        {/* =============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Hero Banner Card with 3D Studio Mic Graphic */}
            <div className="bg-gradient-to-r from-[#EAF5EC] via-[#EDF7EF] to-[#DDF0E2] border border-[#E8EAE2] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
              <div className="space-y-3 z-10 max-w-xl">
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#202820] tracking-tight">
                  Welcome back, RJ Priya! 🎙️
                </h2>
                <p className="text-xs sm:text-sm text-[#5F6B61]">
                  Your broadcasting workspace is ready. You are on-air in 2 hours.
                </p>

                {/* 4 White Rounded Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8EAE2] text-xs font-semibold text-[#202820] shadow-xs flex items-center gap-1.5">
                    <span>👥</span> Assigned Shows: 4
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8EAE2] text-xs font-semibold text-[#202820] shadow-xs flex items-center gap-1.5">
                    <span>📄</span> Published Episodes: 82
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8EAE2] text-xs font-semibold text-[#202820] shadow-xs flex items-center gap-1.5">
                    <span>📅</span> Upcoming Broadcasts: 3 <span className="text-[#778078] font-normal">(This week)</span>
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8EAE2] text-xs font-semibold text-[#202820] shadow-xs flex items-center gap-1.5">
                    <span>⚠️</span> Pending Review: 1
                  </span>
                </div>
              </div>

              {/* 3D Studio Microphone & Headphones Banner Illustration */}
              <div className="shrink-0 self-center md:self-auto">
                <StudioMicHeroIllustration className="w-56 h-32" />
              </div>
            </div>

            {/* ROW 2: My Shows, Quick Actions, My Broadcast Schedule */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              {/* Column 1: My Shows (approx 40%) */}
              <div className="lg:col-span-5 space-y-2">
                <h3 className="text-xs font-bold text-[#202820]">My Shows</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Show 1: Campus Chronicles */}
                  <div className="bg-white border border-[#E8EAE2] rounded-2xl p-3 space-y-2.5 shadow-xs">
                    <div className="relative rounded-xl overflow-hidden h-24 w-full">
                      <img
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80"
                        alt="Campus Chronicles"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/90 text-[#202820]">
                        1. Art
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#202820]">Campus Chronicles</h4>
                      <p className="text-[10px] text-[#778078]">• Youth & Campus Life</p>
                      <p className="text-[10px] text-[#778078]">• Fridays 4:00 PM</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Show 2: Unwind with Priya */}
                  <div className="bg-white border border-[#E8EAE2] rounded-2xl p-3 space-y-2.5 shadow-xs">
                    <div className="relative rounded-xl overflow-hidden h-24 w-full">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
                        alt="Unwind with Priya"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/90 text-[#202820]">
                        2. Art
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#202820]">Unwind with Priya</h4>
                      <p className="text-[10px] text-[#778078]">• Retro & Indie Music</p>
                      <p className="text-[10px] text-[#778078]">• Wed & Sun 8:00 PM</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Quick Actions (approx 25%) */}
              <div className="lg:col-span-3 space-y-2">
                <h3 className="text-xs font-bold text-[#202820]">Quick Actions</h3>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="w-full py-3 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>Start Live Broadcast</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E8EAE2] hover:bg-[#F8F9FA] text-[#202820] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#778078]" />
                    <span>Manage My Schedule</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('requests')}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E8EAE2] hover:bg-[#F8F9FA] text-[#202820] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#778078]" />
                    <span>Review Listener Requests ({requests.length} pending)</span>
                  </button>
                </div>
              </div>

              {/* Column 3: My Broadcast Schedule (approx 35%) */}
              <div className="lg:col-span-4 space-y-2">
                <h3 className="text-xs font-bold text-[#202820]">My Broadcast Schedule</h3>
                <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 space-y-3 shadow-xs">
                  <span className="text-[10px] text-[#778078] font-bold uppercase block">
                    Today, Nov 14 (12:30 PM)
                  </span>

                  {/* Slot 1 */}
                  <div className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] text-xs space-y-0.5">
                    <span className="text-[10px] text-[#778078] font-semibold">Today 12:30 PM</span>
                    <p className="font-bold text-[#202820]">Prep for SGT Sports Special</p>
                    <span className="text-[10px] text-[#778078]">Upcoming</span>
                  </div>

                  {/* Slot 2 */}
                  <div className="p-2.5 rounded-xl bg-white border-l-4 border-l-[#10B981] border border-[#E8EAE2] text-xs space-y-0.5">
                    <span className="text-[10px] text-[#778078] font-semibold">Today 4:00 PM</span>
                    <p className="font-bold text-[#202820]">Campus Chronicles #24</p>
                    <span className="text-[10px] text-[#145A42] font-semibold">(Go Live Slot) - highlights</span>
                  </div>

                  {/* Slot 3 */}
                  <div className="p-2.5 rounded-xl bg-white border-l-4 border-l-[#10B981] border border-[#E8EAE2] text-xs space-y-0.5">
                    <span className="text-[10px] text-[#778078] font-semibold">Sunday 8:00 PM</span>
                    <p className="font-bold text-[#202820]">Unwind with Priya</p>
                    <span className="text-[10px] text-[#778078]">Slot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: My Recent Episodes, Upload Your Episode Audio, Live Requests Feed */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              {/* Column 1: My Recent Episodes Table (approx 45%) */}
              <div className="lg:col-span-5 space-y-2">
                <h3 className="text-xs font-bold text-[#202820]">My Recent Episodes</h3>
                <div className="bg-white border border-[#E8EAE2] rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs text-[#202820]">
                    <thead className="bg-[#F8F9FA] text-[10px] uppercase font-bold text-[#778078] border-b border-[#E8EAE2]">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Art</th>
                        <th className="px-3 py-2">Episode</th>
                        <th className="px-3 py-2">Duration</th>
                        <th className="px-3 py-2 text-right">Plays</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EAE2]">
                      <tr className="hover:bg-[#F8F9FA]">
                        <td className="px-3 py-2.5 font-bold text-[#778078]">1</td>
                        <td className="px-3 py-2.5">
                          <img
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=100&q=80"
                            alt="Fest Special"
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-xs text-[#202820] truncate">
                            Campus Chronicles #24: Fest Special
                          </p>
                          <p className="text-[10px] text-[#10B981]">45m • Published</p>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-[#778078]">45m</td>
                        <td className="px-3 py-2.5 font-bold text-right text-[11px] text-[#202820]">
                          1,200 Listens
                        </td>
                      </tr>

                      <tr className="hover:bg-[#F8F9FA]">
                        <td className="px-3 py-2.5 font-bold text-[#778078]">2</td>
                        <td className="px-3 py-2.5">
                          <img
                            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=100&q=80"
                            alt="Monsoon Melodies"
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-xs text-[#202820] truncate">
                            Unwind #42: Monsoon Melodies
                          </p>
                          <p className="text-[10px] text-[#10B981]">58m • Published</p>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-[#778078]">58m</td>
                        <td className="px-3 py-2.5 font-bold text-right text-[11px] text-[#202820]">
                          850 Listens
                        </td>
                      </tr>

                      <tr className="hover:bg-[#F8F9FA]">
                        <td className="px-3 py-2.5 font-bold text-[#778078]">3</td>
                        <td className="px-3 py-2.5">
                          <img
                            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=100&q=80"
                            alt="Exam Tips"
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-bold text-xs text-[#202820] truncate">
                            Campus Chronicles #23: Exam Tips
                          </p>
                          <p className="text-[10px] text-amber-600">42m • Draft</p>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-[#778078]">42m</td>
                        <td className="px-3 py-2.5 text-right text-[10px] text-amber-700 font-semibold">
                          Draft (Pending)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Column 2: Upload Your Episode Audio Dropzone (approx 35%) */}
              <div className="lg:col-span-4 space-y-2">
                <h3 className="text-xs font-bold text-[#202820]">Upload Your Episode Audio</h3>
                <div
                  onClick={() => setActiveTab('upload')}
                  className="border-2 border-dashed border-[#10B981]/50 bg-[#EAF5EC]/40 hover:bg-[#EAF5EC]/70 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors shadow-xs"
                >
                  <div className="w-12 h-12 rounded-full bg-white text-[#10B981] flex items-center justify-center mx-auto shadow-xs">
                    <UploadCloud className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <h4 className="font-bold text-xs text-[#202820]">Upload Your Audio</h4>
                  <p className="text-[10px] text-[#778078]">
                    Drag & drop MP3/WAV here or browse
                  </p>
                  <p className="text-[9px] text-[#778078]">Supported formats (Max 500MB, 44.1kHz)</p>
                  <span className="inline-block text-[10px] font-semibold text-[#145A42] underline">
                    Progress & preview
                  </span>
                </div>
              </div>

              {/* Column 3: Live Requests Feed (approx 25%) */}
              <div className="lg:col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#202820]">Live Requests Feed</h3>
                  <span className="text-[10px] text-[#778078] font-mono">mini view</span>
                </div>

                <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 space-y-3 text-xs shadow-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-[#202820] text-xs">
                      Play "Pehle Bhi Main" from Student #1209
                    </p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-[#778078]">• 5m ago</span>
                      <button
                        onClick={() => {
                          if (requests[0]) databaseService.updateSongRequestStatus(requests[0].id, 'approved');
                        }}
                        className="text-[#10B981] font-bold hover:underline cursor-pointer"
                      >
                        • Approve
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8EAE2] space-y-1">
                    <p className="text-xs text-[#202820] font-medium">Special shoutout to 1st-year Biotech</p>
                    <p className="text-[10px] text-[#778078]">Student #3890 • 12m ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 2: MY SHOWS                                                 */}
        {/* =============================================================== */}
        {activeTab === 'shows' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202820]">My Broadcaster Shows</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => (
                <div key={c.slug} className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-2 shadow-xs">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#EAF5EC] text-[#145A42]">
                    {c.en}
                  </span>
                  <h4 className="font-bold text-base text-[#202820]">{c.en}</h4>
                  <p className="text-xs text-[#778078]">Weekly broadcast slot anchored by RJ Priya.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 3: MY EPISODES CATALOG                                      */}
        {/* =============================================================== */}
        {activeTab === 'episodes' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
              <span className="text-xs font-bold text-[#202820]">All Master Episodes</span>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-4 py-1.5 rounded-full bg-[#10B981] text-white text-xs font-bold cursor-pointer hover:bg-[#059669]"
              >
                + New Episode
              </button>
            </div>

            <div className="space-y-3">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => onPlayProgram(prog)}
                      className="w-10 h-10 rounded-xl bg-[#EAF5EC] text-[#10B981] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#10B981] hover:text-white transition-colors"
                      title="Preview Audio"
                    >
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-[#F8F9FA] text-[#778078] border border-[#E8EAE2]">
                          {prog.cat}
                        </span>
                        <span className="text-[10px] text-[#778078] font-mono">{prog.duration}</span>
                        <span className="text-[10px] text-[#10B981] font-bold">{prog.plays} plays</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#202820] truncate">{prog.title}</h4>
                      <p className="text-xs text-[#778078]">Host: {prog.rj}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {prog.driveUrl && (
                      <a
                        href={prog.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-[#F8F9FA] text-[#778078] border border-[#E8EAE2]"
                        title="Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteEpisode(prog.id)}
                      className="p-2 rounded-full hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4: UPLOAD AUDIO FORM                                        */}
        {/* =============================================================== */}
        {activeTab === 'upload' && (
          <div className="bg-white border border-[#E8EAE2] rounded-2xl max-w-2xl mx-auto p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-[#202820] flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#10B981]" />
                <span>Submit Master Recording to Station Vault</span>
              </h2>
              <p className="text-xs text-[#778078] mt-1">
                Provide episode details and original Google Drive sharing link.
              </p>
            </div>

            {formSuccess ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto" />
                <h3 className="text-lg font-bold text-[#202820]">Episode Added to Station Vault!</h3>
                <p className="text-xs text-[#778078]">Redirecting to catalog...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateEpisode} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-semibold mb-1">Episode Title (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Campus Chronicles #25: Alumni Spotlight"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-semibold mb-1">Hindi Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. कैंपस क्रॉनिकल्स"
                    value={formData.titleHi}
                    onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-hi focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-semibold mb-1">Description / Show Notes *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Key topics, guest speakers, musical cues, and summary..."
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#202820] font-semibold mb-1">Category</label>
                    <select
                      value={formData.cat}
                      onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#202820] font-semibold mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 45 min"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#202820] font-semibold mb-1">
                    Google Drive Recording Link *
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    value={formData.driveUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        driveUrl: val,
                        audioUrl: formatAudioUrl(val) || formData.audioUrl,
                      });
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-mono focus:outline-none focus:border-[#10B981]"
                  />
                  <p className="text-[10px] text-[#778078] mt-1">
                    Ensure Google Drive link access is set to "Anyone with the link can view".
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-[#059669] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Episode to Station Vault</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 5: BROADCAST SCHEDULE                                       */}
        {/* =============================================================== */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202820]">Upcoming Broadcaster Schedule</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {schedule.map((item, idx) => (
                <div key={idx} className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-2 shadow-xs">
                  <span className="text-xs font-mono font-semibold text-[#10B981]">{item.time}</span>
                  <h4 className="text-sm font-bold text-[#202820]">{item.title}</h4>
                  <p className="text-xs text-[#778078]">Host: {item.rj}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 6: LISTENER REQUESTS                                         */}
        {/* =============================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#202820]">Student Song Requests & Shoutouts</h3>
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-[#202820]">
                      {req.song} <span className="text-[#778078] font-normal">— {req.by}</span>
                    </p>
                    <p className="text-xs text-[#778078]">Requested by: {req.from}</p>
                    {req.dedicatedTo && (
                      <p className="text-xs text-[#10B981] italic">Dedication: {req.dedicatedTo}</p>
                    )}
                  </div>

                  <button
                    onClick={() => databaseService.updateSongRequestStatus(req.id, 'queued')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#EAF5EC] text-[#145A42] font-semibold text-xs hover:bg-[#DDF0E2] cursor-pointer transition-colors"
                  >
                    Play on Show
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 7: BROADCASTER PROFILE & SETTINGS                           */}
        {/* =============================================================== */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-[#E8EAE2] rounded-2xl max-w-xl mx-auto p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
                alt="RJ Priya"
                className="w-16 h-16 rounded-2xl object-cover border border-[#E8EAE2]"
              />
              <div>
                <h2 className="text-xl font-bold text-[#202820]">{myRJProfile.name}</h2>
                <p className="text-xs text-[#778078]">{myRJProfile.dept}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EAF5EC] text-[#145A42]">
                  {myRJProfile.badge || 'Campus Broadcaster'}
                </span>
              </div>
            </div>

            {profileSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#145A42] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Broadcaster profile updated and saved!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs text-[#202820]">
              <div>
                <label className="block text-[#778078] font-bold uppercase text-[10px] mb-1">On-Air Biography</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full p-3 text-xs bg-white border border-[#E8EAE2] rounded-xl resize-none focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-[#778078] font-bold uppercase text-[10px] mb-1">
                  Scheduled Broadcast Slot
                </label>
                <input
                  type="text"
                  value={profileShowTime}
                  onChange={(e) => setProfileShowTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-[#10B981] text-white hover:bg-[#059669] cursor-pointer shadow-xs transition-colors"
              >
                Save Broadcaster Profile Changes
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
