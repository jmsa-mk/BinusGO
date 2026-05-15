import { Router } from 'express';
import Campus from '../models/Campus.js';
import { authRequired } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

router.get('/', async (_req, res) => {
  const items = await Campus.find().sort({ cluster: 1, name: 1 });
  res.json(items);
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  const c = await Campus.create(req.body);
  res.status(201).json(c);
});

router.put('/:id', authRequired, adminOnly, async (req, res) => {
  const c = await Campus.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(c);
});

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  await Campus.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
