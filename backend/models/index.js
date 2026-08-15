// backend/models/index.js
// Mongoose schemas for the UTB Informatics Engineering platform.
// Import individual models from ./User, ./Course, ./Project, ./Activity, ./Labs, ./LabBooking
// This file re-exports all of them for convenience: const { User, Course } = require('./models');

const User = require('./User');
const Course = require('./Course');
const Project = require('./Project');
const Activity = require('./Activity');
const Labs = require('./Labs');
const LabBooking = require('./LabBooking');

module.exports = { User, Course, Project, Activity, Labs, LabBooking };
