const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Challenge = require('../models/Challenge'); // الرجوع خطوة للخلف للوصول لمجلد models

// إعداد رفع الملفات
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 1. جلب جميع التحديات (للطلاب والمجتمع)
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. نشر تحدٍ جديد (للأستاذ)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const newChallenge = new Challenge({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      reward: req.body.reward || 0,
      difficulty: req.body.difficulty,
      startDate: req.body.startDate,
      deadline: req.body.deadline,
      resourceLink: req.body.resourceLink,
      fileName: req.file ? req.file.filename : null
    });

    await newChallenge.save();
    res.status(201).json({ success: true, challenge: newChallenge });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. حذف تحدٍ (للأستاذ)
router.delete('/:id', async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. قبول أو الانضمام إلى تحدٍ (للطالب)
router.post('/:id/accept', async (req, res) => {
  try {
    const challengeId = req.params.id;
    res.json({ success: true, message: 'Challenge accepted successfully', challengeId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;