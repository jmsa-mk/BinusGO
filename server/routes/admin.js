import { Router } from 'express';
import User from '../models/User.js';
import Campus from '../models/Campus.js';
import Route from '../models/Route.js';
import TripHistory from '../models/TripHistory.js';
import ActivityLog from '../models/ActivityLog.js';
import Settings from '../models/Settings.js';
import { authRequired } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();
router.use(authRequired, adminOnly);

function logIt(req, action, detail) {
  ActivityLog.create({
    user: req.user?._id, userName: req.user?.name, userRole: req.user?.role,
    action, detail, ip: req.ip,
  }).catch(() => {});
}

/* ---------- Dashboard stats ---------- */
router.get('/stats', async (_req, res) => {
  const [totalUsers, totalRoutes, totalCampuses, searchesToday] = await Promise.all([
    User.countDocuments(),
    Route.countDocuments(),
    Campus.countDocuments({ status: 'Aktif' }),
    TripHistory.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
  ]);
  const byRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const byMode = await Route.aggregate([
    { $unwind: '$modes' },
    { $group: { _id: '$modes', count: { $sum: '$searchCount' } } },
  ]);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - i);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const count = await TripHistory.countDocuments({ createdAt: { $gte: start, $lt: end } });
    days.push({ date: start.toISOString().slice(5,10), count });
  }
  const topRoutes = await Route.find().sort({ searchCount: -1 }).limit(10).populate('destinationCampus');
  res.json({ totalUsers, totalRoutes, totalCampuses, searchesToday, byRole, byMode, trend: days, topRoutes });
});

/* ---------- Users ---------- */
router.get('/users', async (_req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

router.patch('/users/:id', async (req, res) => {
  const u = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  logIt(req, 'USER_UPDATE', `Edit user: ${u?.email} → ${JSON.stringify(req.body)}`);
  res.json(u);
});

router.delete('/users/:id', async (req, res) => {
  const u = await User.findByIdAndDelete(req.params.id);
  logIt(req, 'USER_DELETE', `Hapus user: ${u?.email}`);
  res.json({ ok: true });
});

/* ---------- Reports ---------- */
router.get('/reports', async (req, res) => {
  const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 30 * 86400000);
  const to = req.query.to ? new Date(req.query.to) : new Date();
  to.setHours(23, 59, 59, 999);

  // Top routes per range (by trip history count)
  const topRoutes = await TripHistory.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: '$destinationCampus', destName: { $first: '$destinationName' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Mode usage in range
  const modeUsage = await TripHistory.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to }, mode: { $exists: true, $ne: '' } } },
    { $group: { _id: '$mode', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Top campuses
  const topCampuses = await TripHistory.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: '$destinationName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  // User growth per month (last 6 months)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); d.setMonth(d.getMonth() - i);
    const next = new Date(d); next.setMonth(next.getMonth() + 1);
    const count = await User.countDocuments({ createdAt: { $gte: d, $lt: next } });
    months.push({ month: d.toISOString().slice(0, 7), count });
  }

  // Summary
  const summary = {
    totalSearches: await TripHistory.countDocuments({ createdAt: { $gte: from, $lte: to } }),
    totalNewUsers: await User.countDocuments({ createdAt: { $gte: from, $lte: to } }),
    activeCampuses: await Campus.countDocuments({ status: 'Aktif' }),
    activeRoutes: await Route.countDocuments({ status: 'Aktif' }),
  };

  res.json({ from, to, topRoutes, modeUsage, topCampuses, userGrowth: months, summary });
});

/* ---------- Activity Logs ---------- */
router.get('/logs', async (req, res) => {
  const { action, role, from, to, limit = 100 } = req.query;
  const q = {};
  if (action) q.action = action;
  if (role) q.userRole = role;
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) { const t = new Date(to); t.setHours(23,59,59,999); q.createdAt.$lte = t; }
  }
  const logs = await ActivityLog.find(q).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(logs);
});

router.get('/logs/actions', async (_req, res) => {
  const actions = await ActivityLog.distinct('action');
  res.json(actions.sort());
});

/* ---------- Settings ---------- */
router.get('/settings', async (_req, res) => {
  let s = await Settings.findOne({ key: 'global' });
  if (!s) s = await Settings.create({ key: 'global' });
  res.json(s);
});

router.put('/settings', async (req, res) => {
  const s = await Settings.findOneAndUpdate(
    { key: 'global' },
    { ...req.body, key: 'global' },
    { new: true, upsert: true }
  );
  logIt(req, 'SETTINGS_UPDATE', 'Pengaturan sistem diperbarui');
  res.json(s);
});

export default router;
