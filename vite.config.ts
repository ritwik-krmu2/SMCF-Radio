import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function googleDriveProxyPlugin(): Plugin {
  return {
    name: 'google-drive-proxy',
    configureServer(server) {
      server.middlewares.use('/api/drive-stream', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost:3000');
          const fileId = urlObj.searchParams.get('id');
          if (!fileId) {
            res.statusCode = 400;
            res.end('Missing file id');
            return;
          }

          const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
          const fetchHeaders: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          };
          if (req.headers.range) {
            fetchHeaders['Range'] = req.headers.range as string;
          }

          const driveRes = await fetch(driveUrl, { headers: fetchHeaders });
          res.statusCode = driveRes.status;

          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Range');
          res.setHeader('Accept-Ranges', 'bytes');

          const contentType = driveRes.headers.get('content-type');
          if (contentType) res.setHeader('Content-Type', contentType);

          const contentLength = driveRes.headers.get('content-length');
          if (contentLength) res.setHeader('Content-Length', contentLength);

          const contentRange = driveRes.headers.get('content-range');
          if (contentRange) res.setHeader('Content-Range', contentRange);

          if (!driveRes.body) {
            res.end();
            return;
          }

          const reader = driveRes.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(Buffer.from(value));
          }
          res.end();
        } catch (err: any) {
          console.error('Error streaming Google Drive audio:', err);
          res.statusCode = 500;
          res.end(err?.message || 'Streaming error');
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), googleDriveProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
