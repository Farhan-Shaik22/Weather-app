const mongoose = require('mongoose');

// Helper function to get the current timestamp in IST
const getISTTimestamp = () => {
  const now = new Date();
  const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
  const istOffset = 5.5 * 3600000; // IST is UTC +5:30
  return new Date(utcOffset + istOffset); // Return IST time
};

const alertSchema = new mongoose.Schema({
  userId: String,
  userEmail: String,
  cityId: Number,
  cityName: String,
  type: String,
  value: Number,
  operator: String,
  threshold: Number,
  timestamp: { 
    type: Date, 
    default: getISTTimestamp // Set the timestamp to IST
  }
});

module.exports = mongoose.model('Alert', alertSchema);
