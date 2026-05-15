import { Router } from 'express';
import TripHistory from '../models/TripHistory.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, async (req, res) => {
  const items = await TripHistory.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('destinationCampus');
  res.json(items);
});

router.delete('/:id', authRequired, async (req, res) => {
  await TripHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ ok: true });
});

export default router;
