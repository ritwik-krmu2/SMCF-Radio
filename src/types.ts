export type UserRole = 'student' | 'rj' | 'admin';
export type SubscriptionStatus = 'not_subscribed' | 'active' | 'suspended' | 'deactivated';
export type SubscriptionTier = 'campus-free' | 'student-premium' | 'vip-pass';

export interface Category {
  slug: string;
  en: string;
  hi: string;
  icon: string;
  color: string;
}

export interface RJ {
  id?: string;
  name: string;
  alias: string;
  rjId?: string;
  dept: string;
  bio: string;
  color: string;
  initials: string;
  badge?: string;
  audioUrl?: string;
  driveUrl?: string;
  audioTitle?: string;
  showTime?: string;
  isActive?: boolean;
}

export interface Program {
  id: number;
  title: string;
  titleHi: string;
  desc: string;
  cat: string;
  lang: string;
  rj: string;
  plays: number;
  duration: string;
  featured: boolean;
  audioUrl?: string;
  driveUrl?: string;
  status?: 'draft' | 'pending' | 'published' | 'archived';
  submittedBy?: string;
  createdAt?: string;
}

export interface ScheduleItem {
  id?: number;
  time: string;
  title: string;
  rj: string;
  day?: string;
  status: 'done' | 'live' | 'next' | 'scheduled';
}

export interface Announcement {
  id?: number;
  en: string;
  hi: string;
  priority?: 'normal' | 'urgent';
  createdAt?: string;
}

export interface WeeklyPlay {
  day: string;
  plays: number;
}

export interface CategoryPlay {
  label: string;
  value: number;
  color: string;
}

export interface SongRequest {
  id: number;
  song: string;
  by: string;
  from: string;
  userId?: string;
  dedicatedTo?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'queued' | 'played' | 'completed' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface Comment {
  id: number;
  program: string;
  programId?: number;
  author: string;
  userId?: string;
  text: string;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserComment {
  author: string;
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  studentId?: string;
  rjId?: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  isActive?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic?: boolean;
  episodeIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface LiveSession {
  id: string;
  rjName: string;
  programTitle: string;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  listenersCount: number;
  peakListeners: number;
}

export interface ProgramLike {
  id: string;
  userId: string;
  programId: number;
  createdAt: string;
}

export interface EpisodeView {
  id: string;
  programId: number;
  userId?: string;
  sessionId: string;
  viewedAt: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  episodeId: number;
  createdAt: string;
}

export interface ListenHistoryItem {
  id: string;
  userId: string;
  episodeId: number;
  title: string;
  rj: string;
  playedAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  details?: string;
  createdAt: string;
}

export interface ListenerHeartbeat {
  id: string;
  sessionId: string;
  userId?: string;
  streamType: 'live' | 'episode';
  episodeId?: number;
  lastPingAt: string;
}

export interface SubscriptionLog {
  id: string;
  userId: string;
  userName: string;
  action: 'activated' | 'suspended' | 'reactivated' | 'revoked' | 'enrolled';
  tier: SubscriptionTier;
  actor: string;
  createdAt: string;
}
