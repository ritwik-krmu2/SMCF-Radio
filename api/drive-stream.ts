export default async function handler(req: any, res: any) {
  try {
    const fileId = req.query?.id as string;
    if (!fileId) {
      res.status(400).send('Missing file id');
      return;
    }

    const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    res.setHeader('Accept-Ranges', 'bytes');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    // Direct redirect to Google CDN stream with 307 Temporary Redirect
    // Supported natively by HTML5 <audio> and browser media players
    res.redirect(307, driveUrl);
  } catch (err: any) {
    console.error('[Vercel Drive Stream Redirect Error]:', err);
    res.status(500).send(err?.message || 'Streaming error');
  }
}
