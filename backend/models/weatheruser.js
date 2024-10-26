const mongoose = require('mongoose');

// Helper function to get the current timestamp in IST
const getISTTimestamp = () => {
  const now = new Date();
  const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
  const istOffset = 5.5 * 3600000; // IST is UTC +5:30
  return new Date(utcOffset + istOffset); // Return IST time
};

const thresholdSchema = new mongoose.Schema({
  type: String,
  value: Number,
  cityId: Number,
  operator: String,
  sent: Number
});

const weatherUserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: {
    type: String,
    required: true,
    unique: true
  },
  thresholds: [thresholdSchema],
  createdAt: { 
    type: Date, 
    default: getISTTimestamp // Set the createdAt timestamp to IST
  }
});

module.exports = mongoose.model('WeatherUser', weatherUserSchema);
