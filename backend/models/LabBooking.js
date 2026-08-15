const mongoose = require('mongoose');
const { Schema } = mongoose;

const LabBookingSchema = new Schema({
  lab: { type: Schema.Types.ObjectId, ref: 'Labs', required: true, index: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  date: { type: Date, required: true }, // calendar day of the booking
  startTime: { type: String, required: true }, // '14:00'
  endTime: { type: String, required: true },   // '15:00'

  seatNumber: Number,
  equipmentRequested: [String], // e.g. ['Cisco 2960 Switch', 'Router x2']

  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'confirmed',
  },
}, { timestamps: true });

// Prevent double-booking the same lab/date/time slot
LabBookingSchema.index({ lab: 1, date: 1, startTime: 1 }, { unique: false });

module.exports = mongoose.model('LabBooking', LabBookingSchema);
