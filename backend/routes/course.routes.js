const express = require('express');
const { Course, User } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses  — full curriculum tree (all nodes + prerequisite edges)
router.get('/', async (req, res) => {
  const { track } = req.query;
  const filter = track ? { tracks: track } : {};
  const courses = await Course.find(filter).populate('prerequisites', 'code title category electiveGroup');
  res.json({ courses });
});

// GET /api/courses/:id — single course detail incl. resource vault
router.get('/:id', async (req, res) => {
  const course = await Course.findById(req.params.id).populate('prerequisites', 'code title');
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  res.json({ course });
});

// POST /api/courses  — admin/faculty create a course node
router.post('/', requireAuth, requireRole('admin', 'faculty'), async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ course });
});

// PATCH /api/courses/:id — admin/faculty edit a node (position, prereqs, resources)
router.patch('/:id', requireAuth, requireRole('admin', 'faculty'), async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  res.json({ course });
});

// POST /api/courses/:id/mark-passed — authenticated student logs a passed course
router.post('/:id/mark-passed', requireAuth, async (req, res) => {
  const { grade, semester } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found.' });

  const alreadyLogged = req.user.passedCourses.some(pc => String(pc.course) === String(course._id));
  if (alreadyLogged) return res.status(409).json({ error: 'Course already marked as passed.' });

  req.user.passedCourses.push({ course: course._id, grade, semester, completedAt: new Date() });
  await req.user.save();

  res.json({ passedCourses: req.user.passedCourses });
});

// GET /api/courses/progress/me — live progress percentage for the tree
router.get('/progress/me', requireAuth, async (req, res) => {
  const totalCourses = await Course.countDocuments();
  const passedCount = req.user.passedCourses.length;
  const percentage = totalCourses ? Math.round((passedCount / totalCourses) * 100) : 0;
  res.json({ passedCount, totalCourses, percentage });
});

module.exports = router;
