const cron = require('node-cron');
const WeatherData = require('../models/CurWeather');
const DailySummary = require('../models/DailySum');
const config = require('../config/config');
require('dotenv').config();
class SummaryService {
  async calculateDailySummary(cityId, date) {
    // Format the date as YYYY-MM-DD to match the document structure
    const formattedDate = date.toISOString().slice(0, 10);

    // Find the weather data for the specific city and date
    const weatherRecord = await WeatherData.findOne({ cityId, date: formattedDate });

    if (!weatherRecord || weatherRecord.updates.length === 0) return null;

    const weatherUpdates = weatherRecord.updates;

    // Calculate aggregates
    const temperatures = weatherUpdates.map(update => update.temperature);
    const humidities = weatherUpdates.map(update => update.humidity);
    const windSpeeds = weatherUpdates.map(update => update.windSpeed);

    // Calculate dominant weather condition
    const conditionCounts = new Map();
    weatherUpdates.forEach(update => {
      const count = conditionCounts.get(update.weatherCondition) || 0;
      conditionCounts.set(update.weatherCondition, count + 1);
    });

    let dominantCondition = '';
    let maxCount = 0;

    conditionCounts.forEach((count, condition) => {
      if (count > maxCount) {
        maxCount = count;
        dominantCondition = condition;
      }
    });

    return {
      cityId,
      cityName: weatherRecord.cityName,
      date: formattedDate,
      avgTemperature: temperatures.reduce((a, b) => a + b) / temperatures.length,
      maxTemperature: Math.max(...temperatures),
      minTemperature: Math.min(...temperatures),
      avgHumidity: humidities.reduce((a, b) => a + b) / humidities.length,
      avgWindSpeed: windSpeeds.reduce((a, b) => a + b) / windSpeeds.length,
      dominantWeatherCondition: dominantCondition,
      conditionCounts
    };
  }

  async updateDailySummaries() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate());
  
    for (const city of config.cities) {
      try {
        const summary = await this.calculateDailySummary(city.id, yesterday);
        if (summary) {
          console.log(`Summary for ${city.name}:`, summary); // Log the summary data
          await DailySummary.create(summary);
          console.log(`Daily summary saved for ${city.name}`);
        } else {
          console.log(`No summary data for ${city.name} on ${yesterday.toISOString().slice(0, 10)}`);
        }
      } catch (error) {
        console.error(`Failed to update daily summary for ${city.name}:`, error);
      }
    }
  }
  

  startScheduler() {
    cron.schedule(
      '1 0 * * *', 
      async () => {
        console.log('Calculating daily summaries at midnight IST...');
        await this.updateDailySummaries();
      },
      {
        timezone: 'Asia/Kolkata' 
      }
    );
  }  
}

module.exports = new SummaryService();
