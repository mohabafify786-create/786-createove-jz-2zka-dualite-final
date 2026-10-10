import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateDatingChatResponse, checkServerRateLimit } from './src/server/geminiChat';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Standard security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  next();
});

app.post('/api/chat', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  if (!checkServerRateLimit(clientIp)) {
    return res.status(429).json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' });
  }

  const result = await generateDatingChatResponse(req.body);
  return res.status(result.statusCode).json({
    success: result.success,
    text: result.text,
    error: result.error,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Immutable caching for hashed assets
    app.use('/assets', express.static(path.resolve(__dirname, 'dist', 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));
    app.use(express.static(path.resolve(__dirname, 'dist'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }));
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[HeartSync] Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
