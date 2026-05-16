import { Router } from 'express';
import Route from '../models/Route.js';
import Campus from '../models/Campus.js';
import TripHistory from '../models/TripHistory.js';
import ActivityLog from '../models/ActivityLog.js';
import { authRequired, authOptional } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

function logIt(req, action, detail) {
  ActivityLog.create({
    user: req.user?._id, userName: req.user?.name || 'Guest', userRole: req.user?.role || 'Guest',
    action, detail, ip: req.ip,
  }).catch(() => {});
}

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

  // Filter by origin text (case-insensitive substring), kecuali "Lokasi Saya" atau koordinat
  const trimmed = (origin || '').trim();
  const isCoord = /^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(trimmed);
  if (trimmed && trimmed.toLowerCase() !== 'lokasi saya' && !isCoord) {
    q.origin = { $regex: trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  let items = await Route.find(q).populate('destinationCampus');

  // Fallback: kalau gak ketemu dengan origin tertentu, kasih semua rute ke kampus itu sebagai saran
  let fallback = false;
  if (items.length === 0 && q.origin && campusId) {
    delete q.origin;
    items = await Route.find(q).populate('destinationCampus');
    fallback = items.length > 0;
  }

  Route.updateMany(q, { $inc: { searchCount: 1 } }).catch(() => {});

  if (campusId) {
    const c = await Campus.findById(campusId);
    if (req.user) {
      TripHistory.create({
        user: req.user._id,
        origin: origin || 'Lokasi Saya',
        destinationCampus: campusId,
        destinationName: c?.name,
        mode: mode || 'Semua',
      }).catch(() => {});
    }
    logIt(req, 'ROUTE_SEARCH', `${origin || 'Lokasi Saya'} → ${c?.name} [${mode || 'Semua'}]`);
  }

  res.json({ items, fallback });
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  const r = await Route.create(req.body);
  logIt(req, 'ROUTE_CREATE', `Rute baru: ${r.origin}`);
  res.status(201).json(r);
});

router.put('/:id', authRequired, adminOnly, async (req, res) => {
  const r = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
  logIt(req, 'ROUTE_UPDATE', `Edit rute: ${r?.origin}`);
  res.json(r);
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const r = await Route.findByIdAndDelete(req.params.id);
  logIt(req, 'ROUTE_DELETE', `Hapus rute: ${r?.origin}`);
  res.json({ ok: true });
});

export default router;
