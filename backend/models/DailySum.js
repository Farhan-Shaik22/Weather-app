const mongoose = require('mongoose');

const DailySummarySchema = new mongoose.Schema({
  cityId: { type: String, required: true },
  cityName: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD format
  avgTemperature: { type: Number, required: true },
  maxTemperature: { type: Number, required: true },
  minTemperature: { type: Number, required: true },
  avgHumidity: { type: Number, required: true },
  avgWindSpeed: { type: Number, required: true },
  dominantWeatherCondition: { type: String, required: true },
  conditionCounts: { type: Map, of: Number } // Store condition counts as a map
});

module.exports = mongoose.model('DailySummary', DailySummarySchema);
