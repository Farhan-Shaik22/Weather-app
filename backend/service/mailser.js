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
    let description;
    
    switch (alertData.operator) {
      case "less than":
        conditionMessage = "dropped below";
        emoji = "🥶";
        description = "has decreased significantly";
        break;
      case "greater than":
        conditionMessage = "risen above";
        emoji = "☀️";
        description = "has increased significantly";
        break;
      case "equal to":
        conditionMessage = "reached exactly";
        emoji = "✨";
        description = "has hit precisely";
        break;
      default:
        conditionMessage = "changed to";
        emoji = "🌈";
        description = "has changed";
        break;
    }

    const formatDate = () => {
      return new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: {
        name: "Weather App",
        address: config.email.user
      },
      to: userEmail,
      subject: `Weather Alert: ${alertData.type} Update for ${alertData.cityName} ${emoji}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; text-align: center;">Weather Alert for ${alertData.cityName}</h1>
          
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 16px; color: #2c3e50;">
              The ${alertData.type.toLowerCase()} in ${alertData.cityName} ${description} ${emoji}
            </p>
            
            <div style="background-color: white; border-radius: 8px; padding: 15px; margin-top: 15px;">
              <h3 style="color: #2c3e50; margin-top: 0;">Current Conditions:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;">
                  <strong>Current ${alertData.type}:</strong> 
                  <span style="color: #e74c3c;">${alertData.value.toFixed(1)}</span>
                </li>
                <li style="margin: 10px 0;">
                  <strong>Your Alert Threshold:</strong> 
                  <span style="color: #3498db;">${alertData.threshold}</span>
                </li>
                <li style="margin: 10px 0;">
                  <strong>Status:</strong> 
                  Has ${conditionMessage} your set threshold
                </li>
                <li style="margin: 10px 0;">
                  <strong>Recorded at:</strong> 
                  ${formatDate()}
                </li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 20px;">
            <p>This is an automated alert from Weather App. Stay informed about your local weather!</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Alert email sent successfully to ${userEmail}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();