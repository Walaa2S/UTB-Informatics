const router = require('express').Router();
const User = require('../models/User');

// جلب المواد التي اجتازها الطالب باستخدام البريد الإلكتروني
router.get('/:email', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.params.email }).populate('passedCourses.course');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ passedCourses: user.passedCourses });
  } catch (err) {
    next(err);
  }
});

// تحديث المواد التي اجتازها الطالب
router.post('/update-passed', async (req, res, next) => {
  try {
    const { email, passedCourses } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email },
      { passedCourses },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, passedCourses: user.passedCourses });
  } catch (err) {
    next(err);
  }
});

module.exports = router;