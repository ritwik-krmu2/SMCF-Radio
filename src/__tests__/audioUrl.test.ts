import { describe, it, expect } from 'vitest';
import {
  extractGoogleDriveId,
  formatAudioUrl,
  getMediaAudioUrl,
  getGoogleDrivePreviewUrl,
  isGoogleDriveUrl,
} from '../utils/audioUrl';

describe('Audio URL Utilities', () => {
  it('extracts file ID from standard Google Drive file URL', () => {
    const url = 'https://drive.google.com/file/d/1Dxfc8DnymQU9tTCRbNcyiVBut0vrxoMV/view?usp=drive_web';
    expect(extractGoogleDriveId(url)).toBe('1Dxfc8DnymQU9tTCRbNcyiVBut0vrxoMV');
  });

  it('extracts file ID from open?id= URL format', () => {
    const url = 'https://drive.google.com/open?id=1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m';
    expect(extractGoogleDriveId(url)).toBe('1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m');
  });

  it('extracts file ID from drive.usercontent.google.com URL format', () => {
    const url = 'https://drive.usercontent.google.com/download?id=1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y&export=download';
    expect(extractGoogleDriveId(url)).toBe('1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y');
  });

  it('formats user Google Drive link directly to high-quality audio copy', () => {
    const url = 'https://drive.google.com/file/d/1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y/view?usp=sharing';
    expect(formatAudioUrl(url)).toBe('/audio/career_talks_disha.mp3');
  });

  it('formats unknown Google Drive link to direct usercontent streaming URL', () => {
    const url = 'https://drive.google.com/file/d/1abcdef1234567890abcdef1234567890/view';
    expect(formatAudioUrl(url)).toBe('https://drive.usercontent.google.com/download?id=1abcdef1234567890abcdef1234567890&export=download');
  });

  it('prioritizes original Google Drive link in getMediaAudioUrl', () => {
    const program = {
      audioUrl: '/audio/smcf_promo.wav',
      driveUrl: 'https://drive.google.com/file/d/1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y/view?usp=sharing',
    };
    expect(getMediaAudioUrl(program)).toBe('/audio/career_talks_disha.mp3');
  });

  it('formats regular non-drive audio URLs untouched', () => {
    const url = 'https://streams.example.com/live.mp3';
    expect(formatAudioUrl(url)).toBe('https://streams.example.com/live.mp3');
  });

  it('identifies Google Drive URLs correctly', () => {
    expect(isGoogleDriveUrl('https://drive.google.com/file/d/abc')).toBe(true);
    expect(isGoogleDriveUrl('https://drive.usercontent.google.com/download?id=abc')).toBe(true);
    expect(isGoogleDriveUrl('/api/drive-stream?id=abc')).toBe(true);
    expect(isGoogleDriveUrl('https://example.com/song.mp3')).toBe(false);
  });

  it('generates proper Google Drive preview embed URL', () => {
    const url = 'https://drive.google.com/file/d/1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m/view';
    expect(getGoogleDrivePreviewUrl(url)).toBe(
      'https://drive.google.com/file/d/1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m/preview'
    );
  });
});
