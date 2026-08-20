const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const { sendOtpEmail } = require('../utils/brevoMailer');
const { issueCode, verifyCode } = require('../utils/otpStore');

const router = express.Router();

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function signToken(student) {
  return jwt.sign(
    {
      sub: student._id || student.id,
      email: student.email,
      role: student.role || 'student',
      studentId: student.studentId
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
}

// ==========================================
// 1. Request OTP
// ==========================================
async function handleOtpRequest(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const studentId = String(req.body?.studentId || '').trim();
    const name = req.body?.name;

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.'
      });
    }

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required.'
      });
    }

    const otpCode = issueCode(email);
    await sendOtpEmail(email, otpCode);

    let student = await Student.findOne({ email });
    if (!student) {
      await Student.create({
        email,
        studentId,
        name: name || email.split('@')[0],
        role: 'student',
        isActive: true
      });
    } else {
      student.studentId = studentId;
      await student.save();
    }

    console.log(`OTP sent successfully to ${email} (ID: ${studentId})`);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent successfully.',
      expiresInSeconds: 600
    });

  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ success: false, error: err.message });
    }
    console.error('OTP request error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to send verification code.'
    });
  }
}

router.post('/request-otp', handleOtpRequest);
router.post('/otp/request', handleOtpRequest);


// ==========================================
// 2. Verify OTP
// ==========================================
async function handleOtpVerify(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otpCode = String(req.body?.otpCode || req.body?.code || '').trim();

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address.'
      });
    }

    const result = verifyCode(email, otpCode);
    if (!result.ok) {
      return res.status(401).json({
        success: false,
        error: result.reason || 'Invalid or expired verification code.'
      });
    }

    let student = await Student.findOne({ email });

    if (!student) {
      student = await Student.create({
        email,
        name: email.split('@')[0],
        role: 'student',
        isActive: true
      });
    }

    if (student.isActive === false) {
      return res.status(403).json({
        success: false,
        error: 'This account has been disabled.'
      });
    }

    const token = signToken(student);

    return res.json({
      success: true,
      token,
      user: {
        id: student._id || student.id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        role: student.role || 'student'
      }
    });

  } catch (err) {
    console.error('OTP verification error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
}

router.post('/verify-otp', handleOtpVerify);
router.post('/otp/verify', handleOtpVerify);

module.exports = router;