import { describe, it, expect, beforeEach } from 'vitest';
import { databaseService } from '../services/databaseService';
import { authService } from '../services/authService';

describe('Admin CRUD Operations & Real Analytics Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Student Directory CRUD', () => {
    it('creates, edits, deactivates, and deletes a student record', () => {
      // 1. Create
      const newStudent = authService.createStudent({
        name: 'Arjun Verma',
        email: 'arjun@smcf.edu.in',
        department: 'Computer Science',
        studentId: '2024-CSE-099',
        subscriptionStatus: 'active',
      });

      expect(newStudent.id).toBeDefined();
      expect(newStudent.name).toBe('Arjun Verma');
      expect(newStudent.subscriptionStatus).toBe('active');

      // 2. Edit
      const updated = authService.updateUser(newStudent.id, {
        department: 'Film Studies',
      });
      expect(updated?.department).toBe('Film Studies');

      // 3. Deactivate
      const deactivated = authService.toggleUserActive(newStudent.id);
      expect(deactivated?.isActive).toBe(false);
      expect(deactivated?.subscriptionStatus).toBe('suspended');

      // 4. Reactivate
      const reactivated = authService.toggleUserActive(newStudent.id);
      expect(reactivated?.isActive).toBe(true);
      expect(reactivated?.subscriptionStatus).toBe('active');

      // 5. Delete
      const deleted = authService.deleteUser(newStudent.id);
      expect(deleted).toBe(true);
      expect(authService.getUserById(newStudent.id)).toBeNull();
    });
  });

  describe('RJ Broadcaster CRUD', () => {
    it('creates, edits, and removes an RJ broadcaster', () => {
      // 1. Create
      const newRJ = databaseService.createRJ({
        name: 'Tara Khanna',
        alias: 'RJ Tara',
        dept: 'Journalism',
        bio: 'Voice of campus youth stories.',
        color: '#10B981',
        initials: 'TK',
        showTime: 'Thursdays 5:00 PM',
      });

      expect(newRJ.name).toBe('Tara Khanna');
      expect(newRJ.alias).toBe('RJ Tara');

      const allRJs = databaseService.getRJs();
      expect(allRJs.some((r) => r.name === 'Tara Khanna')).toBe(true);

      // 2. Edit
      const updated = databaseService.updateRJ('Tara Khanna', {
        showTime: 'Fridays 6:00 PM',
      });
      expect(updated?.showTime).toBe('Fridays 6:00 PM');

      // 3. Delete
      const deleted = databaseService.deleteRJ('Tara Khanna');
      expect(deleted).toBe(true);
      expect(databaseService.getRJs().some((r) => r.name === 'Tara Khanna')).toBe(false);
    });
  });

  describe('Schedule Timetable CRUD', () => {
    it('adds, updates, and deletes broadcast timetable slots', () => {
      // 1. Add
      const slot = databaseService.addScheduleItem({
        time: '11:00 AM - 12:00 PM',
        title: 'Morning Acoustic Jam',
        rj: 'RJ Kabir',
        status: 'scheduled',
      });

      expect(slot.id).toBeDefined();
      expect(slot.title).toBe('Morning Acoustic Jam');

      // 2. Update
      const updated = databaseService.updateScheduleItem(slot.id!, {
        status: 'live',
      });
      expect(updated).toBe(true);

      const reloaded = databaseService.getSchedule().find((s) => s.id === slot.id);
      expect(reloaded?.status).toBe('live');

      // 3. Delete
      const deleted = databaseService.deleteScheduleItem(slot.id!);
      expect(deleted).toBe(true);
      expect(databaseService.getSchedule().some((s) => s.id === slot.id)).toBe(false);
    });
  });

  describe('Campus Announcements CRUD', () => {
    it('creates, updates, and deletes announcements', () => {
      // 1. Add
      const ann = databaseService.addAnnouncement({
        en: 'Studio Workshop registration open this Friday.',
        hi: 'रेडियो स्टूडियो कार्यशाला पंजीकरण शुक्रवार को खुलेगा।',
        priority: 'urgent',
      });

      expect(ann.id).toBeDefined();

      // 2. Update
      const updated = databaseService.updateAnnouncement(ann.id!, {
        en: 'Studio Workshop registration closes at 5 PM.',
      });
      expect(updated).toBe(true);

      const reloaded = databaseService.getAnnouncements().find((a) => a.id === ann.id);
      expect(reloaded?.en).toBe('Studio Workshop registration closes at 5 PM.');

      // 3. Delete
      const deleted = databaseService.deleteAnnouncement(ann.id!);
      expect(deleted).toBe(true);
      expect(databaseService.getAnnouncements().some((a) => a.id === ann.id)).toBe(false);
    });
  });

  describe('Real Analytics Engine & Active Telemetry', () => {
    it('tracks concurrent listeners via heartbeats without simulated numbers', () => {
      const sessionId1 = 'sess_listener_01';
      const sessionId2 = 'sess_listener_02';

      databaseService.recordHeartbeat(sessionId1, 'user_1', 'live');
      databaseService.recordHeartbeat(sessionId2, 'user_2', 'live');

      const activeCount = databaseService.getActiveConcurrentListeners(5);
      expect(activeCount).toBeGreaterThanOrEqual(2);

      // Session ends
      databaseService.endLiveListeningSession(sessionId1);
      const afterEnd = databaseService.getActiveConcurrentListeners(5);
      expect(afterEnd).toBe(activeCount - 1);
    });

    it('debounces duplicate episode views within 1-hour window', () => {
      const programId = 2;
      const sessionId = 'sess_debounce_test';
      const userId = 'usr_debounce_test';

      // First view counts
      const view1 = databaseService.recordEpisodeView(programId, userId, sessionId);
      expect(view1).toBe(true);

      // Second immediate view (refresh) is debounced
      const view2 = databaseService.recordEpisodeView(programId, userId, sessionId);
      expect(view2).toBe(false);
    });

    it('aggregates analytics with date range filters', () => {
      const analytics7d = databaseService.getAnalyticsData('7d');
      expect(analytics7d.totalViews).toBeGreaterThan(0);
      expect(analytics7d.totalLikes).toBeGreaterThan(0);
      expect(analytics7d.episodeStats).toBeDefined();

      const analyticsToday = databaseService.getAnalyticsData('today');
      expect(analyticsToday.totalViews).toBeLessThanOrEqual(analytics7d.totalViews);
    });
  });
});
