import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import campusRoutes from './routes/campuses.js';
import routeRoutes from './routes/routes.js';
import savedRoutes from './routes/saved.js';
import savedRoutesRoute from './routes/savedRoutes.js';
import historyRoutes from './routes/history.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_, res) => res.json({ ok: true, app: 'BinusGO!' }));

app.use('/api/auth', authRoutes);
app.use('/api/campuses', campusRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/saved-routes', savedRoutesRoute);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/binusgo')
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => console.log(`✓ BinusGO! API on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('Mongo connection error:', e.message);
    process.exit(1);
  });
