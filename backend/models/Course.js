const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseSchema = new Schema({
  code: { type: String, required: true, unique: true, trim: true }, // e.g. 'INF301'
  title: { type: String, required: true },
  description: String,
  credits: { type: Number, required: true, default: 3 },

  year: { type: Number, required: true, min: 1, max: 4 },
semester: { type: Number, required: true, min: 1, max: 3 },

  // Curriculum tree positioning (for React Flow node coordinates)
  treePosition: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },

  prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Course' }],

  // For gate courses that unlock on total credits earned rather than a specific prior course
  // (e.g. Informatics Engineering Design Project A requires 162 completed credit units).
  prerequisiteCredits: { type: Number, default: null },

  tracks: [{
    type: String,
    enum: ['cloud', 'network', 'security', 'ai', 'developer', 'core'],
  }],

  category: { type: String, enum: ['foundation', 'core', 'elective'], default: 'core' },
  electiveGroup: { type: String, default: null }, // e.g. "Major Elective 1"

  resources: [{
    type: { type: String, enum: ['summary', 'past-paper', 'video'], required: true },
    title: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],

  labRequired: { type: Boolean, default: false },
}, { timestamps: true });

CourseSchema.index({ year: 1, semester: 1 });
CourseSchema.index({ tracks: 1 });

module.exports = mongoose.model('Course', CourseSchema);
