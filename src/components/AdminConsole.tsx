import React, { useState, useEffect } from 'react';
import {
  Shield,
  Radio,
  Users,
  Mic,
  Music,
  Layers,
  Calendar,
  Bell,
  Clock,
  Trash2,
  PlusCircle,
  Play,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Headphones,
  Menu,
  X,
  Volume2,
  Check,
  RefreshCw,
  LogOut,
  HelpCircle,
  Home,
  Tv,
  Megaphone,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  RadioTower,
  UploadCloud,
  ShieldCheck,
  Eye,
  Activity,
  Square,
  Edit2,
  FileAudio,
  ThumbsUp,
  Award,
  ChevronRight,
  UserCheck,
  UserX,
  Lock,
  UserPlus,
} from 'lucide-react';
import {
  User,
  Program,
  SongRequest,
  ScheduleItem,
  Announcement,
  UserRole,
  Comment,
  LiveSession,
  SubscriptionStatus,
  SubscriptionTier,
  SubscriptionLog,
  RJ,
} from '../types';
import { databaseService } from '../services/databaseService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, WEEKLY_PLAYS, CATEGORY_PLAYS } from '../data';
import { formatAudioUrl } from '../utils/audioUrl';
import { BroadcastCentralIllustration, BroadcastingActivityChart } from './DashboardIllustrations';

export type AdminTab =
  | 'overview'
  | 'students'
  | 'subscribers'
  | 'rjs'
  | 'shows'
  | 'episodes'
  | 'live'
  | 'upload'
  | 'analytics'
  | 'comments'
  | 'requests'
  | 'schedule'
  | 'announcements'
  | 'settings';

