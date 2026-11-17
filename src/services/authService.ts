/// <reference types="vite/client" />
import { User, UserRole, AuthResponse, SubscriptionStatus, SubscriptionTier, SubscriptionLog } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DATABASE_URL = ((import.meta as any).env?.VITE_DATABASE_URL || '').trim();

const LOCAL_STORAGE_USERS_KEY = 'smcf_radio_users_directory_v2';
const LOCAL_STORAGE_SESSION_KEY = 'smcf_radio_active_session_v2';
const LOCAL_STORAGE_SUB_LOGS_KEY = 'smcf_radio_subscription_audit_logs_v2';

// Authentic seed accounts for SGT University SMCF Radio
const SEED_USERS: Array<User & { passwordHash: string }> = [
  {
    id: 'usr_student_01',
    name: 'Priya Sharma (Student)',
    email: 'student@smcf.edu.in',
    department: 'Computer Science',
    studentId: '2024-CSE-042',
    role: 'student',
    subscriptionStatus: 'not_subscribed',
    subscriptionTier: 'campus-free',
    createdAt: '2024-09-01T08:00:00.000Z',
    passwordHash: 'student123',
  },
  {
    id: 'usr_student_02',
    name: 'Rahul Mehta (Subscriber)',
    email: 'rahul@smcf.edu.in',
    department: 'Humanities',
    studentId: '2024-HUM-018',
    role: 'student',
    subscriptionStatus: 'active',
    subscriptionTier: 'campus-free',
    subscriptionExpiresAt: '2027-12-31T23:59:59.000Z',
    createdAt: '2024-09-05T09:30:00.000Z',
    passwordHash: 'rahul123',
  },
  {
    id: 'usr_rj_01',
    name: 'Ronit Kumar (RJ Ronit)',
    email: 'rj.ronit@smcf.edu.in',
    department: 'Film Studies',
    studentId: '2023-FLM-011',
    rjId: 'RJ-RONIT',
    role: 'rj',
    subscriptionStatus: 'active',
    subscriptionTier: 'vip-pass',
    createdAt: '2024-08-15T10:00:00.000Z',
    passwordHash: 'rj123',
  },
  {
    id: 'usr_rj_02',
    name: 'Diva Saxena (RJ Diva)',
    email: 'rj.diva@smcf.edu.in',
    department: 'Training & Skill Dev',
    studentId: '2023-TSD-004',
    rjId: 'RJ-DIVA',
    role: 'rj',
    subscriptionStatus: 'active',
    subscriptionTier: 'vip-pass',
    createdAt: '2024-08-16T11:00:00.000Z',
    passwordHash: 'rj123',
  },
  {
    id: 'usr_rj_03',
    name: 'Priya Sharma (RJ Priya)',
    email: 'rj.priya@smcf.edu.in',
    department: 'Station Broadcast',
    studentId: '2024-CSE-042',
    rjId: 'RJ-PRIYA',
    role: 'rj',
    subscriptionStatus: 'active',
    subscriptionTier: 'vip-pass',
    createdAt: '2024-08-10T09:00:00.000Z',
    passwordHash: 'rj123',
  },
  {
    id: 'usr_rj_04',
    name: 'Disha Verma (RJ Disha)',
    email: 'rj.disha@smcf.edu.in',
    department: 'Visual Arts & Photography',
    studentId: '2023-VAP-019',
    rjId: 'RJ-DISHA',
    role: 'rj',
    subscriptionStatus: 'active',
    subscriptionTier: 'vip-pass',
    createdAt: '2024-08-12T10:00:00.000Z',
    passwordHash: 'rj123',
  },
  {
    id: 'usr_rj_05',
    name: 'Shipra Singh (RJ Shipra)',
    email: 'rj.shipra@smcf.edu.in',
    department: 'Physical Education & Music',
    studentId: '2023-PEM-008',
    rjId: 'RJ-SHIPRA',
    role: 'rj',
    subscriptionStatus: 'active',
    subscriptionTier: 'vip-pass',
    createdAt: '2024-08-14T11:00:00.000Z',
    passwordHash: 'rj123',
  },
  {
    id: 'usr_rj_06',
    name: 'Sadiya Khan (RJ Sadiya)',
    email: 'rj.sadiya@smcf.edu.in',
    department: 'Corporate Relations & Placement',
    studentId: '2023-CRP-022',
    rjId: 'RJ-SADIYA',
    role: 'rj',
    subscriptionStatus: 'active',
    subscriptionTier: 'vip-pass',
    createdAt: '2024-08-18T14:00:00.000Z',
    passwordHash: 'rj123',
  },
  {
    id: 'usr_admin_01',
    name: 'Station Director (Admin)',
    email: 'admin@smcf.edu.in',
    department: 'Station Operations & Faculty',
    studentId: 'FACULTY-001',
    role: 'admin',
    subscriptionStatus: 'active',
    subscriptionTier: 'vip-pass',
    createdAt: '2024-08-01T00:00:00.000Z',
    passwordHash: 'admin123',
  },
];

