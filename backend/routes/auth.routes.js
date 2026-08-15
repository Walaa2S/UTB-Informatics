const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, studentId, cohortYear } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName, email, passwordHash,
      role: role === 'student' ? 'student' : 'student', // public signup defaults to student
      studentId, cohortYear,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, fullName: user.fullName, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Could not create account.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Incorrect email or password.' });

    const match = await bcrypt.compare(password || '', user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Incorrect email or password.' });

    const token = signToken(user);
    res.json({ token, user: { id: user._id, fullName: user.fullName, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const { passwordHash, ...safe } = req.user.toObject();
  res.json({ user: safe });
});
// GET /api/auth/utb/outlook
router.get('/utb/outlook', (req, res) => {
  const { email, role, returnTo } = req.query;

  if (!email) {
    return res.status(400).send('Email is required.');
  }

  if (role === 'faculty' && !email.toLowerCase().endsWith('@utb.edu.bh')) {
    return res.status(403).send('Faculty email must be @utb.edu.bh');
  }

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.MICROSOFT_REDIRECT_URI,
    response_mode: 'query',
    scope: 'openid profile email User.Read',
    state: JSON.stringify({
      email,
      role: role || 'student',
      returnTo: returnTo || process.env.CLIENT_ORIGIN,
    }),
  });

  const tenant = process.env.MICROSOFT_TENANT_ID;
  res.redirect(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
  );
});
module.exports = router;
