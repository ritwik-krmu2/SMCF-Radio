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
  // 1. Official Launch & Station Promo (Gulam & Priya)
  '1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m': '/audio/live_smcf_promo_gulam.mp3',
  // 2. Career Talks Photography (Disha)
  '1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y': '/audio/career_talks_disha.mp3',
  // 3. Gyantime Social Media (Anjali & Laxita)
  '1lGvbQStjXX0Mjr817YXwyLwJh8y5_h9g': '/audio/gyantime_social_media_anjali_laxita.mp3',
  // 4. Gyantime Personality Development (Diva)
  '19KrXRCnHVpZDq5W_mUPLg8FBMRoteRVZ': '/audio/gyantime_personality_development_diva.mp3',
  // 5. Film Review Gandhari (Ronit)
  '1HSvmXhtplfT2E7S1I-DeBvC0gsid4Wgm': '/audio/film_review.wav',
  // 6. Masti Unlimited (Anjali & Laxita)
  '11xRckI_gaMG1GFCmIWYnTNhRBfU_sFe9': '/audio/mastitime_anjali_laxita.mp3',
  // 7. Film Review The VIBE (Ronit)
  '1PUOLjm5R662VICd3oUOhdM6_x6_1q1m0': '/audio/film_review_the_vibe_ronit.mp3',
  // 8. Film Review The Adom Project (Ronit)
  '1EL8bpxp5Nx7F21cgsssO1pzq53Ocoie3': '/audio/film_review_the_adom_project_ronit.mp3',
  // 9. Film Review The VAAN (Ronit)
  '1Dxfc8DnymQU9tTCRbNcyiVBut0vrxoMV': '/audio/film_review_the_vaan_ronit.mp3',
  // 10. Radio Rangmanch Episode 1 (Disha)
  '15W3tfb3cLr_bfso443CQK6vOPvHc3sIR': '/audio/radio_rangmanch_ep1_disha.mp3',
  // 11. Podcast Aditya & Kumkum
  '1w0a4l8MlFdQYX0IapQ7HNlw43lun0yJ4': '/audio/podcast_aditya_kumkum.mp3',
  // 12. Sports Talk Taekwondo (Shipra)
  '18nCg3rEbGlU6AKTZFBuA0lTKU8J0Krir': '/audio/rj_ananya.wav',
  // 13. Career Connect Episode 1 (Sadiya)
  '1eGgCVyRotymAhhW0cljrMsEXnouiT_ka': '/audio/career_connect_ep1_sadiya.mp3',
  // 14. Career Connect Episode 3 (Rishi)
  '1rGWwYSFI-b17HhkomChqvTPz5akb9_43': '/audio/career_connect_ep3_rishi.mp3',
  // 15. Career Talks Journalism (Shivam)
  '1PQTwU37R-MUoViIaNLQoBNsBIVewrVmH': '/audio/career_talks_journalism_shivam.mp3',
  // 16. Career Talks French (Diva)
  '14RhKWr-wwR6Kd3JdYwZ-BFI79QdeRbRl': '/audio/career_talks_french_diva.mp3',
  // 17. Music Show Aman Rapper (Shipra)
  '1koOLVp-GuKj-mXfs2WbroQwBvg6E62qN': '/audio/mastitime_anjali_laxita.mp3',
  // 18. Podcast Ghana Delegation (Sakshi)
  '193Y0Iyx4lXRVtAUqndBdxPQ9tt4jbyRu': '/audio/podcast_ghana_delegation_sakshi.mp3',
  // 19. Career Connect Episode 2 (Sadiya)
  '15djwUd4CUSJ_MhpL74DIOzR6lRzg1-Fq': '/audio/career_talk.wav',
};

export function extractGoogleDriveId(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. Check standard Google Drive URLs or local stream proxy URLs
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:[a-zA-Z0-9_=&-]*\b)?id=)|docs\.google\.com\/(?:file\/d\/|(?:open|uc)\?(?:[a-zA-Z0-9_=&-]*\b)?id=)|drive\.usercontent\.google\.com\/download\?(?:[a-zA-Z0-9_=&-]*\b)?id=|\/api\/drive-stream\?(?:[a-zA-Z0-9_=&-]*\b)?id=)([a-zA-Z0-9_-]+)/;
  const match = trimmed.match(driveRegex);
  if (match && match[1]) return match[1];

  // 2. Check if the string itself is a raw Google Drive file ID
  if (/^[a-zA-Z0-9_-]{28,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Converts any Google Drive link or file ID to a direct streaming audio URL.
 * Maps known files to the high-performance local audio copy, and streams any other
 * Google Drive file through Google CDN direct usercontent streaming with full range request support.
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
