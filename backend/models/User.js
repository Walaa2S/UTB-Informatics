const mongoose = require('mongoose');
const { Schema } = mongoose;

const CertificationSchema = new Schema({
  issuer: { type: String, enum: ['Cisco', 'Huawei', 'Other'], required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true }, // uploaded proof (PDF/image)
  verified: { type: Boolean, default: false },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  issuedAt: Date,
}, { _id: true, timestamps: true });

const UserSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },

  role: {
    type: String,
    enum: ['student', 'ambassador', 'faculty', 'recruiter', 'admin'],
    default: 'student',
    index: true,
  },

  // Student-specific
  studentId: { type: String, unique: true, sparse: true },
  cohortYear: Number,
  careerTrackInterest: {
    type: String,
    enum: ['cloud', 'network', 'security', 'ai', 'developer', null],
    default: null,
  },
  passedCourses: [{
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    grade: { type: String }, // e.g. 'A', 'B+'
    semester: String,
    completedAt: Date,
  }],
  gpaSnapshot: { type: Number, min: 0, max: 4.0 },

  // Ambassador-specific
  ambassadorProgram: { type: String, enum: ['Cisco', 'Huawei', null], default: null },
  ambassadorBio: String,
  ambassadorQuote: String,

  // Recruiter-specific (corporate access)
  companyName: String,
  companyVerified: { type: Boolean, default: false },

  certifications: [CertificationSchema],
  avatarUrl: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

UserSchema.index({ role: 1, cohortYear: 1 });

module.exports = mongoose.model('User', UserSchema);
