const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  reward: { type: Number, default: 0 },
  difficulty: { type: String, required: true },
  startDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  resourceLink: { type: String },
  fileName: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);