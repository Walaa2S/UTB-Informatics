const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActivitySchema = new Schema({
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['club-meeting', 'workshop', 'certification-drive', 'hackathon', 'ambassador-post', 'other'],
    required: true,
  },
  organizer: {
    type: String,
    enum: ['Cisco Academy', 'Huawei Academy', 'Student Club', 'Department'],
    required: true,
  },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User' },

  startsAt: Date,
  endsAt: Date,
  location: String,

  imageUrl: String,
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  capacity: Number,
}, { timestamps: true });

ActivitySchema.index({ startsAt: 1, organizer: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);
