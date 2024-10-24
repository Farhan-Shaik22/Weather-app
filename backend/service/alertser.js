const cron = require('node-cron');
const WeatherData = require('../models/CurWeather');
const Alert = require('../models/Alert');
const WeatherUser = require('../models/weatheruser');
const emailService = require('./mailser');
const config = require('../config/config');

class ThresholdService {
  // Validate threshold type against allowed values
  isValidThresholdType(type) {
    const validTypes = ['temperature', 'humidity', 'windSpeed'];
    return validTypes.includes(type);
  }

  // Validate operator against allowed values
  isValidOperator(operator) {
    const validOperators = ['greater than', 'less than', 'equal to'];
    return validOperators.includes(operator);
  }

  async checkThresholdsForUser(user, cityId, weatherData,city) {
    try {
      // Validate input parameters
      // console.log(weatherData);
      if (!user || !cityId || !weatherData) {
        throw new Error('Missing required parameters');
      }

      const cityThresholds = user.thresholds.filter(t => t.cityId === cityId);
      
      for (const threshold of cityThresholds) {
        // Validate threshold type
        if (!this.isValidThresholdType(threshold.type)) {
          console.error(`Invalid threshold type: ${threshold.type}`);
          continue;
        }

        const value = weatherData[threshold.type];
        
        // Check if weather data contains the threshold type
        if (value === undefined) {
          console.error(`Weather data doesn't contain ${threshold.type}`);
          continue;
        }

        // Validate operator
        if (!this.isValidOperator(threshold.operator)) {
          console.error(`Invalid operator: ${threshold.operator}`);
          continue;
        }

        let conditionMet = false;
        
        switch (threshold.operator) {
          case 'greater than':
            conditionMet = value > threshold.value;
            break;
          case 'less than':
            conditionMet = value < threshold.value;
            break;
          case 'equal to':
            conditionMet = value === threshold.value;
            break;
        }
        // console.log(city);
        if (conditionMet) {
          try {
            const alert = await Alert.create({
              userId: user.userId,
              userEmail: user.email,
              cityId,
              cityName: city,
              type: threshold.type,
              operator: threshold.operator,
              value: value,
              threshold: threshold.value,
              timestamp: new Date() // Add timestamp for alert creation
            });

            // await emailService.sendAlertEmail(user.email, alert);
          } catch (error) {
            console.error('Failed to create alert or send email:', error);
            // Continue processing other thresholds even if one fails
          }
        }
      }
    } catch (error) {
      console.error(`Error in checkThresholdsForUser for user ${user.userId}:`, error);
      throw error; // Propagate error to caller
    }
  }

  async checkThresholds() {
    try {
      const users = await WeatherUser.find({}).lean();
      if (!users.length) {
        console.log('No users found to check thresholds');
        return;
      }

      const cities = config.cities;
      if (!cities || !cities.length) {
        console.error('No cities configured');
        return;
      }

      for (const city of cities) {
        const latestWeather = await WeatherData.findOne({ cityId: city.id })
          .sort({ timestamp: -1 })
          .lean();
          
        if (!latestWeather) {
          console.log(`No weather data found for city ${city.id}`);
          continue;
        }

        for (const user of users) {
          try {
            // console.log(latestWeather);
            await this.checkThresholdsForUser(user, city.id, latestWeather.updates[latestWeather.updates.length-1],latestWeather.cityName);
          } catch (error) {
            console.error(`Failed to check thresholds for user ${user.userId}:`, error);
            // Continue processing other users even if one fails
          }
        }
      }
    } catch (error) {
      console.error('Failed to check thresholds:', error);
      // You might want to add monitoring/alerting here for production
    }
  }

  startScheduler() {
    // Validate cron expression
    if (!cron.validate('*/5 * * * *')) {
      throw new Error('Invalid cron expression');
    }

    cron.schedule('*/5 * * * *', async () => {
      console.log('Checking thresholds...', new Date().toISOString());
      await this.checkThresholds();
    });
  }
}

module.exports = new ThresholdService();