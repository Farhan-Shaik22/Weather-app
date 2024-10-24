const axios = require('axios');
const cron = require('node-cron');
const config = require('../config/config');
const WeatherData = require('../models/CurWeather');
const getISTDate = () => {
  const now = new Date();
  const utcOffset = now.getTime() + now.getTimezoneOffset() * 60000; // Convert to UTC
  const istOffset = 5.5 * 3600000; // IST is UTC +5:30
  const istTime = new Date(utcOffset + istOffset); // Get IST time
  return istTime.toISOString().slice(0, 10); // Format as YYYY-MM-DD
};

class WeatherService {
  constructor() {
    this.apiKey = config.openWeatherApiKey;
  }

  async fetchWeatherData(cityId) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${this.apiKey}`
      );

      return {
        temperature: response.data.main.temp - 273.15, // Convert to Celsius
        feelsLike: response.data.main.feels_like - 273.15,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        weatherCondition: response.data.weather[0].main,
        timestamp: new Date() // Include a timestamp for each update
      };
    } catch (error) {
      console.error(`Error fetching weather data for city ${cityId}:`, error);
      throw error;
    }
  }

  async updateWeatherData() {
    const currentDate = getISTDate();; // Get current date (YYYY-MM-DD)

    for (const city of config.cities) {
      try {
        const weatherData = await this.fetchWeatherData(city.id);

        // Find the existing record for the current day and city
        const weatherRecord = await WeatherData.findOne({
          cityId: city.id,
          date: currentDate
        });

        if (weatherRecord) {
          // If a record exists for today, push the new weather data to the array
          weatherRecord.updates.push(weatherData);
          await weatherRecord.save();
        } else {
          // Create a new record if none exists for today
          await WeatherData.create({
            cityId: city.id,
            cityName: city.name,
            date: currentDate,
            updates: [weatherData] // Store the first update of the day
          });
        }
      } catch (error) {
        console.error(`Failed to update weather data for ${city.name}:`, error);
      }
    }
  }

  startScheduler() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      console.log('Updating weather data...');
      await this.updateWeatherData();
    });
  }
}

module.exports = new WeatherService();
