import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/error';
import { requireAuth } from './middleware/auth';
import authRoutes from './routes/auth';
import publicRoutes from './routes/public';
import customerRoutes from './routes/customers';
import jobRoutes from './routes/jobs';
import crewRoutes from './routes/crews';
import reportRoutes from './routes/reports';
import weatherRoutes from './routes/weather';
import notificationRoutes from './routes/notifications';
import messageRoutes from './routes/messages';
import activityRoutes from './routes/activities';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Public endpoints (no auth) — auth + marketing-site quote capture
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

// Authenticated API
app.use('/api/customers', requireAuth, customerRoutes);
app.use('/api/jobs', requireAuth, jobRoutes);
app.use('/api/crews', requireAuth, crewRoutes);
app.use('/api/reports', requireAuth, reportRoutes);
app.use('/api/weather', requireAuth, weatherRoutes);
app.use('/api/notifications', requireAuth, notificationRoutes);
app.use('/api/messages', requireAuth, messageRoutes);
app.use('/api/activities', requireAuth, activityRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);

app.use('/api', notFound);
app.use(errorHandler);