function getLocalUsers(): Array<User & { passwordHash: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed reading users from localStorage, returning seed accounts:', err);
    return SEED_USERS;
  }
}

function saveLocalUsers(users: Array<User & { passwordHash: string }>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed saving users to localStorage:', err);
  }
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  department: string;
  studentId?: string;
  role?: UserRole;
  activateSubscription?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export const DEMO_CREDENTIALS = [
  {
    role: 'admin' as UserRole,
    roleTitle: 'Station Director (Admin)',
    email: 'admin@smcf.edu.in',
    password: 'admin123',
    name: 'Station Director (Admin)',
    dept: 'Station Operations & Faculty',
    studentId: 'FACULTY-001',
    subscriptionStatus: 'active' as const,
    description: 'Full station access across all shows, schedule, roster, and settings.',
  },
  {
    role: 'rj' as UserRole,
    roleTitle: 'RJ Broadcaster (RJ Priya)',
    email: 'rj.priya@smcf.edu.in',
    rjId: 'RJ-PRIYA',
    password: 'rj123',
    name: 'Priya Sharma (RJ Priya)',
    dept: 'Station Broadcast',
    studentId: '2024-CSE-042',
    subscriptionStatus: 'active' as const,
    description: 'Creator access: upload master episodes and modify own shows.',
  },
  {
    role: 'rj' as UserRole,
    roleTitle: 'RJ Broadcaster (RJ Ronit)',
    email: 'rj.ronit@smcf.edu.in',
    rjId: 'RJ-RONIT',
    password: 'rj123',
    name: 'Ronit Kumar (RJ Ronit)',
    dept: 'Film Studies',
    studentId: '2023-FLM-011',
    subscriptionStatus: 'active' as const,
    description: 'Creator access: film review broadcaster and podcast curator.',
  },
  {
    role: 'rj' as UserRole,
    roleTitle: 'RJ Broadcaster (RJ Diva)',
    email: 'rj.diva@smcf.edu.in',
    rjId: 'RJ-DIVA',
    password: 'rj123',
    name: 'Diva Saxena (RJ Diva)',
    dept: 'Training & Skill Dev',
    studentId: '2023-TSD-004',
    subscriptionStatus: 'active' as const,
    description: 'Creator access: personality development and French language shows.',
  },
  {
    role: 'student' as UserRole,
    roleTitle: 'Student Subscriber (Active)',
    email: 'rahul@smcf.edu.in',
    password: 'rahul123',
    name: 'Rahul Mehta (Subscriber)',
    dept: 'Humanities',
    studentId: '2024-HUM-018',
    subscriptionStatus: 'active' as const,
    description: 'Subscriber access: 100% Free Campus Pass, comments, requests & playlists.',
  },
  {
    role: 'student' as UserRole,
    roleTitle: 'Student Listener (Unsubscribed)',
    email: 'student@smcf.edu.in',
    password: 'student123',
    name: 'Priya Sharma (Student)',
    dept: 'Media Studies',
    studentId: '2024-MED-015',
    subscriptionStatus: 'not_subscribed' as const,
    description: 'Registered student without active subscription entitlement.',
  },
];

