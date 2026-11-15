import { describe, it, expect, beforeEach } from 'vitest';
import { databaseService } from '../services/databaseService';

describe('Database Service (Dual-Mode Data Repository)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads all 13 authentic audio programs initially', () => {
    const programs = databaseService.getPrograms();
    expect(programs.length).toBeGreaterThanOrEqual(13);
    const promo = programs.find((p) => p.id === 1);
    expect(promo).toBeDefined();
    expect(promo?.title).toContain('SMCF Radio Official Launch');
  });

  it('allows submitting and moderating song requests', () => {
    const newReq = databaseService.submitSongRequest({
      song: 'Chaiyya Chaiyya',
      by: 'Sukhwinder Singh',
      from: 'Aakash (Mass Comm)',
      dedicatedTo: 'Hostel friends',
    });

    expect(newReq.id).toBeDefined();
    expect(newReq.status).toBe('pending');

    // Moderation by admin: Approve
    const approved = databaseService.updateSongRequestStatus(newReq.id, 'approved');
    expect(approved).toBe(true);

    const reloaded = databaseService.getSongRequests().find((r) => r.id === newReq.id);
    expect(reloaded?.status).toBe('approved');
  });

  it('manages user bookmarks properly', () => {
    const userId = 'usr_test_123';
    const episodeId = 4;

    expect(databaseService.isBookmarked(userId, episodeId)).toBe(false);

    // Toggle on
    const bookmarked = databaseService.toggleBookmark(userId, episodeId);
    expect(bookmarked).toBe(true);
    expect(databaseService.isBookmarked(userId, episodeId)).toBe(true);

    // Toggle off
    const unbookmarked = databaseService.toggleBookmark(userId, episodeId);
    expect(unbookmarked).toBe(false);
    expect(databaseService.isBookmarked(userId, episodeId)).toBe(false);
  });

  it('calculates real platform statistics without fake numbers', () => {
    const stats = databaseService.getPlatformStats();
    expect(stats.totalEpisodes).toBeGreaterThanOrEqual(13);
    expect(stats.activeRJs).toBeGreaterThanOrEqual(3);
    expect(stats.totalPlays).toBeGreaterThan(0);
    expect(stats.categoryCounts).toBeDefined();
  });
});

