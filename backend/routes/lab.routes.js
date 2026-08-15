const express = require('express');
const { Labs, LabBooking } = require('../models');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/labs — all labs with map coordinates, for the interactive campus map
router.get('/', async (req, res) => {
  const labs = await Labs.find({ isActive: true });
  res.json({ labs });
});

// GET /api/labs/:id/availability?date=YYYY-MM-DD — open slots for a given day
router.get('/:id/availability', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'A date query param is required.' });

  const lab = await Labs.findById(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found.' });

  const bookings = await LabBooking.find({
    lab: lab._id,
    date: new Date(date),
    status: 'confirmed',
  }).select('startTime endTime seatNumber');

  res.json({ lab, bookings });
});

// POST /api/labs/:id/book — student books a seat/slot
router.post('/:id/book', requireAuth, async (req, res) => {
  const { date, startTime, endTime, seatNumber, equipmentRequested } = req.body;
  const lab = await Labs.findById(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found.' });

  const conflict = await LabBooking.findOne({
    lab: lab._id, date: new Date(date), startTime, seatNumber, status: 'confirmed',
  });
  if (conflict) return res.status(409).json({ error: 'That seat and time slot is already booked.' });

  const booking = await LabBooking.create({
    lab: lab._id, student: req.user._id, date: new Date(date),
    startTime, endTime, seatNumber, equipmentRequested,
  });

  res.status(201).json({ booking });
});

// DELETE /api/labs/bookings/:bookingId — cancel a booking
router.delete('/bookings/:bookingId', requireAuth, async (req, res) => {
  const booking = await LabBooking.findById(req.params.bookingId);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });
  if (String(booking.student) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only cancel your own bookings.' });
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json({ booking });
});

// POST /api/labs — admin adds a new lab to the map
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const lab = await Labs.create(req.body);
  res.status(201).json({ lab });
});

module.exports = router;
