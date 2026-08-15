const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['AI', 'Cyber', 'Web Dev', 'Networking', 'Mobile', 'IoT', 'Other'],
    required: true,
    index: true,
  },

  team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  cohortYear: Number,

  thumbnailUrl: String,
  demoUrl: String,
  repoUrl: String,
  slidesUrl: String,

  status: {
    type: String,
    enum: ['recruiting-partners', 'in-progress', 'completed', 'archived'],
    default: 'in-progress',
  },

  // Recruiter-facing visibility toggle
  visibleToRecruiters: { type: Boolean, default: false },

  recruiterInterest: [{
    recruiter: { type: Schema.Types.ObjectId, ref: 'User' },
    note: String,
    createdAt: { type: Date, default: Date.now },
  }],

  // Project Partner Matcher: open slots on the team
  openRoles: [{
    roleTitle: String, // e.g. "Frontend developer"
    skillsNeeded: [String],
    filled: { type: Boolean, default: false },
  }],
}, { timestamps: true });

ProjectSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
