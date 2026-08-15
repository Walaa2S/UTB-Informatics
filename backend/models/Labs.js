const mongoose = require('mongoose');
const { Schema } = mongoose;

const LabsSchema = new Schema({
  name: { type: String, required: true }, // e.g. "Cisco Networking Lab B204"
  building: { type: String, required: true },
  floor: Number,

  // Spatial coordinates for the campus map grid layout
  mapCoordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },

  equipmentType: {
    type: String,
    enum: ['Cisco Networking', 'Huawei ICT', 'General Computing', 'Cybersecurity', 'AI/GPU'],
    required: true,
  },

  totalSeats: { type: Number, required: true },
  operatingHours: {
    open: { type: String, default: '08:00' },
    close: { type: String, default: '20:00' },
  },

  slotDurationMinutes: { type: Number, default: 60 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Labs', LabsSchema);
