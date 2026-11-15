/**
 * Utility to format audio URLs, with built-in conversion for Google Drive sharing links.
 *
 * Supported Google Drive link formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=drive_web
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=download&id=FILE_ID
 * - https://docs.google.com/uc?export=open&id=FILE_ID
 * - https://drive.usercontent.google.com/download?id=FILE_ID&export=download
 * - Direct Google Drive file ID (28-45 alphanumeric chars)
 */

export const KNOWN_STATIC_RECORDINGS: Record<string, string> = {
  // User's added Google Drive recording (Career Talks Photography Disha)
  '1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y': '/audio/career_talks_disha.mp3',
  // Official Launch & Station Promo (Gulam & Priya)
  '1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m': '/audio/live_smcf_promo_gulam.mp3',
  // Masti Unlimited (Anjali & Laxita)
  '11xRckI_gaMG1GFCmIWYnTNhRBfU_sFe9': '/audio/mastitime_anjali_laxita.mp3',
};

export function extractGoogleDriveId(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. Check standard Google Drive URLs
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:[a-zA-Z0-9_=&-]*\b)?id=)|docs\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:[a-zA-Z0-9_=&-]*\b)?id=)|drive\.usercontent\.google\.com\/download\?(?:[a-zA-Z0-9_=&-]*\b)?id=)([a-zA-Z0-9_-]+)/;
  const match = trimmed.match(driveRegex);
  if (match && match[1]) return match[1];

  // 2. Check if the string itself is a raw Google Drive file ID
  if (/^[a-zA-Z0-9_-]{28,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Converts any Google Drive link or file ID to a streaming audio URL.
 * Maps known files to the high-performance local audio copy, and streams any other
 * Google Drive file through the `/api/drive-stream` proxy endpoint.
 */
export function formatAudioUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    if (KNOWN_STATIC_RECORDINGS[fileId]) {
      return KNOWN_STATIC_RECORDINGS[fileId];
    }
    return `/api/drive-stream?id=${fileId}`;
  }

  return trimmed;
}

/**
 * Resolves the real audio source URL for any broadcast program or RJ item.
 * Prioritizes the original Google Drive audio link over any placeholder or demo audio.
 */
export function getMediaAudioUrl(item: { audioUrl?: string; driveUrl?: string } | null | undefined): string {
  if (!item) return '';

  // 1. If original Google Drive URL exists, format and use it directly
  if (item.driveUrl && item.driveUrl.trim()) {
    const driveStream = formatAudioUrl(item.driveUrl);
    if (driveStream) return driveStream;
  }

  // 2. If audioUrl is provided, check if it is a Drive link or a direct audio URL
  if (item.audioUrl && item.audioUrl.trim()) {
    const trimmed = item.audioUrl.trim();
    if (isGoogleDriveUrl(trimmed) || extractGoogleDriveId(trimmed)) {
      return formatAudioUrl(trimmed);
    }
    return trimmed;
  }

  return '';
}

export function getGoogleDrivePreviewUrl(url: string | undefined | null): string {
  if (!url) return '';
  const fileId = extractGoogleDriveId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return url;
}

export function getGoogleDriveViewUrl(url: string | undefined | null): string {
  if (!url) return '';
  const fileId = extractGoogleDriveId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
  return url;
}

export function isGoogleDriveUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return /drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com|\/api\/drive-stream/.test(url);
}