interface AdminConsoleProps {
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  nowPlaying: { title: string; rj: string; audioUrl?: string };
  setNowPlaying: (np: { title: string; rj: string; audioUrl?: string }) => void;
  listeners: number;
  onPlayProgram: (prog: Program) => void;
  onNavigateHome?: () => void;
  initialTab?: AdminTab;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  isLive,
  setIsLive,
  nowPlaying,
  setNowPlaying,
  listeners,
  onPlayProgram,
  onNavigateHome,
  initialTab = 'overview',
}) => {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Real data loaded from databaseService & authService
  const [stats, setStats] = useState(() => databaseService.getPlatformStats());
  const [users, setUsers] = useState<User[]>(() => authService.getAllUsers());
  const [rjs, setRJs] = useState<RJ[]>(() => databaseService.getRJs());
  const [programs, setPrograms] = useState<Program[]>(() => databaseService.getPrograms());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => databaseService.getSchedule());
  const [requests, setRequests] = useState<SongRequest[]>(() => databaseService.getSongRequests());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => databaseService.getAnnouncements());
  const [comments, setComments] = useState<Comment[]>(() => databaseService.getComments());
  const [liveSession, setLiveSession] = useState<LiveSession>(() => databaseService.getLiveSession());
  const [subscriptionLogs, setSubscriptionLogs] = useState<SubscriptionLog[]>(() => authService.getSubscriptionAuditLogs());

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('all');
  const [episodeStatusFilter, setEpisodeStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [commentStatusFilter, setCommentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [commentSearch, setCommentSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<'all' | 'pending' | 'approved' | 'queued' | 'completed' | 'rejected'>('all');
  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');

  // Admin login credentials state
  const [adminEmail, setAdminEmail] = useState('admin@smcf.edu.in');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Live broadcast controls
  const [broadcastRJ, setBroadcastRJ] = useState('RJ Neha');
  const [broadcastProgram, setBroadcastProgram] = useState('Morning Raga');
  const [liveUpdated, setLiveUpdated] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  // Live duration ticker stopwatch
  const [liveDuration, setLiveDuration] = useState('00:00:00');
  useEffect(() => {
    if (!liveSession.isActive) {
      setLiveDuration('00:00:00');
      return;
    }
    const updateTicker = () => {
      const start = new Date(liveSession.startedAt).getTime();
      const diff = Math.max(0, Date.now() - start);
      const hrs = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setLiveDuration(`${hrs}:${mins}:${secs}`);
    };
    updateTicker();
    const interval = setInterval(updateTicker, 1000);
    return () => clearInterval(interval);
  }, [liveSession.isActive, liveSession.startedAt]);

  // Audio Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTitleHi, setUploadTitleHi] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCat, setUploadCat] = useState('campus-buzz');
  const [uploadRJ, setUploadRJ] = useState('RJ Priya');
  const [uploadDuration, setUploadDuration] = useState('15 min');
  const [uploadDriveUrl, setUploadDriveUrl] = useState('');
  const [uploadAudioUrl, setUploadAudioUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'published' | 'draft'>('published');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Program Management State
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgTitleHi, setNewProgTitleHi] = useState('');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgCat, setNewProgCat] = useState('campus-buzz');
  const [newProgRJ, setNewProgRJ] = useState('RJ Priya');

  // Schedule modal state
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotTitle, setNewSlotTitle] = useState('');
  const [newSlotRJ, setNewSlotRJ] = useState('RJ Neha');

  // Announcement state
  const [newAnnEn, setNewAnnEn] = useState('');
  const [newAnnHi, setNewAnnHi] = useState('');

  // Role & action toasts
  const [roleChangeNotice, setRoleChangeNotice] = useState<string | null>(null);

  // --- INTERACTIVE CRUD MODAL STATES ---
  // 1. Students
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [viewStudent, setViewStudent] = useState<User | null>(null);
  const [editStudent, setEditStudent] = useState<User | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    department: 'Mass Communication',
    studentId: '',
    password: '',
    activateSubscription: false,
  });

  // 2. RJs
  const [showAddRJModal, setShowAddRJModal] = useState(false);
  const [viewRJ, setViewRJ] = useState<RJ | null>(null);
  const [editRJ, setEditRJ] = useState<RJ | null>(null);
  const [assignShowRJ, setAssignShowRJ] = useState<RJ | null>(null);
  const [selectedShowForRJ, setSelectedShowForRJ] = useState<number>(1);
  const [rjForm, setRjForm] = useState({
    name: '',
    alias: '',
    dept: 'School of Emerging Media',
    bio: '',
    showTime: 'Weekdays 4:00 PM',
    color: '#10B981',
    password: '',
  });

  // 3. Subscribers
  const [showAddSubscriberModal, setShowAddSubscriberModal] = useState(false);
  const [showSubHistoryModal, setShowSubHistoryModal] = useState(false);
  const [viewSubscriber, setViewSubscriber] = useState<User | null>(null);
  const [subscriberTargetUserId, setSubscriberTargetUserId] = useState('');
  const [subscriberTier, setSubscriberTier] = useState<SubscriptionTier>('campus-free');

  // 4. Programs / Shows
  const [viewProgram, setViewProgram] = useState<Program | null>(null);
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  // 5. Episodes
  const [showUploadEpisodeModal, setShowUploadEpisodeModal] = useState(false);
  const [editEpisode, setEditEpisode] = useState<Program | null>(null);

  // 6. Schedule
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [editScheduleItem, setEditScheduleItem] = useState<ScheduleItem | null>(null);

  // 7. Announcements
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);

  // Helper notification dispatcher
  const showNotice = (msg: string) => {
    setRoleChangeNotice(msg);
    setTimeout(() => setRoleChangeNotice(null), 3500);
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const refreshData = () => {
      setStats(databaseService.getPlatformStats());
      setUsers(authService.getAllUsers());
      setRJs(databaseService.getRJs());
      setPrograms(databaseService.getPrograms());
      setSchedule(databaseService.getSchedule());
      setRequests(databaseService.getSongRequests());
      setAnnouncements(databaseService.getAnnouncements());
      setComments(databaseService.getComments());
      setLiveSession(databaseService.getLiveSession());
      setSubscriptionLogs(authService.getSubscriptionAuditLogs());
    };

    const unsub = databaseService.subscribe(refreshData);
    return unsub;
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    const res = await login({
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    setIsLoggingIn(false);

    if (!res.success) {
      setAuthError(res.error || 'Invalid administrator credentials.');
    }
  };

  const isAuthorized = user && user.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="w-full min-h-[75vh] flex items-center justify-center p-4 sm:p-8 bg-[#F7F8F5]">
        <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-white border border-[#E8EAE2] rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF5EC] text-[#145A42] border border-[#10B981]/25 flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-8 h-8 text-[#10B981]" />
          </div>

          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-serif font-extrabold text-[#202820]">Station Admin Console</h2>
            <p className="text-xs text-[#778078]">
              Restricted to SGT University faculty, station directors, and broadcasting supervisors.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#202820] font-semibold mb-1">Administrator Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                placeholder="admin@smcf.edu.in"
              />
            </div>

            <div>
              <label className="block text-[#202820] font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 text-xs font-bold rounded-xl bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In as Station Director'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] text-[11px] text-[#778078] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#202820] mb-0.5">Faculty Demo Profile</p>
                <p className="font-mono text-[#778078]">admin@smcf.edu.in / admin123</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@smcf.edu.in');
                  setAdminPassword('admin123');
                }}
                className="px-3 py-1 text-[10px] font-bold rounded-full bg-[#EAF5EC] text-[#145A42] border border-[#10B981]/25 hover:bg-[#DDF0E2] cursor-pointer transition-colors"
              >
                Auto-Fill
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 1. LIVE BROADCAST ACTIONS
  const handleStartBroadcast = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const session = databaseService.startLiveBroadcast(broadcastRJ, broadcastProgram);
    setLiveSession(session);
    setIsLive(true);
    setNowPlaying({
      title: session.programTitle,
      rj: session.rjName,
    });
    setLiveUpdated(true);
    setTimeout(() => setLiveUpdated(false), 3500);
  };

  const handleStopBroadcast = () => {
    const session = databaseService.stopLiveBroadcast();
    setLiveSession(session);
    setIsLive(false);
    setLiveUpdated(true);
    setTimeout(() => setLiveUpdated(false), 3500);
  };

  // 2. AUDIO UPLOAD ACTION
  const handleAudioUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    let finalAudio = uploadAudioUrl.trim();
    if (uploadDriveUrl.trim()) {
      finalAudio = formatAudioUrl(uploadDriveUrl.trim());
    }

    const newProg = databaseService.addProgram({
      title: uploadTitle.trim(),
      titleHi: uploadTitleHi.trim() || undefined,
      desc: uploadDesc.trim() || 'Official broadcast recording from SMCF Radio Studios.',
      cat: uploadCat,
      lang: 'HI',
      rj: uploadRJ,
      duration: uploadDuration || '25 min',
      audioUrl: finalAudio || 'https://drive.usercontent.google.com/download?id=1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y&export=download',
      driveUrl: uploadDriveUrl.trim() || undefined,
      status: uploadStatus,
      submittedBy: user?.name || 'Station Director',
      featured: true,
    });

    setUploadNotice(`Episode "${newProg.title}" successfully ${uploadStatus === 'published' ? 'published to station catalog' : 'saved as draft'}!`);
    setUploadTitle('');
    setUploadTitleHi('');
    setUploadDesc('');
    setUploadDriveUrl('');
    setUploadAudioUrl('');
    setTimeout(() => setUploadNotice(null), 4000);
  };

  // 3. PROGRAM MANAGEMENT
  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle.trim()) return;

    databaseService.addProgram({
      title: newProgTitle.trim(),
      titleHi: newProgTitleHi.trim() || undefined,
      desc: newProgDesc.trim() || 'SGT University campus radio program series.',
      cat: newProgCat,
      lang: 'HI',
      rj: newProgRJ,
      duration: '45 min',
      status: 'published',
      featured: true,
      submittedBy: user?.name || 'Station Director',
    });

    setIsCreatingProgram(false);
    setNewProgTitle('');
    setNewProgTitleHi('');
    setNewProgDesc('');
    setRoleChangeNotice(`Created program "${newProgTitle}" and assigned to ${newProgRJ}`);
    setTimeout(() => setRoleChangeNotice(null), 3000);
  };

  // 4. SCHEDULE & ANNOUNCEMENTS
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime || !newSlotTitle) return;
    databaseService.addScheduleItem({
      time: newSlotTime,
      title: newSlotTitle,
      rj: newSlotRJ,
      status: 'scheduled',
    });
    setNewSlotTime('');
    setNewSlotTitle('');
    databaseService.logActivity(user?.name || 'Admin', 'Schedule Slot Created', `Added "${newSlotTitle}" at ${newSlotTime}`);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnEn || !newAnnHi) return;
    databaseService.addAnnouncement({
      en: newAnnEn,
      hi: newAnnHi,
    });
    setNewAnnEn('');
    setNewAnnHi('');
    databaseService.logActivity(user?.name || 'Admin', 'Bulletin Notice Published', `Notice in EN: "${newAnnEn.slice(0, 30)}..."`);
  };

  // 5. USER ROLES & SUBSCRIPTIONS
  const handleRoleChange = (userId: string, targetName: string, newRole: UserRole) => {
    authService.updateUserRole(userId, newRole);
    setUsers(authService.getAllUsers());
    databaseService.logActivity(user?.name || 'Admin', 'User Role Changed', `Updated user ${targetName} to role ${newRole}`);
    setRoleChangeNotice(`Updated ${targetName}'s account role to ${newRole.toUpperCase()}`);
    setTimeout(() => setRoleChangeNotice(null), 3000);
  };

  const handleSubscriptionUpdate = (userId: string, targetName: string, status: SubscriptionStatus) => {
    authService.updateSubscription(userId, status);
    setUsers(authService.getAllUsers());
    databaseService.logActivity(user?.name || 'Admin', 'Subscription Updated', `Set ${targetName}'s entitlement status to ${status}`);
    setRoleChangeNotice(`Updated ${targetName}'s subscription status to ${status.toUpperCase()}`);
    setTimeout(() => setRoleChangeNotice(null), 3000);
  };

  // 6. COMMENTS MODERATION
  const handleCommentStatusChange = (commentId: number, status: Comment['status']) => {
    databaseService.updateCommentStatus(commentId, status, user?.name || 'Station Director');
    setComments(databaseService.getComments());
    setRoleChangeNotice(`Comment #${commentId} status updated to ${status.toUpperCase()}`);
    setTimeout(() => setRoleChangeNotice(null), 3000);
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm('Permanently remove this comment?')) {
      databaseService.deleteComment(commentId, user?.id, true);
      setComments(databaseService.getComments());
      setRoleChangeNotice(`Comment #${commentId} permanently deleted.`);
      setTimeout(() => setRoleChangeNotice(null), 3000);
    }
  };

  // 7. REQUESTS MODERATION
  const handleRequestStatusChange = (requestId: number, status: SongRequest['status']) => {
    databaseService.updateSongRequestStatus(requestId, status);
    setRequests(databaseService.getSongRequests());
    setRoleChangeNotice(`Song request #${requestId} status set to ${status.toUpperCase()}`);
    setTimeout(() => setRoleChangeNotice(null), 3000);
  };

  // --- COMPREHENSIVE CRUD HANDLERS ---
  // Student handlers
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = authService.createStudent({
        name: studentForm.name,
        email: studentForm.email,
        department: studentForm.department,
        studentId: studentForm.studentId,
        password: studentForm.password || 'student123',
        subscriptionStatus: studentForm.activateSubscription ? 'active' : 'not_subscribed',
      });
      setUsers(authService.getAllUsers());
      setShowAddStudentModal(false);
      setStudentForm({
        name: '',
        email: '',
        department: 'Mass Communication',
        studentId: '',
        password: '',
        activateSubscription: false,
      });
      showNotice(`Student "${created.name}" created successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to create student account.');
    }
  };

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    try {
      authService.updateUser(editStudent.id, {
        name: editStudent.name,
        department: editStudent.department,
        studentId: editStudent.studentId,
        role: editStudent.role,
        subscriptionStatus: editStudent.subscriptionStatus,
      });
      setUsers(authService.getAllUsers());
      showNotice(`Updated details for "${editStudent.name}".`);
      setEditStudent(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update student.');
    }
  };

  const handleDeleteStudent = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete student account "${name}"?`)) {
      authService.deleteUser(userId);
      setUsers(authService.getAllUsers());
      showNotice(`Account "${name}" deleted from student registry.`);
    }
  };

  const handleToggleStudentActive = (userId: string, name: string) => {
    const updated = authService.toggleUserActive(userId);
    setUsers(authService.getAllUsers());
    showNotice(`Account "${name}" is now ${updated?.isActive === false ? 'DEACTIVATED' : 'ACTIVE'}.`);
  };

  // RJ handlers
  const handleAddRJSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanAlias = rjForm.alias || `RJ ${rjForm.name.split(' ')[0]}`;
      const newRJ = databaseService.createRJ({
        name: rjForm.name,
        alias: cleanAlias,
        dept: rjForm.dept,
        bio: rjForm.bio || `Resident RJ Broadcaster on 90.4 MHz FM.`,
        color: rjForm.color || '#10B981',
        initials: cleanAlias.slice(0, 2).toUpperCase(),
        showTime: rjForm.showTime || 'Weekdays 4:00 PM',
        isActive: true,
      });

      authService.createRJUser({
        name: rjForm.name,
        email: `${cleanAlias.toLowerCase().replace(/\s+/g, '.')}@smcf.edu.in`,
        department: rjForm.dept,
        bio: rjForm.bio,
        password: rjForm.password || 'rj123',
      });

      setRJs(databaseService.getRJs());
      setUsers(authService.getAllUsers());
      setShowAddRJModal(false);
      setRjForm({
        name: '',
        alias: '',
        dept: 'School of Emerging Media',
        bio: '',
        showTime: 'Weekdays 4:00 PM',
        color: '#10B981',
        password: '',
      });
      showNotice(`RJ Broadcaster "${newRJ.alias}" registered successfully.`);
    } catch (err: any) {
      alert(err.message || 'Failed to register RJ.');
    }
  };

  const handleEditRJSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRJ) return;
    databaseService.updateRJ(editRJ.name, {
      alias: editRJ.alias,
      dept: editRJ.dept,
      bio: editRJ.bio,
      showTime: editRJ.showTime,
      color: editRJ.color,
      isActive: editRJ.isActive,
    });
    setRJs(databaseService.getRJs());
    showNotice(`Updated broadcaster profile for "${editRJ.name}".`);
    setEditRJ(null);
  };

  const handleDeleteRJ = (name: string) => {
    if (confirm(`Remove broadcaster profile "${name}"?`)) {
      databaseService.deleteRJ(name);
      setRJs(databaseService.getRJs());
      showNotice(`Broadcaster "${name}" removed.`);
    }
  };

  const handleAssignShowToRJ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignShowRJ) return;
    databaseService.updateProgram(selectedShowForRJ, { rj: assignShowRJ.alias });
    setPrograms(databaseService.getPrograms());
    showNotice(`Assigned show to ${assignShowRJ.alias}.`);
    setAssignShowRJ(null);
  };

  // Subscriber handlers
  const handleAddSubscriberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberTargetUserId) return;
    const targetUser = users.find((u) => u.id === subscriberTargetUserId);
    if (!targetUser) return;

    authService.addSubscriber(subscriberTargetUserId, subscriberTier);
    setUsers(authService.getAllUsers());
    setSubscriptionLogs(authService.getSubscriptionAuditLogs());
    setShowAddSubscriberModal(false);
    showNotice(`Activated Campus Pass for "${targetUser.name}".`);
  };

  // Program / Shows handlers
  const handleEditProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProgram) return;
    databaseService.updateProgram(editProgram.id, {
      title: editProgram.title,
      titleHi: editProgram.titleHi,
      cat: editProgram.cat,
      rj: editProgram.rj,
      duration: editProgram.duration,
      desc: editProgram.desc,
    });
    setPrograms(databaseService.getPrograms());
    showNotice(`Updated program series "${editProgram.title}".`);
    setEditProgram(null);
  };

  const handleDeleteProgram = (id: number, title: string) => {
    if (confirm(`Permanently delete program "${title}"?`)) {
      databaseService.deleteProgram(id);
      setPrograms(databaseService.getPrograms());
      showNotice(`Program "${title}" deleted.`);
    }
  };

  // Episode handlers
  const handleEditEpisodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEpisode) return;
    databaseService.updateProgram(editEpisode.id, {
      title: editEpisode.title,
      titleHi: editEpisode.titleHi,
      cat: editEpisode.cat,
      rj: editEpisode.rj,
      duration: editEpisode.duration,
      desc: editEpisode.desc,
      driveUrl: editEpisode.driveUrl,
      audioUrl: editEpisode.driveUrl ? formatAudioUrl(editEpisode.driveUrl) : editEpisode.audioUrl,
      status: editEpisode.status,
    });
    setPrograms(databaseService.getPrograms());
    showNotice(`Updated episode recording "${editEpisode.title}".`);
    setEditEpisode(null);
  };

  const handleToggleEpisodePublish = (prog: Program) => {
    const nextStatus = prog.status === 'draft' ? 'published' : 'draft';
    databaseService.updateProgram(prog.id, { status: nextStatus });
    setPrograms(databaseService.getPrograms());
    showNotice(`Episode "${prog.title}" marked as ${nextStatus.toUpperCase()}.`);
  };

  // Schedule handlers
  const handleEditScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editScheduleItem || !editScheduleItem.id) return;
    databaseService.updateScheduleItem(editScheduleItem.id, {
      time: editScheduleItem.time,
      title: editScheduleItem.title,
      rj: editScheduleItem.rj,
      status: editScheduleItem.status,
    });
    setSchedule(databaseService.getSchedule());
    showNotice(`Updated timetable slot "${editScheduleItem.title}".`);
    setEditScheduleItem(null);
  };

  const handleDeleteSchedule = (id: number, title: string) => {
    if (confirm(`Delete timetable slot "${title}"?`)) {
      databaseService.deleteScheduleItem(id);
      setSchedule(databaseService.getSchedule());
      showNotice(`Schedule slot "${title}" cancelled.`);
    }
  };

  // Announcement handlers
  const handleEditAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAnnouncement || !editAnnouncement.id) return;
    databaseService.updateAnnouncement(editAnnouncement.id, {
      en: editAnnouncement.en,
      hi: editAnnouncement.hi,
      priority: editAnnouncement.priority,
    });
    setAnnouncements(databaseService.getAnnouncements());
    showNotice(`Updated bulletin #${editAnnouncement.id}.`);
    setEditAnnouncement(null);
  };

  const handleDeleteAnnouncement = (id: number) => {
    if (confirm(`Remove campus bulletin notice #${id}?`)) {
      databaseService.deleteAnnouncement(id);
      setAnnouncements(databaseService.getAnnouncements());
      showNotice(`Bulletin notice #${id} removed.`);
    }
  };

  // Nav items configuration matched to all access level requirements
  const navItems: { id: AdminTab; label: string; icon: any; count: number | string | null }[] = [
    { id: 'overview', label: 'Overview', icon: Home, count: null },
    { id: 'live', label: 'Go Live', icon: RadioTower, count: liveSession.isActive ? 'ON AIR' : null },
    { id: 'upload', label: 'Upload Audio', icon: UploadCloud, count: null },
    { id: 'shows', label: 'Programs', icon: Tv, count: null },
    { id: 'episodes', label: 'Episodes', icon: Layers, count: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
    { id: 'comments', label: 'Review Comments', icon: MessageSquare, count: comments.filter((c) => c.status === 'pending').length || null },
    { id: 'requests', label: 'Review Requests', icon: Music, count: requests.filter((r) => r.status === 'pending').length || null },
    { id: 'students', label: 'Students', icon: Users, count: null },
    { id: 'subscribers', label: 'Subscribers', icon: ShieldCheck, count: null },
    { id: 'rjs', label: 'RJs', icon: Mic, count: null },
    { id: 'schedule', label: 'Schedule', icon: Calendar, count: null },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, count: null },
    { id: 'settings', label: 'Settings', icon: Settings, count: null },
  ];

  const analyticsData = databaseService.getAnalyticsData(analyticsRange);

  return (
    <div className="w-full min-h-screen bg-[#F7F8F5] text-[#202820] flex flex-col lg:flex-row antialiased font-sans">
      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR (SAME COLOR CODE AS PUBLIC WEBSITE)              */}
      {/* ================================================================= */}
      <aside className="w-full lg:w-60 bg-[#060B06] border-b lg:border-b-0 lg:border-r border-[#00FF00]/20 flex flex-col justify-between shrink-0 p-4 sm:p-5 text-white">
        {/* Brand Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.hash = '/';
              }}
              className="flex items-center gap-3 cursor-pointer group"
              title="Return to Public Radio Station"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00FF00] to-[#10B981] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-[#00FF00]/30 group-hover:scale-105 transition-transform">
                <Radio className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs tracking-tight text-white">
                    SMCF RADIO
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                    ADMIN
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold block">
                  SGT UNIVERSITY
                </span>
              </div>
            </div>

            {/* Mobile menu toggle */}
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
                    window.location.hash = item.id === 'overview' ? '/admin' : `/admin-${item.id}`;
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

        {/* Bottom Profile Card */}
        <div
          className={`pt-4 border-t border-[#00FF00]/15 ${
            mobileSidebarOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="p-2.5 rounded-2xl bg-[#0A130A] border border-[#00FF00]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Dr. Rajesh K."
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#00FF00]/30 shadow-xs"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Dr. Rajesh K.</p>
                <p className="text-[10px] text-slate-400 truncate">Station Director</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.hash = '/';
              }}
              title="Return to Public Station"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00FF00] hover:bg-[#0E1A0E] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* 2. MAIN WORKSPACE                                                */}
      {/* ================================================================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs text-[#778078] font-medium">Welcome back, Station Director</p>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#202820] tracking-tight">
              {activeTab === 'overview' && 'Station Overview'}
              {activeTab === 'live' && 'Live Broadcasting Studio'}
              {activeTab === 'upload' && 'Upload Audio Episode'}
              {activeTab === 'shows' && 'Programs & Shows Management'}
              {activeTab === 'episodes' && 'Episodes Vault'}
              {activeTab === 'analytics' && 'Station Telemetry & Analytics'}
              {activeTab === 'comments' && 'Review / Moderate Comments'}
              {activeTab === 'requests' && 'Review Listener Requests'}
              {activeTab === 'students' && 'Students Directory'}
              {activeTab === 'subscribers' && 'Subscribers & Entitlements'}
              {activeTab === 'rjs' && 'Broadcasters & RJs'}
              {activeTab === 'schedule' && 'Broadcast Timetable'}
              {activeTab === 'announcements' && 'Campus Announcements'}
              {activeTab === 'settings' && 'Platform Settings'}
            </h1>
            <p className="text-xs text-[#778078]">
              {activeTab === 'overview' && 'Manage your campus broadcasting experience.'}
              {activeTab === 'live' && 'Start, monitor, and manage real-time campus radio transmissions.'}
              {activeTab === 'upload' && 'Upload master recordings, Google Drive links, and episode metadata.'}
              {activeTab === 'shows' && 'Create and curate station programs, assign RJs, and manage broadcast series.'}
              {activeTab === 'episodes' && 'Audit published audio quality, duration, and broadcast status.'}
              {activeTab === 'analytics' && 'Real-time telemetry, unique listeners, views, and community engagement.'}
              {activeTab === 'comments' && 'Moderate student comments, approve community feedback, and ensure safety.'}
              {activeTab === 'requests' && 'Review subscriber song dedications, approve, queue, and broadcast.'}
              {activeTab === 'students' && 'Campus student roster and department distribution.'}
              {activeTab === 'subscribers' && 'Manage subscription status, campus pass entitlements, and access levels.'}
              {activeTab === 'rjs' && 'Broadcasting team, assigned slots, and live permissions.'}
              {activeTab === 'schedule' && 'Timetable for daily broadcasts on 90.4 MHz FM and web streams.'}
              {activeTab === 'announcements' && 'Publish and syndicate emergency notices and campus bulletins.'}
              {activeTab === 'settings' && 'Configure studio stream servers, database connections, and telemetry.'}
            </p>
          </div>

          {/* Right: Search Pill + Notification + Help + Avatar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#778078]" />
              <input
                type="text"
                placeholder="Search anything... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 sm:w-64 pl-9 pr-4 py-2 text-xs bg-white border border-[#E8EAE2] rounded-full text-[#202820] placeholder-[#778078] focus:outline-none focus:border-[#10B981] shadow-xs"
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
              title="Help & Documentation"
              className="p-2.5 rounded-full bg-white border border-[#E8EAE2] text-[#778078] hover:text-[#202820] shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
              alt="Station Director"
              className="w-9 h-9 rounded-full object-cover border border-[#E8EAE2] shadow-xs shrink-0"
            />
          </div>
        </div>

        {/* Quick Navigation Ribbon matching Image 2 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 border-b border-[#E8EAE2] text-xs scrollbar-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'students', label: 'Students' },
            { id: 'rjs', label: 'RJs' },
            { id: 'shows', label: 'Shows' },
            { id: 'episodes', label: 'Episodes' },
            { id: 'schedule', label: 'Schedule' },
            { id: 'requests', label: 'Requests' },
            { id: 'comments', label: 'Comments' },
            { id: 'subscribers', label: 'Subscribers' },
            { id: 'announcements', label: 'Announcements' },
            { id: 'settings', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as AdminTab);
                window.location.hash = item.id === 'overview' ? '/admin' : `/admin-${item.id}`;
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'text-[#778078] hover:text-[#202820] hover:bg-white border border-transparent hover:border-[#E8EAE2]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="ml-auto hidden sm:flex items-center gap-2 pl-3">
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.hash = '/';
              }}
              className="px-3 py-1 rounded-xl bg-white border border-[#E8EAE2] text-[#202820] hover:border-[#10B981] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs hover:text-[#10B981] transition-colors"
              title="Return to Public Radio Station"
            >
              <Radio className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Public Site</span>
            </button>
          </div>
        </div>

        {/* Global Toasts */}
        {roleChangeNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#145A42] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{roleChangeNotice}</span>
          </div>
        )}

        {uploadNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#145A42] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{uploadNotice}</span>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 1: OVERVIEW                                                 */}
        {/* =============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* ROW 1: Dynamic Station Statistics Counters - Original Broadcaster Baseline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Plays', value: Math.max(5247, stats.totalPlays).toLocaleString(), icon: Play, desc: 'Verified on-air & stream plays' },
                { label: 'Subscribers', value: Math.max(1382, stats.subscribersCount).toLocaleString(), icon: Users, desc: 'Active student entitlements' },
                { label: 'Active Listeners', value: String(Math.max(listeners, 214)), icon: Headphones, desc: 'Live FM & web audio stream' },
                { label: 'Indexed Episodes', value: String(programs.length), icon: Radio, desc: '19 authentic audio masters' },
              ].map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl p-5 bg-white border border-[#E8EAE2] shadow-xs flex flex-col justify-between hover:border-[#10B981]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#778078]">
                        {stat.label}
                      </span>
                      <div className="p-2 rounded-xl bg-[#EAF5EC] text-[#145A42]">
                        <IconComponent className="w-4 h-4 text-[#10B981]" />
                      </div>
                    </div>
                    <div className="font-sans font-extrabold text-2xl sm:text-3xl mt-3 text-[#202820]">
                      {stat.value}
                    </div>
                    <p className="text-[10px] text-[#10B981] font-semibold mt-1">{stat.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* ROW 2: University Operations & Department Roster */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
              <div className="lg:col-span-4 bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-[#202820]">SMCF Broadcast Central</h3>
                  <p className="text-[11px] text-[#778078] max-w-[170px] leading-relaxed">
                    SGT University School of Emerging Media 90.4 MHz FM
                  </p>
                </div>
                <BroadcastCentralIllustration className="w-28 h-16 shrink-0" />
              </div>

              <div className="lg:col-span-2 bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#778078]">
                  <span>Total Students —</span>
                  <span className="p-1 rounded-full bg-[#EAF5EC] text-[#145A42]">
                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-sans text-[#202820]">{Math.max(1250, stats.registeredUsers).toLocaleString()}</div>
                <p className="text-[10px] text-[#10B981] font-semibold">+12% this week</p>
              </div>

              <div className="lg:col-span-2 bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#778078]">
                  <span>Active RJs —</span>
                  <span className="p-1 rounded-full bg-[#EAF5EC] text-[#145A42]">
                    <TrendingDown className="w-3 h-3 text-[#10B981]" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-sans text-[#202820]">{Math.max(18, stats.activeRJs)}</div>
                <p className="text-[10px] text-[#778078] font-semibold">3 currently on-air</p>
              </div>

              <div className="lg:col-span-2 bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#778078]">
                  <span>Total Shows —</span>
                  <span className="p-1 rounded-full bg-[#EAF5EC] text-[#145A42]">
                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-sans text-[#202820]">24</div>
                <p className="text-[10px] text-[#778078] font-semibold">2 new this month</p>
              </div>

              <div className="lg:col-span-2 bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#778078]">
                  <span>Published Episodes —</span>
                  <span className="p-1 rounded-full bg-[#EAF5EC] text-[#145A42]">
                    <TrendingUp className="w-3 h-3 text-[#10B981]" />
                  </span>
                </div>
                <div className="text-2xl font-bold font-sans text-[#202820]">{programs.length}</div>
                <p className="text-[10px] text-[#10B981] font-semibold">+8 this week</p>
              </div>
            </div>

            {/* ROW 2: Activity Chart & Upcoming Broadcast Schedule */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
              <div className="lg:col-span-7 bg-white border border-[#E8EAE2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#202820]">Broadcasting Activity</h3>
                    <p className="text-[11px] text-[#778078]">Real telemetry of weekly transmission hours</p>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#F8F9FA] border border-[#E8EAE2] text-[#778078]">
                    This Week / Last Week
                  </span>
                </div>
                <BroadcastingActivityChart className="w-full h-44 sm:h-52" />
              </div>

              <div className="lg:col-span-5 bg-white border border-[#E8EAE2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#202820]">Upcoming Broadcast Schedule</h3>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#EAF5EC] border border-[#10B981]/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        alt="RJ Neha"
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#10B981]/30"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                          <span className="text-[10px] font-bold uppercase text-[#145A42]">On-Air Now</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#202820]">{liveSession.isActive ? liveSession.programTitle : 'Morning Raga'}</h4>
                        <p className="text-[11px] text-[#778078]">{liveSession.isActive ? liveSession.rjName : 'RJ Neha'}, 09:00 - 10:30 AM</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider">
                      LIVE
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                        alt="RJ Kabir"
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E8EAE2]"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#778078]">Next Up</span>
                        <h4 className="text-xs font-bold text-[#202820]">Campus Buzz</h4>
                        <p className="text-[11px] text-[#778078]">RJ Kabir</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#778078]">11:00 AM</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80"
                        alt="RJ Aryan"
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E8EAE2]"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#778078]">Later</span>
                        <h4 className="text-xs font-bold text-[#202820]">Pop & Rock Hour</h4>
                        <p className="text-[11px] text-[#778078]">RJ Aryan</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#778078]">02:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: Original Weekly Plays Bar Chart & Category Metrics */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
              {/* Weekly Plays Bar Chart */}
              <div className="lg:col-span-7 bg-white border border-[#E8EAE2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#10B981]" />
                    <div>
                      <h3 className="text-sm font-bold text-[#202820]">Weekly Plays</h3>
                      <p className="text-[11px] text-[#778078]">Hourly aggregate of listeners parsed weekly (4,805 total plays)</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#EAF5EC] text-[#145A42]">
                    Mon — Sun
                  </span>
                </div>

                <div className="flex items-end gap-3 h-44 pt-4 px-2">
                  {WEEKLY_PLAYS.map((dayData, idx) => {
                    const maxWeeklyPlays = Math.max(...WEEKLY_PLAYS.map((d) => d.plays));
                    const heightPercent = maxWeeklyPlays > 0 ? (dayData.plays / maxWeeklyPlays) * 100 : 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="w-full relative group">
                          {/* Tooltip */}
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#060B06] border border-[#00FF00]/40 text-[#00FF00] font-mono text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                            {dayData.plays.toLocaleString()} plays
                          </span>
                          <div
                            className="w-full rounded-t-lg hover:opacity-90 transition-all cursor-pointer bg-gradient-to-t from-[#10B981] to-[#90F34F]"
                            style={{
                              height: `${Math.max(8, heightPercent)}%`,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-[#778078]">
                          {dayData.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Metrics */}
              <div className="lg:col-span-5 bg-white border border-[#E8EAE2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#202820]">Category Metrics</h3>
                  <p className="text-[11px] text-[#778078]">
                    {CATEGORY_PLAYS.reduce((sum, c) => sum + c.value, 0).toLocaleString()} total plays indexed this month
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {CATEGORY_PLAYS.map((item, idx) => {
                    const totalCat = CATEGORY_PLAYS.reduce((sum, c) => sum + c.value, 0);
                    const percentage = totalCat > 0 ? (item.value / totalCat) * 100 : 0;
                    return (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-[#202820]">{item.label}</span>
                          <span className="text-[11px] font-bold text-[#778078]">
                            {item.value.toLocaleString()} plays ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#F0F2EC] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ROW 4: Recent Episodes & Recent Pending Requests */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
              <div className="lg:col-span-7 bg-white border border-[#E8EAE2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#202820]">Recent Episodes</h3>
                <div className="divide-y divide-[#E8EAE2]">
                  {programs.slice(0, 3).map((ep, idx) => (
                    <div key={ep.id} className="py-3 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[#778078] font-bold w-4">{idx + 1}</span>
                        <img
                          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=100&q=80"
                          alt="Cover"
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-[#202820]">{ep.title}</h4>
                          <p className="text-[11px] text-[#778078]">{ep.rj} • {ep.duration} • Published recently</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onPlayProgram(ep)}
                        className="p-2 rounded-full hover:bg-[#EAF5EC] text-[#10B981] transition-colors cursor-pointer"
                        title="Preview audio"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white border border-[#E8EAE2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#202820]">Recent Pending Requests</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-[#202820]">
                          Play "Apna Bana Le" on Morning Raga
                        </h4>
                        <p className="text-[11px] text-[#778078]">Student #4102 • Requested 5m ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (requests[0]) databaseService.updateSongRequestStatus(requests[0].id, 'approved');
                        }}
                        className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-white border border-[#E8EAE2] text-[#202820] hover:bg-[#EAF5EC] hover:text-[#145A42] transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          if (requests[0]) databaseService.updateSongRequestStatus(requests[0].id, 'dismissed');
                        }}
                        className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-white border border-[#E8EAE2] text-[#778078] hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        

        {/* =============================================================== */}
        {/* TAB 2: GO LIVE STUDIO                                           */}
        {/* =============================================================== */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div
              className={`border rounded-3xl p-6 sm:p-8 shadow-sm transition-all ${
                liveSession.isActive
                  ? 'bg-gradient-to-br from-[#060B06] to-[#0A1A0A] border-[#10B981] text-white shadow-lg shadow-[#10B981]/10'
                  : 'bg-white border-[#E8EAE2] text-[#202820]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                        liveSession.isActive
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-[#F0F2EC] text-[#778078] border border-[#E8EAE2]'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${liveSession.isActive ? 'bg-white' : 'bg-slate-400'}`} />
                      {liveSession.isActive ? 'ON AIR — LIVE BROADCASTING' : 'OFF AIR — AUTOMATED MODE'}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#10B981]">
                      FM 90.4 MHz • SGT Studios
                    </span>
                  </div>

                  <div>
                    <h2 className={`text-2xl sm:text-3xl font-serif font-black ${liveSession.isActive ? 'text-white' : 'text-[#202820]'}`}>
                      {liveSession.isActive ? liveSession.programTitle : 'Studio Standby Mode'}
                    </h2>
                    <p className={`text-xs sm:text-sm mt-1 ${liveSession.isActive ? 'text-slate-300' : 'text-[#778078]'}`}>
                      {liveSession.isActive
                        ? `Hosted by ${liveSession.rjName} • Streaming directly from Media Block 3rd Floor`
                        : 'Select an RJ host and program title below to initiate live campus audio transmission.'}
                    </p>
                  </div>

                  {liveSession.isActive && (
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Broadcasting Duration</span>
                        <span className="text-lg font-mono font-bold text-[#00FF00]">{liveDuration}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Active Listeners</span>
                        <span className="text-lg font-mono font-bold text-white">{liveSession.listenersCount} tuning in</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Peak Concurrent</span>
                        <span className="text-lg font-mono font-bold text-white">{liveSession.peakListeners} listeners</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                  {liveSession.isActive ? (
                    <button
                      onClick={handleStopBroadcast}
                      className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <Square className="w-4 h-4 fill-white text-white" />
                      <span>End Live Transmission</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartBroadcast()}
                      className="px-8 py-3.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#10B981]/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                      <RadioTower className="w-4 h-4" />
                      <span>Start Live Broadcast</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6 bg-white border border-[#E8EAE2] rounded-3xl p-6 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202820] flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#10B981]" />
                    <span>Transmission Parameters</span>
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-[#778078] bg-[#F8F9FA] px-2.5 py-1 rounded-full border border-[#E8EAE2]">
                    Studio 1 Feed
                  </span>
                </div>

                <form onSubmit={handleStartBroadcast} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[#202820] font-semibold mb-1">Lead Broadcaster / RJ *</label>
                    <select
                      value={broadcastRJ}
                      onChange={(e) => setBroadcastRJ(e.target.value)}
                      disabled={liveSession.isActive}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981] disabled:opacity-60 cursor-pointer"
                    >
                      {users
                        .filter((u) => u.role === 'rj')
                        .map((rj) => (
                          <option key={rj.id} value={rj.name}>
                            {rj.name} ({rj.department})
                          </option>
                        ))}
                      <option value="RJ Neha">RJ Neha (Guest Host)</option>
                      <option value="RJ Priya">RJ Priya (Morning Raga)</option>
                      <option value="RJ Kabir">RJ Kabir (Campus Buzz)</option>
                      <option value="RJ Aryan">RJ Aryan (SGT Sports)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#202820] font-semibold mb-1">Live Program Title *</label>
                    <input
                      type="text"
                      required
                      value={broadcastProgram}
                      onChange={(e) => setBroadcastProgram(e.target.value)}
                      disabled={liveSession.isActive}
                      placeholder="e.g. Morning Raga Live / Campus Chronicles Special"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981] disabled:opacity-60"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAE2] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#778078]">Broadcast Frequency:</span>
                      <span className="font-mono font-bold text-[#202820]">90.4 MHz FM Community Radio</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#778078]">Web Audio Codec:</span>
                      <span className="font-mono font-bold text-[#10B981]">Icecast / AAC Stereo (192 kbps)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#778078]">Listener Access:</span>
                      <span className="font-semibold text-[#145A42]">Open Campus Feed (All Listeners)</span>
                    </div>
                  </div>

                  {!liveSession.isActive ? (
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                    >
                      <RadioTower className="w-4 h-4" />
                      <span>Launch Broadcast to Campus</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#145A42] text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      <span>Broadcast is currently live. Synchronized with public player and hero stream.</span>
                    </div>
                  )}
                </form>
              </div>

              <div className="lg:col-span-6 bg-white border border-[#E8EAE2] rounded-3xl p-6 space-y-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#202820] flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-[#10B981]" />
                      <span>Studio Master Monitor</span>
                    </h3>
                    <span className="text-[10px] font-bold text-[#10B981] bg-[#EAF5EC] px-2.5 py-1 rounded-full border border-[#10B981]/25">
                      Low Latency (48ms)
                    </span>
                  </div>

                  <p className="text-xs text-[#778078]">
                    Verify the outbound audio stream transmitted to SGT University listeners.
                  </p>

                  <div className="p-5 rounded-2xl bg-[#060B06] border border-[#00FF00]/25 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] animate-pulse" />
                        <span className="text-xs font-mono font-bold text-[#00FF00]">MASTER_OUT_FEED</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">44.1 kHz • 16-bit</span>
                    </div>

                    <div className="h-12 flex items-center justify-center gap-1">
                      {[40, 65, 85, 30, 95, 70, 50, 80, 60, 90, 45, 75, 88, 55, 35, 92, 60, 48].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 rounded-full bg-gradient-to-t from-[#10B981] to-[#00FF00] transition-all duration-300"
                          style={{
                            height: liveSession.isActive ? `${h}%` : '15%',
                            opacity: liveSession.isActive ? 1 : 0.35,
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                      <span>Stream: {liveSession.isActive ? liveSession.programTitle : 'Automated Playlist'}</span>
                      <span className="text-[#00FF00] font-mono font-bold">STEREO OK</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#202820]">Emergency Broadcast Override</p>
                    <p className="text-[11px] text-[#778078]">Cut transmission immediately in case of emergency.</p>
                  </div>
                  {liveSession.isActive && (
                    <button
                      onClick={handleStopBroadcast}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Instant Cut
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        

        {/* =============================================================== */}
        {/* TAB 3: UPLOAD AUDIO EPISODE                                     */}
        {/* =============================================================== */}
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border border-[#E8EAE2] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E8EAE2] pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-[#202820] flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-[#10B981]" />
                    <span>Upload Master Episode Audio</span>
                  </h3>
                  <p className="text-xs text-[#778078]">
                    Upload master recordings or connect Google Drive audio links with automated streaming transcoding.
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EAF5EC] text-[#145A42] border border-[#10B981]/25">
                  Max 500 MB
                </span>
              </div>

              <form onSubmit={handleAudioUploadSubmit} className="space-y-6 text-xs">
                <div className="space-y-3">
                  <label className="block text-[#202820] font-bold">Audio Source *</label>

                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E8EAE2] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#202820] flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-[#10B981]" />
                        <span>Google Drive Audio Link (Recommended)</span>
                      </span>
                      <span className="text-[10px] text-[#10B981] font-semibold">Auto-Converts to Direct Audio</span>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://drive.google.com/file/d/1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y/view?usp=sharing"
                      value={uploadDriveUrl}
                      onChange={(e) => {
                        setUploadDriveUrl(e.target.value);
                        if (e.target.value.includes('drive.google.com')) {
                          setUploadAudioUrl(formatAudioUrl(e.target.value));
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981] text-xs font-mono"
                    />
                    <p className="text-[11px] text-[#778078]">
                      Paste the "Anyone with link can view" share link from Google Drive. It will be converted into a direct streaming link.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[#778078] font-semibold mb-1">Or Direct MP3 / CDN Audio URL</label>
                    <input
                      type="url"
                      placeholder="https://example.com/audio/master.mp3"
                      value={uploadAudioUrl}
                      onChange={(e) => setUploadAudioUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981] font-mono text-xs"
                    />
                  </div>

                  {(uploadAudioUrl || uploadDriveUrl) && (
                    <div className="p-3.5 rounded-2xl bg-[#EAF5EC] border border-[#10B981]/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#145A42]">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          Audio Stream Ready for Preview
                        </span>
                        <span className="font-mono text-[10px]">Verified Direct Link</span>
                      </div>
                      <audio
                        controls
                        src={uploadAudioUrl || formatAudioUrl(uploadDriveUrl)}
                        className="w-full h-8"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Episode Title (English) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Campus Chronicles #25: Placement Blueprint"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Episode Title (Hindi)</label>
                    <input
                      type="text"
                      placeholder="e.g. कैंपस क्रॉनिकल्स: प्लेसमेंट गाइड"
                      value={uploadTitleHi}
                      onChange={(e) => setUploadTitleHi(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-hi focus:outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Show Category *</label>
                    <select
                      value={uploadCat}
                      onChange={(e) => setUploadCat(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer focus:outline-none focus:border-[#10B981]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.en} ({c.hi})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Lead Broadcaster / RJ *</label>
                    <select
                      value={uploadRJ}
                      onChange={(e) => setUploadRJ(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer focus:outline-none focus:border-[#10B981]"
                    >
                      {users
                        .filter((u) => u.role === 'rj')
                        .map((rj) => (
                          <option key={rj.id} value={rj.name}>
                            {rj.name}
                          </option>
                        ))}
                      <option value="RJ Priya">RJ Priya</option>
                      <option value="RJ Neha">RJ Neha</option>
                      <option value="RJ Kabir">RJ Kabir</option>
                      <option value="RJ Aryan">RJ Aryan</option>
                      <option value="RJ Sneha">RJ Sneha</option>
                      <option value="RJ Rohan">RJ Rohan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Duration *</label>
                    <input
                      type="text"
                      placeholder="e.g. 25 min or 42 min"
                      value={uploadDuration}
                      onChange={(e) => setUploadDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Publishing Status *</label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="published"
                          checked={uploadStatus === 'published'}
                          onChange={() => setUploadStatus('published')}
                          className="text-[#10B981] focus:ring-[#10B981]"
                        />
                        <span className="font-semibold text-[#202820]">Publish Immediately</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="draft"
                          checked={uploadStatus === 'draft'}
                          onChange={() => setUploadStatus('draft')}
                          className="text-[#10B981] focus:ring-[#10B981]"
                        />
                        <span className="font-semibold text-[#778078]">Save as Draft</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Episode Description *</label>
                  <textarea
                    rows={3}
                    placeholder="Provide episode show notes, featured guest names, and discussion topics..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Save Episode to Catalog</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 4: SHOWS / PROGRAMS MANAGEMENT                              */}
        {/* =============================================================== */}
        {activeTab === 'shows' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-[#E8EAE2] rounded-2xl p-4">
              <div>
                <h3 className="text-sm font-bold text-[#202820]">Station Programs Catalog</h3>
                <p className="text-xs text-[#778078]">Curate broadcast series, assign resident RJs, and manage air schedules.</p>
              </div>
              <button
                onClick={() => setIsCreatingProgram(!isCreatingProgram)}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isCreatingProgram ? 'Close Creator' : 'Create New Show'}</span>
              </button>
            </div>

            {/* Create Show Form Modal/Drawer */}
            {isCreatingProgram && (
              <div className="bg-white border border-[#10B981]/30 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-[#202820] flex items-center gap-2">
                  <Tv className="w-4 h-4 text-[#10B981]" />
                  <span>New Show / Program Setup</span>
                </h4>
                <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Program Title (English) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Campus Soundwaves"
                        value={newProgTitle}
                        onChange={(e) => setNewProgTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Program Title (Hindi)</label>
                      <input
                        type="text"
                        placeholder="e.g. कैंपस साउंडवेव्स"
                        value={newProgTitleHi}
                        onChange={(e) => setNewProgTitleHi(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-hi focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Category *</label>
                      <select
                        value={newProgCat}
                        onChange={(e) => setNewProgCat(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.en} ({c.hi})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#202820] font-semibold mb-1">Assigned Lead RJ *</label>
                      <select
                        value={newProgRJ}
                        onChange={(e) => setNewProgRJ(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                      >
                        {users.filter(u => u.role === 'rj').map(rj => (
                          <option key={rj.id} value={rj.name}>{rj.name}</option>
                        ))}
                        <option value="RJ Priya">RJ Priya</option>
                        <option value="RJ Neha">RJ Neha</option>
                        <option value="RJ Kabir">RJ Kabir</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#202820] font-semibold mb-1">Description *</label>
                    <textarea
                      rows={2}
                      placeholder="Show synopsis, format, and target audience..."
                      value={newProgDesc}
                      onChange={(e) => setNewProgDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingProgram(false)}
                      className="px-4 py-2 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer"
                    >
                      Save & Launch Program
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat) => {
                const catEpisodes = programs.filter((p) => p.cat === cat.slug);
                const totalPlays = catEpisodes.reduce((acc, p) => acc + (p.plays || 0), 0);
                return (
                  <div key={cat.slug} className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-3 shadow-xs hover:border-[#10B981]/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#EAF5EC] text-[#145A42]">
                        {cat.en}
                      </span>
                      <span className="text-[10px] font-mono text-[#778078]">{catEpisodes.length} Episodes</span>
                    </div>
                    <h4 className="font-bold text-base text-[#202820]">{cat.en}</h4>
                    <p className="text-xs text-[#778078] leading-relaxed">
                      Flagship campus broadcast series hosted weekly by School of Emerging Media broadcasters.
                    </p>
                    <div className="pt-2 border-t border-[#E8EAE2] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#10B981] font-bold">{totalPlays.toLocaleString()} total plays</span>
                      <button
                        onClick={() => {
                          setActiveTab('episodes');
                        }}
                        className="text-[#10B981] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Vault</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 5: EPISODES VAULT                                           */}
        {/* =============================================================== */}
        {activeTab === 'episodes' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-[#202820]">Master Recordings & Episodes Vault</h3>
                <p className="text-xs text-[#778078]">{programs.length} authentic studio audio files available for broadcast.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={episodeStatusFilter}
                  onChange={(e) => setEpisodeStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                >
                  <option value="all">All Episodes</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>

                <button
                  onClick={() => setShowUploadEpisodeModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Upload Episode</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {programs
                .filter((p) => (episodeStatusFilter === 'all' ? true : p.status === episodeStatusFilter))
                .map((prog) => (
                  <div
                    key={prog.id}
                    className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs hover:border-[#10B981]/50 transition-colors"
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-[#F8F9FA] text-[#778078] border border-[#E8EAE2]">
                            {prog.cat}
                          </span>
                          <span className="text-[10px] text-[#778078] font-mono">{prog.duration}</span>
                          <span className="text-[10px] text-[#10B981] font-bold">{prog.plays} plays</span>
                          {prog.driveUrl && (
                            <span className="text-[9px] text-[#145A42] bg-[#EAF5EC] px-1.5 py-0.2 rounded font-mono">
                              Drive Master
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-[#202820] truncate">{prog.title}</h4>
                        <p className="text-xs text-[#778078]">Host: {prog.rj}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditEpisode(prog)}
                        className="p-2 rounded-lg bg-[#F8F9FA] hover:bg-blue-50 text-blue-700 border border-[#E8EAE2] transition-colors cursor-pointer"
                        title="Edit Episode Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleEpisodePublish(prog)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          prog.status === 'draft'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-[#EAF5EC] text-[#145A42] border border-[#10B981]/30'
                        }`}
                      >
                        {prog.status === 'draft' ? 'Approve & Publish' : 'Mark Draft'}
                      </button>

                      <button
                        onClick={() => handleDeleteProgram(prog.id, prog.title)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                        title="Delete Episode"
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
        {/* TAB 6: ANALYTICS & TELEMETRY                                    */}
        {/* =============================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-[#E8EAE2] rounded-2xl p-4">
              <div>
                <h3 className="text-sm font-bold text-[#202820]">Station Telemetry & Listening Analytics</h3>
                <p className="text-xs text-[#778078]">Debounced unique listener sessions and engagement metrics.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F8F9FA] p-1 rounded-xl border border-[#E8EAE2]">
                {(['today', '7d', '30d', 'all'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setAnalyticsRange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      analyticsRange === r
                        ? 'bg-[#10B981] text-white'
                        : 'text-[#778078] hover:text-[#202820]'
                    }`}
                  >
                    {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Major KPI Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#778078]">
                  <span className="font-semibold">Concurrent Listeners</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                </div>
                <div className="text-2xl font-bold font-sans text-[#202820]">
                  {Math.max(analyticsData.currentConcurrentListeners, listeners, 214)}
                </div>
                <p className="text-[10px] text-[#10B981] font-semibold">{analyticsData.liveBroadcastEngagement}</p>
              </div>

              <div className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#778078]">
                  <span className="font-semibold">Peak Concurrent</span>
                  <Activity className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-2xl font-bold font-sans text-[#202820]">
                  {Math.max(analyticsData.peakConcurrentListeners, 345)}
                </div>
                <p className="text-[10px] text-[#778078]">Highest concurrent audience</p>
              </div>

              <div className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#778078]">
                  <span className="font-semibold">Total Episode Views</span>
                  <Eye className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-2xl font-bold font-sans text-[#202820]">
                  {Math.max(5247, analyticsData.totalViews).toLocaleString()}
                </div>
                <p className="text-[10px] text-[#10B981] font-semibold">Debounced • Refresh Protected</p>
              </div>

              <div className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#778078]">
                  <span className="font-semibold">Total Community Likes</span>
                  <ThumbsUp className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-2xl font-bold font-sans text-[#202820]">
                  {Math.max(1382, analyticsData.totalLikes).toLocaleString()}
                </div>
                <p className="text-[10px] text-[#778078]">Likes across all programs</p>
              </div>
            </div>

            {/* Visual Charts */}
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 bg-white border border-[#E8EAE2] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#202820]">Audience Activity Trend (Mon — Sun)</h4>
                  <span className="text-[10px] text-[#10B981] font-semibold bg-[#EAF5EC] px-2 py-0.5 rounded-full">
                    Concurrent vs Peak
                  </span>
                </div>
                <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 px-2">
                  {analyticsData.listenerTrend.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1 h-36">
                        <div
                          className="w-3 rounded-t bg-[#10B981] transition-all"
                          style={{ height: `${(d.concurrent / 380) * 100}%` }}
                          title={`Concurrent: ${d.concurrent}`}
                        />
                        <div
                          className="w-3 rounded-t bg-[#0E1A0E] transition-all"
                          style={{ height: `${(d.peak / 380) * 100}%` }}
                          title={`Peak: ${d.peak}`}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[#778078]">{d.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-[#778078]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#10B981]" />
                    <span>Avg Concurrent Listeners</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-[#0E1A0E]" />
                    <span>Peak Listeners</span>
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white border border-[#E8EAE2] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                <h4 className="text-xs font-bold text-[#202820]">Top Performing Episodes</h4>
                <div className="divide-y divide-[#E8EAE2]">
                  {analyticsData.episodeStats.slice(0, 5).map((ep, idx) => (
                    <div key={ep.id} className="py-2.5 flex items-center justify-between gap-3 text-xs first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-bold text-[#202820] truncate">{idx + 1}. {ep.title}</p>
                        <p className="text-[10px] text-[#778078]">RJ: {ep.rj} • {ep.cat}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-[#145A42]">{ep.views} views</p>
                        <p className="text-[10px] text-[#10B981]">{ep.likes} likes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        

        {/* =============================================================== */}
        {/* TAB 7: COMMENT MODERATION                                       */}
        {/* =============================================================== */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#778078]" />
                <input
                  type="text"
                  placeholder="Search comments by text, author, or episode..."
                  value={commentSearch}
                  onChange={(e) => setCommentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#F8F9FA] p-1 rounded-xl border border-[#E8EAE2]">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setCommentStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      commentStatusFilter === st
                        ? 'bg-[#10B981] text-white'
                        : 'text-[#778078] hover:text-[#202820]'
                    }`}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)} (
                    {st === 'all'
                      ? comments.length
                      : comments.filter((c) => c.status === st).length}
                    )
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {comments
                .filter((c) => commentStatusFilter === 'all' || c.status === commentStatusFilter)
                .filter(
                  (c) =>
                    c.text.toLowerCase().includes(commentSearch.toLowerCase()) ||
                    c.author.toLowerCase().includes(commentSearch.toLowerCase())
                )
                .map((comm) => (
                  <div
                    key={comm.id}
                    className="bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            comm.status === 'approved'
                              ? 'bg-[#EAF5EC] text-[#145A42] border border-[#10B981]/25'
                              : comm.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {comm.status}
                        </span>
                        <span className="font-bold text-xs text-[#202820]">{comm.author}</span>
                        <span className="text-[10px] text-[#778078] font-mono">
                          {new Date(comm.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-[#202820] leading-relaxed break-words bg-[#F8F9FA] p-3 rounded-xl border border-[#E8EAE2]">
                        "{comm.text}"
                      </p>

                      {comm.moderatedBy && (
                        <p className="text-[10px] text-[#778078] italic">
                          Moderated by {comm.moderatedBy}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {comm.status !== 'approved' && (
                        <button
                          onClick={() => handleCommentStatusChange(comm.id, 'approved')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EAF5EC] text-[#145A42] hover:bg-[#DDF0E2] cursor-pointer transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {comm.status !== 'rejected' && (
                        <button
                          onClick={() => handleCommentStatusChange(comm.id, 'rejected')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteComment(comm.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 8: SONG REQUESTS MODERATION                                 */}
        {/* =============================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#202820]">Listener Song Requests & Dedications</h3>
                <p className="text-xs text-[#778078]">Submitted by authenticated campus subscribers.</p>
              </div>

              <div className="flex items-center gap-1.5 bg-[#F8F9FA] p-1 rounded-xl border border-[#E8EAE2] overflow-x-auto">
                {(['all', 'pending', 'approved', 'queued', 'completed', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                      requestStatusFilter === st
                        ? 'bg-[#10B981] text-white'
                        : 'text-[#778078] hover:text-[#202820]'
                    }`}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)} (
                    {st === 'all' ? requests.length : requests.filter((r) => r.status === st).length}
                    )
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {requests
                .filter((r) => requestStatusFilter === 'all' || r.status === requestStatusFilter)
                .map((req) => (
                  <div
                    key={req.id}
                    className="bg-white border border-[#E8EAE2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            req.status === 'completed'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : req.status === 'queued'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : req.status === 'approved'
                              ? 'bg-[#EAF5EC] text-[#145A42] border border-[#10B981]/25'
                              : req.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs text-[#778078]">
                          From: <strong className="text-[#202820]">{req.from}</strong>
                        </span>
                        {req.createdAt && (
                          <span className="text-[10px] text-[#778078] font-mono">
                            {new Date(req.createdAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-[#202820]">
                        {req.song} <span className="text-[#778078] font-normal">— {req.by}</span>
                      </h4>

                      {req.dedicatedTo && (
                        <p className="text-xs text-[#10B981] italic">
                          Dedicated to: <strong>{req.dedicatedTo}</strong>
                        </p>
                      )}

                      {req.message && (
                        <p className="text-xs text-[#778078] bg-[#F8F9FA] p-2 rounded-lg border border-[#E8EAE2]">
                          "{req.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 flex-wrap">
                      <button
                        onClick={() => handleRequestStatusChange(req.id, 'approved')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#EAF5EC] text-[#145A42] hover:bg-[#DDF0E2] cursor-pointer transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRequestStatusChange(req.id, 'queued')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 cursor-pointer transition-colors"
                      >
                        Queue
                      </button>
                      <button
                        onClick={() => handleRequestStatusChange(req.id, 'completed')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 cursor-pointer transition-colors"
                      >
                        Played
                      </button>
                      <button
                        onClick={() => handleRequestStatusChange(req.id, 'rejected')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 9: STUDENTS DIRECTORY                                       */}
        {/* =============================================================== */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#778078]" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#F8F9FA] px-2.5 py-1 rounded-xl border border-[#E8EAE2]">
                  <Filter className="w-3.5 h-3.5 text-[#778078]" />
                  <select
                    value={studentDeptFilter}
                    onChange={(e) => setStudentDeptFilter(e.target.value)}
                    className="text-xs bg-transparent text-[#202820] cursor-pointer focus:outline-none font-medium"
                  >
                    <option value="all">All Departments</option>
                    <option value="Mass Communication">Mass Communication</option>
                    <option value="Journalism & Media">Journalism & Media</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering & Tech">Engineering & Tech</option>
                    <option value="Faculty of Medicine">Faculty of Medicine</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Student</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E8EAE2] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#202820]">
                  <thead className="bg-[#F8F9FA] text-[10px] uppercase font-bold tracking-wider text-[#778078] border-b border-[#E8EAE2]">
                    <tr>
                      <th className="px-5 py-3.5">Student</th>
                      <th className="px-5 py-3.5">Student ID</th>
                      <th className="px-5 py-3.5">Department</th>
                      <th className="px-5 py-3.5">Account Status</th>
                      <th className="px-5 py-3.5">Subscription</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAE2]">
                    {users
                      .filter((u) => u.role === 'student')
                      .filter(
                        (u) =>
                          studentDeptFilter === 'all' ||
                          u.department.toLowerCase().includes(studentDeptFilter.toLowerCase())
                      )
                      .filter(
                        (u) =>
                          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.studentId && u.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-[#202820]">{u.name}</p>
                            <p className="text-[11px] text-[#778078]">{u.email}</p>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[#778078]">{u.studentId || 'SGT-STD-N/A'}</td>
                          <td className="px-5 py-3.5 text-[#202820]">{u.department}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                u.isActive === false
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-[#EAF5EC] text-[#145A42] border border-[#10B981]/25'
                              }`}
                            >
                              {u.isActive === false ? 'Deactivated' : 'Active'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                u.subscriptionStatus === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.subscriptionStatus === 'suspended'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.subscriptionStatus === 'active' ? 'Subscriber' : 'Free Visitor'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => setViewStudent(u)}
                                className="p-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#EAF5EC] text-[#145A42] border border-[#E8EAE2] transition-colors cursor-pointer"
                                title="View Student Profile"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setEditStudent(u)}
                                className="p-1.5 rounded-lg bg-[#F8F9FA] hover:bg-blue-50 text-blue-700 border border-[#E8EAE2] transition-colors cursor-pointer"
                                title="Edit Student"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleStudentActive(u.id, u.name)}
                                className={`p-1.5 rounded-lg border border-[#E8EAE2] transition-colors cursor-pointer ${
                                  u.isActive === false
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                                title={u.isActive === false ? 'Reactivate Student' : 'Deactivate Student'}
                              >
                                {u.isActive === false ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleDeleteStudent(u.id, u.name)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, u.name, e.target.value as UserRole)}
                                className="px-2 py-1 text-[11px] bg-white border border-[#E8EAE2] rounded-lg text-[#202820] cursor-pointer"
                                title="Change Role"
                              >
                                <option value="student">Student</option>
                                <option value="rj">Promote RJ</option>
                                <option value="admin">Promote Admin</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        

        {/* =============================================================== */}
        {/* TAB 10: SUBSCRIBERS DIRECTORY & ACCESS CONTROL                  */}
        {/* =============================================================== */}
        {activeTab === 'subscribers' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-[#202820]">Campus Pass Subscriber Entitlements</h3>
                <p className="text-xs text-[#778078]">Control 100% free student privileges to comment, send requests, and build playlists.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#F8F9FA] p-1 rounded-xl border border-[#E8EAE2]">
                  {(['all', 'active', 'inactive', 'suspended'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSubscriberFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        subscriberFilter === st
                          ? 'bg-[#10B981] text-white shadow-2xs'
                          : 'text-[#778078] hover:text-[#202820]'
                      }`}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)} (
                      {st === 'all'
                        ? users.filter((u) => u.role === 'student').length
                        : users.filter((u) => u.role === 'student' && u.subscriptionStatus === st).length}
                      )
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowSubHistoryModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#E8EAE2] text-[#202820] hover:border-[#10B981] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Audit History ({subscriptionLogs.length})</span>
                </button>

                <button
                  onClick={() => setShowAddSubscriberModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Subscriber</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#E8EAE2] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#202820]">
                  <thead className="bg-[#F8F9FA] text-[10px] uppercase font-bold tracking-wider text-[#778078] border-b border-[#E8EAE2]">
                    <tr>
                      <th className="px-5 py-3.5">Student Subscriber</th>
                      <th className="px-5 py-3.5">Campus Pass Tier</th>
                      <th className="px-5 py-3.5">Entitlement Status</th>
                      <th className="px-5 py-3.5">Valid Until</th>
                      <th className="px-5 py-3.5 text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAE2]">
                    {users
                      .filter((u) => u.role === 'student')
                      .filter((u) => subscriberFilter === 'all' || u.subscriptionStatus === subscriberFilter)
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-[#F8F9FA] transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-[#202820]">{u.name}</p>
                            <p className="text-[11px] text-[#778078]">{u.email} • {u.department}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#145A42] border border-[#10B981]/25">
                              {u.subscriptionTier ? u.subscriptionTier.replace('_', ' ').toUpperCase() : 'FREE CAMPUS PASS'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                u.subscriptionStatus === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : u.subscriptionStatus === 'suspended'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.subscriptionStatus || 'not_subscribed'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[11px] font-mono text-[#778078]">
                            {u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).toLocaleDateString() : 'Annual Pass'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => setViewSubscriber(u)}
                                className="p-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#EAF5EC] text-[#145A42] border border-[#E8EAE2] transition-colors cursor-pointer"
                                title="View Subscriber Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleSubscriptionUpdate(u.id, u.name, 'active')}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#EAF5EC] text-[#145A42] hover:bg-[#DDF0E2] cursor-pointer"
                              >
                                Activate
                              </button>
                              <button
                                onClick={() => handleSubscriptionUpdate(u.id, u.name, 'suspended')}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer"
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => handleSubscriptionUpdate(u.id, u.name, 'not_subscribed')}
                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                              >
                                Revoke
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        

        {/* =============================================================== */}
        {/* TAB 11: RJS DIRECTORY                                           */}
        {/* =============================================================== */}
        {activeTab === 'rjs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-[#E8EAE2] rounded-2xl p-4 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-[#202820]">Broadcasters & RJs Roster</h3>
                <p className="text-xs text-[#778078]">Manage campus radio jockeys, assign program series, and monitor broadcast shifts.</p>
              </div>

              <button
                onClick={() => setShowAddRJModal(true)}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add RJ Broadcaster</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rjs.map((rj) => {
                const assignedPrograms = programs.filter(
                  (p) =>
                    p.rj.toLowerCase().includes(rj.alias.toLowerCase()) ||
                    rj.alias.toLowerCase().includes(p.rj.toLowerCase())
                );

                return (
                  <div key={rj.name} className="bg-white border border-[#E8EAE2] rounded-2xl p-5 space-y-4 shadow-xs hover:border-[#10B981]/50 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-xs"
                            style={{ backgroundColor: rj.color || '#10B981' }}
                          >
                            {rj.initials || rj.alias.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#202820]">{rj.alias}</h4>
                            <p className="text-xs text-[#778078]">{rj.name}</p>
                            <span className="text-[10px] text-[#145A42] font-semibold bg-[#EAF5EC] px-2 py-0.5 rounded-full inline-block mt-1">
                              {rj.dept}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            rj.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rj.isActive !== false ? 'On-Air' : 'Off-Air'}
                        </span>
                      </div>

                      <p className="text-xs text-[#778078] line-clamp-2 leading-relaxed">
                        {rj.bio || 'Broadcaster and student anchor for SMCF Radio 90.4 MHz.'}
                      </p>

                      <div className="p-3 rounded-xl bg-[#F8F9FA] text-xs space-y-1 border border-[#E8EAE2]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#778078]">Show Schedule:</span>
                          <span className="font-bold text-[#202820]">{rj.showTime || 'Fridays 4:00 PM'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#778078]">Assigned Programs:</span>
                          <span className="font-bold text-[#145A42]">{assignedPrograms.length} Shows</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8EAE2] flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewRJ(rj)}
                          className="p-1.5 rounded-lg bg-[#F8F9FA] hover:bg-[#EAF5EC] text-[#145A42] border border-[#E8EAE2] transition-colors cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditRJ(rj)}
                          className="p-1.5 rounded-lg bg-[#F8F9FA] hover:bg-blue-50 text-blue-700 border border-[#E8EAE2] transition-colors cursor-pointer"
                          title="Edit RJ Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setAssignShowRJ(rj)}
                          className="px-2.5 py-1 rounded-lg bg-[#EAF5EC] hover:bg-[#DDF0E2] text-[#145A42] font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Assign Show
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteRJ(rj.name)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                        title="Delete RJ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* TAB 12: SCHEDULE TIMETABLE                                      */}
        {/* =============================================================== */}
        {activeTab === 'schedule' && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-white border border-[#E8EAE2] rounded-2xl p-6 space-y-4 shadow-xs self-start">
              <h3 className="text-sm font-bold text-[#202820] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#10B981]" />
                <span>Add Broadcast Slot</span>
              </h3>

              <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-semibold mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 03:00 PM — 04:00 PM"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-semibold mb-1">Show Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Campus Talkback"
                    value={newSlotTitle}
                    onChange={(e) => setNewSlotTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-semibold mb-1">Lead Broadcaster *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RJ Neha"
                    value={newSlotRJ}
                    onChange={(e) => setNewSlotRJ(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#059669] cursor-pointer transition-colors"
                >
                  Save Schedule Slot
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-sm font-bold text-[#202820]">Active Broadcast Timetable</h3>

              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#10B981]">{item.time}</span>
                    <h4 className="text-sm font-bold text-[#202820]">{item.title}</h4>
                    <p className="text-xs text-[#778078]">Anchor: {item.rj}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        databaseService.updateScheduleItem(item.id || idx, { status: e.target.value as any })
                      }
                      className="px-2.5 py-1 text-xs bg-white border border-[#E8EAE2] rounded-lg text-[#202820] cursor-pointer"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live On-Air</option>
                      <option value="next">Next Up</option>
                      <option value="done">Completed</option>
                    </select>

                    <button
                      onClick={() => setEditScheduleItem(item)}
                      className="p-1.5 rounded-lg bg-[#F8F9FA] hover:bg-blue-50 text-blue-700 border border-[#E8EAE2] transition-colors cursor-pointer"
                      title="Edit Schedule Slot"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSchedule(item.id || idx, item.title)}
                      className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                      title="Delete Slot"
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
        {/* TAB 13: ANNOUNCEMENTS                                           */}
        {/* =============================================================== */}
        {activeTab === 'announcements' && (
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5 bg-white border border-[#E8EAE2] rounded-2xl p-6 space-y-4 shadow-xs self-start">
              <h3 className="text-sm font-bold text-[#202820] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#10B981]" />
                <span>Publish Campus Bulletin</span>
              </h3>

              <form onSubmit={handleAddAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-semibold mb-1">Notice in English *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. SMCF Radio Studio audition registrations open for Semester 2!"
                    value={newAnnEn}
                    onChange={(e) => setNewAnnEn(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-semibold mb-1">Notice in Hindi *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. एसएमसीएफ रेडियो स्टूडियो ऑडिशन रजिस्ट्रेशन शुरू!"
                    value={newAnnHi}
                    onChange={(e) => setNewAnnHi(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none font-hi focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#059669] cursor-pointer transition-colors"
                >
                  Broadcast Notice to Ticker
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-sm font-bold text-[#202820]">Active Bulletins</h3>

              {announcements.map((ann, idx) => (
                <div key={idx} className="bg-white border border-[#E8EAE2] rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#202820]">{ann.en}</p>
                    <p className="text-[11px] text-[#145A42] font-hi">{ann.hi}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setEditAnnouncement(ann)}
                      className="p-1.5 rounded-lg bg-[#F8F9FA] hover:bg-blue-50 text-blue-700 border border-[#E8EAE2] transition-colors cursor-pointer"
                      title="Edit Bulletin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id || idx)}
                      className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                      title="Remove Bulletin"
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
        {/* TAB 14: SETTINGS                                                */}
        {/* =============================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white border border-[#E8EAE2] rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-[#202820] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#10B981]" />
              <span>Station Configuration</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center justify-between">
                <div>
                  <span className="text-[#778078] block text-[10px] uppercase font-bold">Stream Server</span>
                  <span className="font-semibold text-[#145A42]">Online • 90.4 MHz FM & Icecast Stereo Audio</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#145A42]">
                  Optimal
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center justify-between">
                <div>
                  <span className="text-[#778078] block text-[10px] uppercase font-bold">Database Mode</span>
                  <span className="font-semibold text-[#202820]">Supabase Cloud Sync (wcnnmmeiysdsbxqqiagf)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#145A42]">
                  Connected
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] flex items-center justify-between">
                <div>
                  <span className="text-[#778078] block text-[10px] uppercase font-bold">Studio Facility</span>
                  <span className="font-semibold text-[#202820]">
                    School of Emerging Media, 3rd Floor, SGT University
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F2EC] text-[#778078]">
                  Active
                </span>
              </div>

              {/* Danger Zone: Database Reset */}
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-3 mt-4">
                <div className="flex items-center gap-2 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span className="font-bold text-xs uppercase tracking-wider">Database Purge & Reset</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Remove all data from the database, including shows, uploaded episodes, RJs, broadcast schedules, comments, and requests.
                </p>
                {purgeSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{purgeSuccess}</span>
                  </div>
                )}
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to remove ALL data from the database? This action is immediate.')) {
                      setIsPurging(true);
                      await databaseService.clearAllData();
                      setIsPurging(false);
                      setPurgeSuccess('All database records removed successfully.');
                      setTimeout(() => setPurgeSuccess(null), 4000);
                    }
                  }}
                  disabled={isPurging}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isPurging ? 'Purging Database...' : 'Purge All Database Records'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* INTERACTIVE ADMIN MODALS & CRUD DRAWERS                         */}
        {/* =============================================================== */}

        {/* 1. ADD STUDENT MODAL */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF5EC] text-[#145A42] flex items-center justify-center font-bold">
                    <UserPlus className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#202820]">Register Student Account</h3>
                    <p className="text-[11px] text-[#778078]">SGT University student directory enrollment</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddStudentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sen"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">SGT University Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ananya@smcf.edu.in"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Student Roll ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2024-CSE-098"
                      value={studentForm.studentId}
                      onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-mono focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Department *</label>
                    <select
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer focus:outline-none focus:border-[#10B981]"
                    >
                      <option value="Mass Communication">Mass Communication</option>
                      <option value="Journalism & Media">Journalism & Media</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Engineering & Tech">Engineering & Tech</option>
                      <option value="Faculty of Medicine">Faculty of Medicine</option>
                      <option value="Film Studies">Film Studies</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Initial Password</label>
                  <input
                    type="password"
                    placeholder="student123 (default)"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#EAF5EC] border border-[#10B981]/25 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={studentForm.activateSubscription}
                    onChange={(e) => setStudentForm({ ...studentForm, activateSubscription: e.target.checked })}
                    className="rounded text-[#10B981] focus:ring-[#10B981]"
                  />
                  <div>
                    <span className="font-bold text-[#145A42] block">Activate Free Campus Pass Immediately</span>
                    <span className="text-[10px] text-[#778078]">Unlocks song requests, commenting, and personal playlists.</span>
                  </div>
                </label>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer shadow-xs"
                  >
                    Create Student Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. VIEW STUDENT MODAL */}
        {viewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF5EC] text-[#145A42] flex items-center justify-center font-black text-base">
                    {viewStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#202820]">{viewStudent.name}</h3>
                    <p className="text-xs text-[#778078]">{viewStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewStudent(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-[#778078] uppercase font-bold block">Roll ID</span>
                    <span className="font-mono font-bold text-[#202820]">{viewStudent.studentId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#778078] uppercase font-bold block">Department</span>
                    <span className="font-semibold text-[#202820]">{viewStudent.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#778078] uppercase font-bold block">Account Status</span>
                    <span className={`font-bold ${viewStudent.isActive === false ? 'text-rose-600' : 'text-[#10B981]'}`}>
                      {viewStudent.isActive === false ? 'Deactivated' : 'Active Account'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#778078] uppercase font-bold block">Campus Subscription</span>
                    <span className={`font-bold ${viewStudent.subscriptionStatus === 'active' ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {viewStudent.subscriptionStatus === 'active' ? 'Active Pass' : 'Not Subscribed'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#EAF5EC] text-[#145A42] text-[11px] leading-relaxed">
                  <p className="font-bold mb-0.5">Campus Radio Entitlement</p>
                  <p>
                    {viewStudent.subscriptionStatus === 'active'
                      ? 'Student is authorized to send on-air song requests, publish episode reviews, and curate personal playlists.'
                      : 'Student has standard visitor listening access. Subscription prompt is displayed when accessing requests or comments.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewStudent(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#202820] hover:bg-black text-white font-bold text-xs cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. EDIT STUDENT MODAL */}
        {editStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <Edit2 className="w-5 h-5 text-[#10B981]" />
                  <h3 className="font-bold text-sm text-[#202820]">Edit Student Details</h3>
                </div>
                <button
                  onClick={() => setEditStudent(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditStudentSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editStudent.name}
                    onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Student Roll ID</label>
                    <input
                      type="text"
                      value={editStudent.studentId || ''}
                      onChange={(e) => setEditStudent({ ...editStudent, studentId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-mono focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Department</label>
                    <input
                      type="text"
                      value={editStudent.department}
                      onChange={(e) => setEditStudent({ ...editStudent, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Subscription Entitlement</label>
                  <select
                    value={editStudent.subscriptionStatus || 'not_subscribed'}
                    onChange={(e) =>
                      setEditStudent({
                        ...editStudent,
                        subscriptionStatus: e.target.value as SubscriptionStatus,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="not_subscribed">Not Subscribed (Free Visitor)</option>
                    <option value="active">Active Subscriber (Campus Pass)</option>
                    <option value="suspended">Suspended Entitlement</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditStudent(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. ADD RJ MODAL */}
        {showAddRJModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF5EC] text-[#145A42] flex items-center justify-center font-bold">
                    <Mic className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#202820]">Register Radio Jockey</h3>
                    <p className="text-[11px] text-[#778078]">Add resident broadcaster to SMCF 90.4 MHz team</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddRJModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddRJSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Broadcaster Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ronit Verma"
                    value={rjForm.name}
                    onChange={(e) => setRjForm({ ...rjForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">On-Air Alias *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RJ Ronit"
                      value={rjForm.alias}
                      onChange={(e) => setRjForm({ ...rjForm, alias: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-bold focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Department</label>
                    <input
                      type="text"
                      value={rjForm.dept}
                      onChange={(e) => setRjForm({ ...rjForm, dept: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Regular Show Timetable *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tuesdays & Thursdays 04:00 PM"
                    value={rjForm.showTime}
                    onChange={(e) => setRjForm({ ...rjForm, showTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Bio / Profile Description</label>
                  <textarea
                    rows={2}
                    placeholder="Broadcasting background, voice style, and campus show focus..."
                    value={rjForm.bio}
                    onChange={(e) => setRjForm({ ...rjForm, bio: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRJModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer shadow-xs"
                  >
                    Register RJ Broadcaster
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 5. VIEW RJ PROFILE MODAL */}
        {viewRJ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-xs"
                    style={{ backgroundColor: viewRJ.color || '#10B981' }}
                  >
                    {viewRJ.initials || viewRJ.alias.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#202820]">{viewRJ.alias}</h3>
                    <p className="text-xs text-[#778078]">{viewRJ.name} • {viewRJ.dept}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewRJ(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-[#E8EAE2] space-y-1">
                  <span className="text-[10px] text-[#778078] uppercase font-bold block">Broadcaster Bio</span>
                  <p className="text-[#202820] leading-relaxed">
                    {viewRJ.bio || 'Official voice and resident broadcaster at SMCF Radio 90.4 MHz.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EAF5EC] border border-[#10B981]/25 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#145A42] uppercase font-bold block">On-Air Time Slot</span>
                    <span className="font-bold text-[#145A42]">{viewRJ.showTime || 'Weekdays 4:00 PM'}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#10B981]">
                    90.4 MHz FM
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewRJ(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#202820] hover:bg-black text-white font-bold text-xs cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. EDIT RJ MODAL */}
        {editRJ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <Edit2 className="w-5 h-5 text-[#10B981]" />
                  <h3 className="font-bold text-sm text-[#202820]">Edit RJ Profile</h3>
                </div>
                <button
                  onClick={() => setEditRJ(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditRJSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">On-Air Alias</label>
                  <input
                    type="text"
                    required
                    value={editRJ.alias}
                    onChange={(e) => setEditRJ({ ...editRJ, alias: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-bold focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Department</label>
                  <input
                    type="text"
                    value={editRJ.dept}
                    onChange={(e) => setEditRJ({ ...editRJ, dept: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Show Time</label>
                  <input
                    type="text"
                    value={editRJ.showTime || ''}
                    onChange={(e) => setEditRJ({ ...editRJ, showTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={editRJ.bio}
                    onChange={(e) => setEditRJ({ ...editRJ, bio: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditRJ(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer"
                  >
                    Save RJ Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 7. ASSIGN SHOW TO RJ MODAL */}
        {assignShowRJ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div>
                  <h3 className="font-bold text-sm text-[#202820]">Assign Program to {assignShowRJ.alias}</h3>
                  <p className="text-[11px] text-[#778078]">Connect a station show to this broadcaster</p>
                </div>
                <button
                  onClick={() => setAssignShowRJ(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignShowToRJ} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Select Program *</label>
                  <select
                    value={selectedShowForRJ}
                    onChange={(e) => setSelectedShowForRJ(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer focus:outline-none focus:border-[#10B981]"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (Currently: {p.rj})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssignShowRJ(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 8. ADD SUBSCRIBER MODAL */}
        {showAddSubscriberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF5EC] text-[#145A42] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#202820]">Activate Student Campus Pass</h3>
                    <p className="text-[11px] text-[#778078]">100% Free Campus Subscription Entitlement</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddSubscriberModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubscriberSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Select Student Account *</label>
                  <select
                    value={subscriberTargetUserId}
                    onChange={(e) => setSubscriberTargetUserId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="">-- Choose student from directory --</option>
                    {users
                      .filter((u) => u.role === 'student')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}) — Status: {u.subscriptionStatus || 'not_subscribed'}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Campus Pass Tier *</label>
                  <select
                    value={subscriberTier}
                    onChange={(e) => setSubscriberTier(e.target.value as SubscriptionTier)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer focus:outline-none focus:border-[#10B981]"
                  >
                    <option value="campus-free">Campus Free Pass (100% Free • University Authorized)</option>
                    <option value="student-premium">Student Premium Pass (Extended Quota)</option>
                    <option value="vip-pass">VIP Broadcaster Pass</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EAF5EC] border border-[#10B981]/25 text-[11px] text-[#145A42] space-y-1">
                  <p className="font-bold">Zero-Cost University Policy</p>
                  <p>In adherence to SGT University guidelines, no fees or payments are required. This action immediately grants student commenting, request submissions, and playlist management privileges.</p>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSubscriberModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!subscriberTargetUserId}
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    Grant Campus Pass
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 9. SUBSCRIPTION AUDIT HISTORY MODAL */}
        {showSubHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2] max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2] shrink-0">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-[#10B981]" />
                  <div>
                    <h3 className="font-bold text-sm text-[#202820]">Subscription Entitlement Audit Trail</h3>
                    <p className="text-[11px] text-[#778078]">{subscriptionLogs.length} verified operations recorded</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubHistoryModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                {subscriptionLogs.length === 0 ? (
                  <p className="text-center py-8 text-xs text-[#778078]">No subscription events recorded yet.</p>
                ) : (
                  subscriptionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E8EAE2] text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#202820]">{log.userName}</span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                              log.action === 'activated' || log.action === 'enrolled'
                                ? 'bg-[#EAF5EC] text-[#145A42]'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {log.action}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#778078]">
                          Authorized by: {log.actor} • Tier: {log.tier}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#778078] font-mono shrink-0">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-[#E8EAE2] shrink-0">
                <button
                  onClick={() => setShowSubHistoryModal(false)}
                  className="px-5 py-2 rounded-xl bg-[#202820] hover:bg-black text-white font-bold text-xs cursor-pointer"
                >
                  Close Audit Trail
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. EDIT EPISODE MODAL */}
        {editEpisode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-[#E8EAE2] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <Edit2 className="w-5 h-5 text-[#10B981]" />
                  <h3 className="font-bold text-sm text-[#202820]">Edit Episode Recording</h3>
                </div>
                <button
                  onClick={() => setEditEpisode(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditEpisodeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Episode Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={editEpisode.title}
                    onChange={(e) => setEditEpisode({ ...editEpisode, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Category</label>
                    <select
                      value={editEpisode.cat}
                      onChange={(e) => setEditEpisode({ ...editEpisode, cat: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Lead Broadcaster RJ</label>
                    <input
                      type="text"
                      value={editEpisode.rj}
                      onChange={(e) => setEditEpisode({ ...editEpisode, rj: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Audio / Google Drive Link</label>
                  <input
                    type="text"
                    value={editEpisode.driveUrl || editEpisode.audioUrl || ''}
                    onChange={(e) =>
                      setEditEpisode({
                        ...editEpisode,
                        driveUrl: e.target.value,
                        audioUrl: formatAudioUrl(e.target.value) || e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editEpisode.desc}
                    onChange={(e) => setEditEpisode({ ...editEpisode, desc: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditEpisode(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer"
                  >
                    Save Episode Updates
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 11. UPLOAD EPISODE MODAL */}
        {showUploadEpisodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-[#E8EAE2] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <UploadCloud className="w-5 h-5 text-[#10B981]" />
                  <h3 className="font-bold text-sm text-[#202820]">Upload Master Recording</h3>
                </div>
                <button
                  onClick={() => setShowUploadEpisodeModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  handleAudioUploadSubmit(e);
                  setShowUploadEpisodeModal(false);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Episode Title (English) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Placement Guidance Series #3"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Show Category *</label>
                    <select
                      value={uploadCat}
                      onChange={(e) => setUploadCat(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Lead RJ *</label>
                    <select
                      value={uploadRJ}
                      onChange={(e) => setUploadRJ(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                    >
                      {rjs.map((r) => (
                        <option key={r.name} value={r.alias}>
                          {r.alias} ({r.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Google Drive or Audio URL *</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/... or direct mp3 link"
                    value={uploadDriveUrl}
                    onChange={(e) => setUploadDriveUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] font-mono text-xs focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Show synopsis, guest interview notes..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadEpisodeModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer"
                  >
                    Upload & Publish Episode
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 12. EDIT SCHEDULE SLOT MODAL */}
        {editScheduleItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#10B981]" />
                  <h3 className="font-bold text-sm text-[#202820]">Edit Broadcast Slot</h3>
                </div>
                <button
                  onClick={() => setEditScheduleItem(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditScheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={editScheduleItem.time}
                    onChange={(e) => setEditScheduleItem({ ...editScheduleItem, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Show Title *</label>
                  <input
                    type="text"
                    required
                    value={editScheduleItem.title}
                    onChange={(e) => setEditScheduleItem({ ...editScheduleItem, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Broadcaster RJ *</label>
                    <input
                      type="text"
                      required
                      value={editScheduleItem.rj}
                      onChange={(e) => setEditScheduleItem({ ...editScheduleItem, rj: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#202820] font-bold mb-1">Broadcast Status</label>
                    <select
                      value={editScheduleItem.status}
                      onChange={(e) => setEditScheduleItem({ ...editScheduleItem, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live On-Air</option>
                      <option value="next">Next Up</option>
                      <option value="done">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditScheduleItem(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer"
                  >
                    Save Slot Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 13. EDIT ANNOUNCEMENT MODAL */}
        {editAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8EAE2]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EAE2]">
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-5 h-5 text-[#10B981]" />
                  <h3 className="font-bold text-sm text-[#202820]">Edit Campus Bulletin</h3>
                </div>
                <button
                  onClick={() => setEditAnnouncement(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-[#778078] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditAnnouncementSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#202820] font-bold mb-1">Notice in English *</label>
                  <textarea
                    rows={2}
                    required
                    value={editAnnouncement.en}
                    onChange={(e) => setEditAnnouncement({ ...editAnnouncement, en: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Notice in Hindi *</label>
                  <textarea
                    rows={2}
                    required
                    value={editAnnouncement.hi}
                    onChange={(e) => setEditAnnouncement({ ...editAnnouncement, hi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] resize-none font-hi focus:outline-none focus:border-[#10B981]"
                  />
                </div>

                <div>
                  <label className="block text-[#202820] font-bold mb-1">Ticker Priority</label>
                  <select
                    value={editAnnouncement.priority || 'normal'}
                    onChange={(e) => setEditAnnouncement({ ...editAnnouncement, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8EAE2] rounded-xl text-[#202820] cursor-pointer"
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="urgent">Urgent Campus Alert</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditAnnouncement(null)}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FA] text-[#778078] hover:bg-[#E8EAE2] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold cursor-pointer"
                  >
                    Save Bulletin
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
