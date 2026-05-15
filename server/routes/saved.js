import { Router } from 'express';
import SavedLocation from '../models/SavedLocation.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, async (req, res) => {
  const items = await SavedLocation.find({ user: req.user._id }).populate('campus');
  res.json(items);
});

router.post('/', authRequired, async (req, res) => {
  try {
    const s = await SavedLocation.create({ user: req.user._id, campus: req.body.campusId });
    res.status(201).json(s);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Sudah disimpan' });
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  await SavedLocation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

export default router;