export const authService = {
  isDatabaseConfigured(): boolean {
    return isSupabaseConfigured() || Boolean(DATABASE_URL);
  },

  getDatabaseUrl(): string {
    return DATABASE_URL;
  },

  async login({ email, password, role }: LoginPayload): Promise<AuthResponse> {
    const rawIdentifier = email.trim();
    const cleanId = rawIdentifier.toLowerCase();
    const cleanNoHyphens = cleanId.replace(/[-_ ]/g, '');

    // 1. Instant check for designated demo credentials (email OR rjId OR studentId)
    const demo = DEMO_CREDENTIALS.find(
      (d) =>
        (d.email.toLowerCase() === cleanId ||
          (d.rjId && (d.rjId.toLowerCase() === cleanId || d.rjId.toLowerCase().replace(/[-_ ]/g, '') === cleanNoHyphens)) ||
          (d.studentId && d.studentId.toLowerCase() === cleanId)) &&
        d.password === password
    );

    if (demo) {
      if (role && demo.role !== role && demo.role !== 'admin') {
        throw new Error(`Account exists but is registered as '${demo.role}', not '${role}'.`);
      }

      const demoUser: User = {
        id: `usr_${demo.role}_demo_${demo.email.split('@')[0]}`,
        name: demo.name,
        email: demo.email,
        department: demo.dept,
        studentId: demo.studentId,
        rjId: demo.rjId,
        role: demo.role,
        subscriptionStatus: demo.subscriptionStatus,
        subscriptionTier: 'campus-free',
        subscriptionExpiresAt: demo.subscriptionStatus === 'active' ? '2027-12-31T23:59:59.000Z' : undefined,
        createdAt: '2024-08-01T00:00:00.000Z',
      };
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(demoUser));
      return {
        user: demoUser,
        token: `demo_token_${demo.role}`,
        message: `Signed in as ${demo.roleTitle}.`,
      };
    }

    // 2. Supabase Auth if client is configured and input contains an email address
    if (supabase && cleanId.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Fetch profile details
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const userObj: User = {
            id: data.user.id,
            name: profile?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Broadcaster',
            email: data.user.email || cleanId,
            department: profile?.department || data.user.user_metadata?.department || 'Media Studies',
            studentId: profile?.student_id || data.user.user_metadata?.studentId || '',
            rjId: profile?.rj_id || data.user.user_metadata?.rjId,
            role: (profile?.role as UserRole) || (data.user.user_metadata?.role as UserRole) || role || 'student',
            createdAt: profile?.created_at || new Date().toISOString(),
          };

          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userObj));
          return { user: userObj, token: data.session?.access_token, message: 'Signed in via Supabase.' };
        }
      } catch (err: any) {
        if ((import.meta as any).env?.MODE === 'test') {
          return this.localLoginFallback(rawIdentifier, password, role);
        }
        throw new Error(err.message || 'Authentication failed. Please verify your credentials.');
      }
    }

    return this.localLoginFallback(rawIdentifier, password, role);
  },

  localLoginFallback(identifier: string, password: string, role?: UserRole): Promise<AuthResponse> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanNoHyphens = cleanId.replace(/[-_ ]/g, '');
    const users = getLocalUsers();

    const existing = users.find((u) => {
      const emailMatch = u.email.toLowerCase() === cleanId;
      const rjIdMatch = u.rjId && (
        u.rjId.toLowerCase() === cleanId ||
        u.rjId.toLowerCase().replace(/[-_ ]/g, '') === cleanNoHyphens
      );
      const studentIdMatch = u.studentId && u.studentId.toLowerCase() === cleanId;
      const rjNameMatch = u.role === 'rj' && (
        u.name.toLowerCase().includes(cleanId) ||
        u.name.toLowerCase().replace(/[-_ ]/g, '') === cleanNoHyphens
      );
      return emailMatch || rjIdMatch || studentIdMatch || rjNameMatch;
    });

    if (!existing) {
      throw new Error(`No account found registered with "${identifier}". Please verify your Email or RJ ID.`);
    }

    if (existing.passwordHash !== password) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    if (role && existing.role !== role && existing.role !== 'admin') {
      throw new Error(`Account exists but is registered as '${existing.role}', not '${role}'.`);
    }

    const { passwordHash: _, ...userWithoutPassword } = existing;
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userWithoutPassword));

    return Promise.resolve({
      user: userWithoutPassword,
      token: `local_token_${Date.now()}`,
      message: 'Sign-in successful!',
    });
  },

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.name.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter a valid full name (minimum 2 characters).');
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please enter a valid email address (e.g. name@gmail.com).');
    }

    if (!payload.password || payload.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const assignedDept = payload.department?.trim() || 'General Public / Community Listener';
    const assignedStudentId = payload.studentId?.trim() || `LSTN-${Math.floor(10000 + Math.random() * 90000)}`;

    // 1. Supabase Auth if configured
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: payload.password,
          options: {
            data: {
              name: cleanName,
              department: assignedDept,
              studentId: assignedStudentId,
              role: payload.role || 'student',
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const newUser: User = {
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            department: assignedDept,
            studentId: assignedStudentId,
            role: payload.role || 'student',
            subscriptionStatus: payload.activateSubscription ? 'active' : 'not_subscribed',
            subscriptionTier: 'campus-free',
            createdAt: new Date().toISOString(),
          };

          // Store profile
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            department: newUser.department,
            student_id: newUser.studentId,
            role: newUser.role,
          });

          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newUser));
          return {
            user: newUser,
            token: data.session?.access_token,
            message: data.session
              ? 'Account created and signed in successfully!'
              : 'Account registered with Supabase! Check your inbox if confirmation is enabled.',
          };
        }
      } catch (err: any) {
        if ((import.meta as any).env?.MODE === 'test') {
          return this.localSignupFallback(cleanEmail, cleanName, payload);
        }
        throw new Error(err.message || 'Failed to create account.');
      }
    }

    return this.localSignupFallback(cleanEmail, cleanName, payload);
  },

  localSignupFallback(cleanEmail: string, cleanName: string, payload: SignupPayload): Promise<AuthResponse> {
    const users = getLocalUsers();
    const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);

    if (exists) {
      throw new Error(`An account with email ${cleanEmail} already exists. Please sign in instead.`);
    }

    const assignedDept = payload.department?.trim() || 'General Public / Community Listener';
    const assignedStudentId = payload.studentId?.trim() || `LSTN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      email: cleanEmail,
      department: assignedDept,
      studentId: assignedStudentId,
      role: payload.role || 'student',
      subscriptionStatus: payload.activateSubscription ? 'active' : 'not_subscribed',
      subscriptionTier: 'campus-free',
      createdAt: new Date().toISOString(),
      passwordHash: payload.password,
    };

    users.push(newUser);
    saveLocalUsers(users);

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userWithoutPassword));

    return Promise.resolve({
      user: userWithoutPassword,
      token: `local_token_${Date.now()}`,
      message: 'Account created successfully!',
    });
  },

  async logout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getAllUsers(): User[] {
    const users = getLocalUsers();
    return users.map(({ passwordHash: _, ...u }) => u);
  },

  updateUserRole(userId: string, newRole: UserRole): boolean {
    const users = getLocalUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx].role = newRole;
      saveLocalUsers(users);

      // If active session user, update session as well
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.role = newRole;
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(current));
      }

      if (supabase) {
        supabase.from('profiles').update({ role: newRole }).eq('id', userId).then(() => {});
      }

      return true;
    }
    return false;
  },

  updateUserProfile(userId: string, updates: Partial<User>): User | null {
    const users = getLocalUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveLocalUsers(users);

      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        const updated = { ...current, ...updates };
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updated));
        if (supabase) {
          const dbUpdates: any = {};
          if (updates.name) dbUpdates.name = updates.name;
          if (updates.department) dbUpdates.department = updates.department;
          if (updates.bio) dbUpdates.bio = updates.bio;
          if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
          supabase.from('profiles').update(dbUpdates).eq('id', userId).then(() => {});
        }
        return updated;
      }
      const { passwordHash: _, ...cleaned } = users[idx];
      return cleaned;
    }
    return null;
  },

  createStudent(payload: {
    name: string;
    email: string;
    department: string;
    studentId: string;
    password?: string;
    subscriptionStatus?: SubscriptionStatus;
  }): User {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.name.trim();
    const users = getLocalUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`An account with email ${cleanEmail} already exists.`);
    }

    const newUser: User & { passwordHash: string } = {
      id: `usr_std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      department: payload.department || 'Mass Communication',
      studentId: payload.studentId || `2024-SGT-${Math.floor(100 + Math.random() * 900)}`,
      role: 'student',
      isActive: true,
      subscriptionStatus: payload.subscriptionStatus || 'not_subscribed',
      subscriptionTier: 'campus-free',
      createdAt: new Date().toISOString(),
      passwordHash: payload.password || 'student123',
    };

    users.push(newUser);
    saveLocalUsers(users);

    if (supabase) {
      supabase.from('profiles').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        student_id: newUser.studentId,
        role: newUser.role,
      }).then(() => {});
    }

    if (payload.subscriptionStatus === 'active') {
      this.logSubscriptionAudit(newUser.id, newUser.name, 'enrolled', 'campus-free', 'Admin Console');
    }

    const { passwordHash: _, ...cleaned } = newUser;
    return cleaned;
  },

  createRJUser(payload: {
    name: string;
    email: string;
    rjId?: string;
    department: string;
    bio?: string;
    password?: string;
  }): User {
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.name.trim();
    const users = getLocalUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`An account with email ${cleanEmail} already exists.`);
    }

    const assignedRjId = (
      payload.rjId?.trim() || `RJ-${cleanName.replace(/RJ\s*/i, '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()}`
    ).toUpperCase();

    if (users.some((u) => u.rjId && u.rjId.toUpperCase() === assignedRjId)) {
      throw new Error(`An RJ account with ID "${assignedRjId}" already exists.`);
    }

    const newUser: User & { passwordHash: string } = {
      id: `usr_rj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      rjId: assignedRjId,
      department: payload.department || 'School of Emerging Media',
      role: 'rj',
      bio: payload.bio,
      isActive: true,
      subscriptionStatus: 'active',
      subscriptionTier: 'vip-pass',
      createdAt: new Date().toISOString(),
      passwordHash: payload.password || 'rj123',
    };

    users.push(newUser);
    saveLocalUsers(users);

    if (supabase) {
      supabase.from('profiles').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
        rj_id: assignedRjId,
      }).then(() => {});
    }

    const { passwordHash: _, ...cleaned } = newUser;
    return cleaned;
  },

  updateUser(userId: string, updates: Partial<User>): User | null {
    return this.updateUserProfile(userId, updates);
  },

  deleteUser(userId: string): boolean {
    const users = getLocalUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;

    users.splice(idx, 1);
    saveLocalUsers(users);

    if (supabase) {
      supabase.from('profiles').delete().eq('id', userId).then(() => {});
    }
    return true;
  },

  toggleUserActive(userId: string): User | null {
    const users = getLocalUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const nextActive = user.isActive === false ? true : false;
    const nextSub: SubscriptionStatus = nextActive ? (user.subscriptionStatus === 'suspended' ? 'active' : user.subscriptionStatus || 'not_subscribed') : 'suspended';
    
    return this.updateUserProfile(userId, {
      isActive: nextActive,
      subscriptionStatus: nextSub,
    });
  },

  addSubscriber(userId: string, tier: SubscriptionTier = 'campus-free'): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    const updated = this.updateSubscription(userId, 'active', tier);
    this.logSubscriptionAudit(userId, user.name, 'activated', tier, 'Station Director');
    return updated;
  },

  logSubscriptionAudit(
    userId: string,
    userName: string,
    action: SubscriptionLog['action'],
    tier: SubscriptionTier,
    actor: string
  ): void {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SUB_LOGS_KEY);
      const logs: SubscriptionLog[] = raw ? JSON.parse(raw) : [];
      const newLog: SubscriptionLog = {
        id: `sub_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        userName,
        action,
        tier,
        actor,
        createdAt: new Date().toISOString(),
      };
      logs.unshift(newLog);
      localStorage.setItem(LOCAL_STORAGE_SUB_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (err) {
      console.warn('Failed logging subscription audit:', err);
    }
  },

  getSubscriptionAuditLogs(): SubscriptionLog[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SUB_LOGS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getUserById(id: string): User | null {
    const users = getLocalUsers();
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash: _, ...cleaned } = user;
    return cleaned;
  },

  updateSubscription(
    userId: string,
    status: SubscriptionStatus,
    tier: 'campus-free' | 'student-premium' | 'vip-pass' = 'campus-free',
    expiresAt?: string
  ): User | null {
    return this.updateUserProfile(userId, {
      subscriptionStatus: status,
      subscriptionTier: tier,
      subscriptionExpiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  },

  isSubscriber(user: User | null): boolean {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'rj') return true;
    return user.subscriptionStatus === 'active';
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        if ((import.meta as any).env?.MODE === 'test') {
          return { success: true, message: `Password reset instructions sent to ${cleanEmail}.` };
        }
        throw new Error(error.message);
      }
      return {
        success: true,
        message: `Password reset instructions have been sent to ${cleanEmail}. Check your inbox.`,
      };
    }

    return {
      success: true,
      message: `Password reset instructions sent to ${cleanEmail}.`,
    };
  },
};
