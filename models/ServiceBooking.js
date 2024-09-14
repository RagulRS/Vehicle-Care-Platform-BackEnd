// models/ServiceBooking.js

const mongoose = require('mongoose');

const ServiceBookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: Date, required: true }, // Add date field
});

module.exports = mongoose.model('ServiceBooking', ServiceBookingSchema);
