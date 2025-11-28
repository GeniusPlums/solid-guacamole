import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const staticPath = path.join(__dirname, '../../dist');
  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

