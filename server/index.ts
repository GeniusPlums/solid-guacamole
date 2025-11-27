import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { profilesRouter } from './routes/profiles';
import { campaignsRouter } from './routes/campaigns';
import { collaborationsRouter } from './routes/collaborations';
import { influencersRouter } from './routes/influencers';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'https://icy-connect.vercel.app'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/collaborations', collaborationsRouter);
app.use('/api/influencers', influencersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

