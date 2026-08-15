// Seeds courses and creates the initial Owner/Admin account.
// Run with: node seed.js

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { User, Course } = require('./models');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
const facultyPasswordHash = await bcrypt.hash('Doctor@12345', 12);

await User.findOneAndUpdate(
  { email: 'doctor@utb.edu.bh' },
  {
    fullName: 'Test Doctor',
    email: 'doctor@utb.edu.bh',
    passwordHash: facultyPasswordHash,
    role: 'faculty',
    isActive: true,
  },
  { upsert: true, new: true }
);

console.log('Faculty test account ready.');
console.log('Email: doctor@utb.edu.bh');
console.log('Password: Doctor@12345');
  if (!existingOwner) {
    const passwordHash = await bcrypt.hash(ownerPassword, 12);

    await User.create({
      fullName: 'Owner',
      email: ownerEmail.toLowerCase(),
      passwordHash,
      role: 'admin',
    });

    console.log('Owner account created.');
    console.log(`Email: ${ownerEmail}`);
    console.log(`Password: ${ownerPassword}`);
  } else {
    console.log('Owner account already exists.');
  }

  // =========================
  // 2. Seed Courses
  // =========================

  const raw = fs.readFileSync(
    path.join(__dirname, 'seed/courses.json'),
    'utf-8'
  );

  const courses = JSON.parse(raw);

  await Course.deleteMany({});
  console.log('Cleared existing courses.');

  // Pass 1: insert courses
  const codeToId = {};

  for (const c of courses) {
    const doc = await Course.create({
      code: c.code,
      title: c.title,
      credits: c.credits,
      year: c.year,
      semester: c.semester,
      tracks: c.tracks || [],
      category: c.category,
      electiveGroup: c.electiveGroup || null,
      prerequisiteCredits: c.prerequisiteCredits || null,
      labRequired:
        (c.category === 'core' || c.category === 'elective') &&
        c.credits > 0,
    });

    codeToId[c.code] = doc._id;
  }

  console.log(`Inserted ${courses.length} courses.`);

  // Pass 2: resolve prerequisites
  for (const c of courses) {
    const prereqIds = (c.prerequisites || [])
      .map((code) => codeToId[code])
      .filter(Boolean);

    await Course.findByIdAndUpdate(codeToId[c.code], {
      prerequisites: prereqIds,
    });
  }

  console.log('Resolved prerequisite references.');

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});