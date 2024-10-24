const mongoose = require('mongoose');

// Helper function to convert UTC to IST
const getISTTimestamp = () => {
  const now = new Date();
  const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
  const istOffset = 5.5 * 3600000; // IST is UTC +5:30
  return new Date(utcOffset + istOffset); // Return IST time
};

const weatherUpdateSchema = new mongoose.Schema({
  temperature: Number,
  feelsLike: Number,
  humidity: Number,
  windSpeed: Number,
  weatherCondition: String,
  timestamp: { type: Date, default: getISTTimestamp } // Timestamp for each update in IST
});

const weatherDataSchema = new mongoose.Schema({
  cityId: Number,
  cityName: String,
  date: String, // Store date as a string in YYYY-MM-DD format
  updates: [weatherUpdateSchema] // Array of weather updates
});

module.exports = mongoose.model('WeatherData', weatherDataSchema);
