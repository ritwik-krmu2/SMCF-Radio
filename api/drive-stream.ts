import https from 'https';

export default async function handler(req: any, res: any) {
  try {
    const fileId = req.query?.id as string;
    if (!fileId) {
      res.status(400).send('Missing file id');
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Accept, Origin, Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;

    // Forward range header if requested by HTML5 audio player
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SMCF-Radio/1.0',
    };
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    https.get(driveUrl, { headers }, (proxyRes) => {
      // Forward status code (e.g. 200 or 206 Partial Content)
      const statusCode = proxyRes.statusCode || 200;

      // Handle redirects if any
      if ((statusCode === 301 || statusCode === 302 || statusCode === 307) && proxyRes.headers.location) {
        https.get(proxyRes.headers.location, { headers }, (redirectRes) => {
          pipeStream(redirectRes, res);
        }).on('error', (err) => {
          console.error('[Drive Proxy Redirect Error]:', err);
          if (!res.headersSent) res.status(502).send('Error streaming media');
        });
        return;
      }

      pipeStream(proxyRes, res);
    }).on('error', (err) => {
      console.error('[Drive Proxy Request Error]:', err);
      if (!res.headersSent) res.status(502).send('Error streaming media');
    });

  } catch (err: any) {
    console.error('[Vercel Drive Stream Proxy Error]:', err);
    if (!res.headersSent) {
      res.status(500).send(err?.message || 'Streaming error');
    }
  }
}

function pipeStream(sourceRes: any, targetRes: any) {
  targetRes.statusCode = sourceRes.statusCode || 200;

  // Set streaming audio headers
  targetRes.setHeader('Content-Type', sourceRes.headers['content-type'] || 'audio/mpeg');
  targetRes.setHeader('Accept-Ranges', 'bytes');

  if (sourceRes.headers['content-length']) {
    targetRes.setHeader('Content-Length', sourceRes.headers['content-length']);
  }
  if (sourceRes.headers['content-range']) {
    targetRes.setHeader('Content-Range', sourceRes.headers['content-range']);
  }

  // Explicitly avoid caching for range-sensitive audio streams
  targetRes.setHeader('Cache-Control', 'public, max-age=3600');

  sourceRes.pipe(targetRes);
}
