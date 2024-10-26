const nodemailer = require('nodemailer');
const config = require('../config/config');
require('dotenv').config();
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }

  async sendAlertEmail(userEmail, alertData) {
    let conditionMessage;
    let emoji;
    switch (alertData.operator) {
      case "less than":
        conditionMessage = "fallen below";
        emoji="🥶";
        break;
      case "greater than":
        conditionMessage = "exceeded";
        emoji="☀️"
        break;
      case "equal to":
        conditionMessage = "reached";
        emoji="😊"
        break;
      default:
        conditionMessage = "changed";
        break;
    }

    const mailOptions = {
      from: "Weather App",
      to: userEmail,
      subject: `Weather Alert for ${alertData.cityName} `,
      html: `
        <h2>Weather Alert</h2>
        <p>A weather threshold has been ${conditionMessage} ${alertData.threshold} in ${alertData.cityName} ${emoji}:</p>
        <ul>
          <li>Type: ${alertData.type}</li>
          <li>Current Value: ${alertData.value.toFixed(1)}</li>
          <li>Your Threshold: ${alertData.threshold}</li>
          <li>Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</li>
        </ul>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Alert email sent to ${userEmail}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}

module.exports = new EmailService();
