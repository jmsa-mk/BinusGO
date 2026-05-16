import { Router } from 'express';
import SavedRoute from '../models/SavedRoute.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, async (req, res) => {
  const items = await SavedRoute.find({ user: req.user._id })
    .populate({ path: 'route', populate: { path: 'destinationCampus' } })
    .sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', authRequired, async (req, res) => {
  try {
    const s = await SavedRoute.create({ user: req.user._id, route: req.body.routeId });
    res.status(201).json(s);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Rute sudah disimpan' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/by-route/:routeId', authRequired, async (req, res) => {
  await SavedRoute.findOneAndDelete({ user: req.user._id, route: req.params.routeId });
  res.json({ ok: true });
});

router.delete('/:id', authRequired, async (req, res) => {
  await SavedRoute.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

export default router;
