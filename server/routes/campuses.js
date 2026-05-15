import { Router } from 'express';
import Campus from '../models/Campus.js';
import ActivityLog from '../models/ActivityLog.js';
import { authRequired } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

function logIt(req, action, detail) {
  ActivityLog.create({
    user: req.user?._id, userName: req.user?.name, userRole: req.user?.role,
    action, detail, ip: req.ip,
  }).catch(() => {});
}

router.get('/', async (_req, res) => {
  const items = await Campus.find().sort({ cluster: 1, name: 1 });
  res.json(items);
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  const c = await Campus.create(req.body);
  logIt(req, 'CAMPUS_CREATE', `Tambah kampus: ${c.name}`);
  res.status(201).json(c);
});

router.put('/:id', authRequired, adminOnly, async (req, res) => {
  const c = await Campus.findByIdAndUpdate(req.params.id, req.body, { new: true });
  logIt(req, 'CAMPUS_UPDATE', `Edit kampus: ${c?.name}`);
  res.json(c);
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const c = await Campus.findByIdAndDelete(req.params.id);
  logIt(req, 'CAMPUS_DELETE', `Hapus kampus: ${c?.name}`);
  res.json({ ok: true });
});

export default router;
