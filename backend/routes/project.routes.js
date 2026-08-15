const express = require('express');
const { Project } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/projects — public showcase, filterable by category
router.get('/', async (req, res) => {
  const { category } = req.query;
  const filter = { visibleToRecruiters: true, ...(category ? { category } : {}) };
  const projects = await Project.find(filter).populate('team', 'fullName avatarUrl');
  res.json({ projects });
});

// GET /api/projects/open-roles — Project Partner Matcher board
router.get('/open-roles', async (req, res) => {
  const projects = await Project.find({ 'openRoles.filled': false })
    .select('title category openRoles team')
    .populate('team', 'fullName');
  res.json({ projects });
});

// POST /api/projects — student creates/submits a capstone project
router.post('/', requireAuth, async (req, res) => {
  const project = await Project.create({ ...req.body, team: [req.user._id, ...(req.body.team || [])] });
  res.status(201).json({ project });
});

// PATCH /api/projects/:id — update project (owner only, simplified check)
router.patch('/:id', requireAuth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  if (!project.team.some(id => String(id) === String(req.user._id)) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only team members can edit this project.' });
  }
  Object.assign(project, req.body);
  await project.save();
  res.json({ project });
});

// POST /api/projects/:id/recruiter-interest — recruiter expresses interest (secure access)
router.post('/:id/recruiter-interest', requireAuth, requireRole('recruiter'), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });

  project.recruiterInterest.push({ recruiter: req.user._id, note: req.body.note });
  await project.save();
  res.json({ project });
});

module.exports = router;
