const cron = require('node-cron');
const WeatherData = require('../models/CurWeather');
const Alert = require('../models/Alert');
const WeatherUser = require('../models/weatheruser');
const emailService = require('./mailser');
const config = require('../config/config');
require('dotenv').config();
class ThresholdService {
  isValidThresholdType(type) {
    const validTypes = ['temperature', 'humidity', 'windSpeed','feelsLike'];
    return validTypes.includes(type);
  }

  isValidOperator(operator) {
    const validOperators = ['greater than', 'less than', 'equal to'];
    return validOperators.includes(operator);
  }

  async checkThresholdsForUser(user, cityId, weatherData,city) {
    try {
      if (!user || !cityId || !weatherData) {
        throw new Error('Missing required parameters');
      }

      const cityThresholds = user.thresholds.filter(t => t.cityId === cityId);
      
      for (const threshold of cityThresholds) {
        if (!this.isValidThresholdType(threshold.type)) {
          console.error(`Invalid threshold type: ${threshold.type}`);
          continue;
        }
        if(threshold.sent==2){
          continue;
        }

        const value = weatherData[threshold.type];
        // console.log(value)
        if (value === undefined) {
          console.error(`Weather data doesn't contain ${threshold.type}`);
          continue;
        }
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
            // console.log("hello")
            await WeatherUser.updateOne(
              { userId: user.userId, 'thresholds._id': threshold._id },
              { $inc: { 'thresholds.$.sent': 1 } }
            );
            // console.log("hello2")
            await emailService.sendAlertEmail(user.email, alert);
          } catch (error) {
            console.log('Failed to create alert or send email:', error);
          }
        }
      }
    } catch (error) {
      console.error(`Error in checkThresholdsForUser for user ${user.userId}:`, error);
      throw error;
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
        .sort({ date: -1 }) 
        .limit(1) 
        .lean();
        // console.log(latestWeather)
        if (!latestWeather) {
          console.log(`No weather data found for city ${city.id}`);
          continue;
        }

        for (const user of users) {
          try {
            await this.checkThresholdsForUser(user, city.id, latestWeather.updates.at(-1),latestWeather.cityName);
          } catch (error) {
            console.error(`Failed to check thresholds for user ${user.userId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check thresholds:', error);
    }
  }

  startScheduler() {
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