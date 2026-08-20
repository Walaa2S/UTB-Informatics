const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  otpCode: { type: String },
  otpExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
