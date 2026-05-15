import { Router } from 'express';
import Route from '../models/Route.js';
import Campus from '../models/Campus.js';
import TripHistory from '../models/TripHistory.js';
import { authRequired, authOptional } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', async (req, res) => {
  const { campus, mode } = req.query;
  const q = {};
  if (campus) q.destinationCampus = campus;
  if (mode && mode !== 'Semua') q.modes = mode;
  const items = await Route.find(q).populate('destinationCampus');
  res.json(items);
});

router.post('/search', authOptional, async (req, res) => {
  const { origin, campusId, mode } = req.body;
  const q = {};
  if (campusId) q.destinationCampus = campusId;
  if (mode && mode !== 'Semua') q.modes = mode;
  const items = await Route.find(q).populate('destinationCampus');

  // increment search counts (fire-and-forget)
  Route.updateMany(q, { $inc: { searchCount: 1 } }).catch(() => {});

  if (req.user && campusId) {
    const c = await Campus.findById(campusId);
    TripHistory.create({
      user: req.user._id,
      origin: origin || 'Lokasi Saya',
      destinationCampus: campusId,
      destinationName: c?.name,
      mode: mode || 'Semua',
    }).catch(() => {});
  }

  res.json(items);
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  const r = await Route.create(req.body);
  res.status(201).json(r);
});

router.put('/:id', authRequired, adminOnly, async (req, res) => {
  const r = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(r);
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  await Route.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
