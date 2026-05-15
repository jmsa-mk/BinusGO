import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post('/register', async (req, res) => {
  try {
    const { name, nim, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Field wajib kurang' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email sudah terdaftar' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, nim, email, password: hash,
      role: ['Mahasiswa', 'Dosen', 'Staff'].includes(role) ? role : 'Mahasiswa',
    });
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, nim: user.nim }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Email atau password salah' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Email atau password salah' });
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, nim: user.nim }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', authRequired, (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role, nim: u.nim } });
});

export default router;
