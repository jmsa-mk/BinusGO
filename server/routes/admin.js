import { Router } from 'express';
import User from '../models/User.js';
import Campus from '../models/Campus.js';
import Route from '../models/Route.js';
import TripHistory from '../models/TripHistory.js';
import { authRequired } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();
router.use(authRequired, adminOnly);

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

  // 7-day trend
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

router.get('/users', async (_req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

router.patch('/users/:id', async (req, res) => {
  const u = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json(u);
});

router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
