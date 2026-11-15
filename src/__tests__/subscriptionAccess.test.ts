import { describe, it, expect, beforeEach } from 'vitest';
import { databaseService } from '../services/databaseService';
import { authService } from '../services/authService';

describe('Free Subscription & Access Control System', () => {
  beforeEach(() => {
    localStorage.clear();
    authService.logout();
  });

  it('allows public visitors to access live schedule and listen to audio without authentication', () => {
    // Unauthenticated visitor
    expect(authService.getCurrentUser()).toBeNull();

    const programs = databaseService.getPrograms();
    expect(programs.length).toBeGreaterThanOrEqual(13);

    const schedule = databaseService.getSchedule();
    expect(schedule.length).toBeGreaterThan(0);

    // Audio stream URL generation works without restrictions
    const launchEp = databaseService.getProgramById(1);
    expect(launchEp).toBeDefined();
    expect(launchEp?.audioUrl).toBeDefined();
  });

  it('distinguishes ordinary registered student from an active subscriber entitlement', async () => {
    // Ordinary student login
    const studentRes = await authService.login({
      email: 'student@smcf.edu.in',
      password: 'student123',
    });
    expect(studentRes.user).toBeDefined();
    expect(studentRes.user?.role).toBe('student');
    expect(studentRes.user?.subscriptionStatus).toBe('not_subscribed');
    expect(authService.isSubscriber(studentRes.user!)).toBe(false);

    // Active subscriber student login
    const subRes = await authService.login({
      email: 'rahul@smcf.edu.in',
      password: 'rahul123',
    });
    expect(subRes.user).toBeDefined();
    expect(subRes.user?.role).toBe('student');
    expect(subRes.user?.subscriptionStatus).toBe('active');
    expect(authService.isSubscriber(subRes.user!)).toBe(true);
  });

  it('blocks non-subscribers from submitting song requests, while allowing active subscribers', async () => {
    // Login as non-subscriber student
    await authService.login({
      email: 'student@smcf.edu.in',
      password: 'student123',
    });

    expect(() => {
      databaseService.submitSongRequest({
        song: 'Ilahi',
        by: 'Arijit Singh',
        from: 'Ayush (CSE)',
        userId: 'usr_student_01',
      });
    }).toThrow(/Subscription required/);

    // Now login as active subscriber Rahul
    await authService.login({
      email: 'rahul@smcf.edu.in',
      password: 'rahul123',
    });

    const req = databaseService.submitSongRequest({
      song: 'Ilahi',
      by: 'Arijit Singh',
      from: 'Rahul Mehta (Humanities)',
      userId: 'usr_student_02',
    });

    expect(req).toBeDefined();
    expect(req.id).toBeDefined();
    expect(req.status).toBe('pending');
  });

  it('blocks non-subscribers from commenting, while allowing active subscribers', async () => {
    // Non-subscriber student
    expect(() => {
      databaseService.submitComment({
        program: 'Campus Chronicles',
        programId: 1,
        author: 'Ayush Sharma',
        text: 'Great broadcast!',
        userId: 'usr_student_01',
      });
    }).toThrow(/Subscription required/);

    // Active subscriber
    const comment = databaseService.submitComment({
      program: 'Campus Chronicles',
      programId: 1,
      author: 'Rahul Mehta',
      text: 'Insightful thoughts on career prep!',
      userId: 'usr_student_02',
    });

    expect(comment).toBeDefined();
    expect(comment.id).toBeDefined();
  });

  it('enforces anti-duplicate guard on rapid successive identical comments', async () => {
    // Active subscriber
    databaseService.submitComment({
      program: 'Morning Raga',
      programId: 2,
      author: 'Rahul Mehta',
      text: 'Soulful morning music!',
      userId: 'usr_student_02',
    });

    // Submitting exact same comment within 60s
    expect(() => {
      databaseService.submitComment({
        program: 'Morning Raga',
        programId: 2,
        author: 'Rahul Mehta',
        text: 'Soulful morning music!',
        userId: 'usr_student_02',
      });
    }).toThrow(/Duplicate submission detected/);
  });

  it('enforces subscriber restriction on personal playlists and allows 1-click free activation', async () => {
    // Non-subscriber student cannot create playlist
    expect(() => {
      databaseService.createPlaylist({
        userId: 'usr_student_01',
        title: 'My Morning Beats',
      });
    }).toThrow(/Subscription required/);

    // 1-Click Free Activation (Zero fees, instant)
    authService.updateSubscription('usr_student_01', 'active', 'campus-free');
    const updatedUser = authService.getUserById('usr_student_01');
    expect(updatedUser?.subscriptionStatus).toBe('active');
    expect(authService.isSubscriber(updatedUser!)).toBe(true);

    // Now creating playlist succeeds
    const playlist = databaseService.createPlaylist({
      userId: 'usr_student_01',
      title: 'My Morning Beats',
      description: 'Study and focus audio tracks',
    });

    expect(playlist).toBeDefined();
    expect(playlist.title).toBe('My Morning Beats');
    expect(playlist.userId).toBe('usr_student_01');
  });
});
