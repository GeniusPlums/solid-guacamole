import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth';
import { profilesRouter } from './routes/profiles';
import { campaignsRouter } from './routes/campaigns';
import { collaborationsRouter } from './routes/collaborations';
import { influencersRouter } from './routes/influencers';
import { messagesRouter } from './routes/messages';
import { analyticsRouter } from './routes/analytics';
import { shortlistsRouter } from './routes/shortlists';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true // Allow all origins in production (served from same domain)
    : ['http://localhost:8080', 'http://localhost:5173', 'https://icy-connect.vercel.app'],
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/collaborations', collaborationsRouter);
app.use('/api/influencers', influencersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/shortlists', shortlistsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Use process.cwd() since __dirname is not available in bundled CJS from ESM source
  // In Docker, WORKDIR is /app, and static files are in /app/dist
  const staticPath = path.join(process.cwd(), 'dist');

  console.log(`📁 Serving static files from: ${staticPath}`);

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  // Express 5.x requires named wildcard parameters instead of bare '*'
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

