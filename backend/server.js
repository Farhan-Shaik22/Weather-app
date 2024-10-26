const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const weatherService = require('./service/weatherser');
const summaryService = require('./service/Dailysumser');
const thresholdService = require('./service/alertser');
const WeatherUser = require("./models/weatheruser");
const WeatherData = require("./models/CurWeather");  // Add this line
const DailySummary = require("./models/DailySum");
const Alert = require("./models/Alert");
const {encrypt} =require("./config/encryption");
const app = express();
require('dotenv').config();
app.use(cors({
  origin: 'https://weather-app-clerk.vercel.app', 
  credentials: true,               
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

weatherService.startScheduler();
summaryService.startScheduler();
thresholdService.startScheduler();

// API endpoint to get weather data (now POST)
app.post('/api/weather', async (req, res) => {
  try {
    const { cityId } = req.body; 
    const{date}=req.body;
    const data = await WeatherData.findOne({ cityId:cityId, date:date });
    // console.log(data);
    const curdata = data.updates[data.updates.length-1];
    res.json(curdata);
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hourlyweather', async (req, res) => {
  try {
    const{date}=req.body;
    const { cityId } = req.body; // Get cityId from body
    const data = await WeatherData.findOne({ cityId:cityId, date:date });
    const curdata = data.updates;
    res.json(curdata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get daily summary (now POST)
app.post('/api/summary', async (req, res) => {
  try {
    const { cityId } = req.body;
    const {date}= req.body;
    const data = await DailySummary.findOne({ cityId:cityId, date:date });
    res.json(data);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to create a user (POST)
app.post('/webhook/users', async (req, res) => {
  try {
    const {data, token} = req.body; 
    if(token!=process.env.SECRET_TOKEN){
      return res.status(400).send({ error: "Invalid Token" });
    }
    const userId= encrypt(data.id);
    const Email =data.email_addresses[0].email_address;
    const user = await WeatherUser.create({
      email: Email, userId: userId
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get user thresholds (now POST)
app.post('/api/users/thresholds', async (req, res) => {
  try {
    const { userId } = req.body;
    const id= encrypt(userId);
    const user = await WeatherUser.findOne({ userId:id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.thresholds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to add thresholds (now POST)
app.post('/api/users/thresholds/add', async (req, res) => {
  try {
    const { userId, type, value, cityId, operator } = req.body; // Get userId, type, value, cityId from body
    const id= encrypt(userId);
    const user = await WeatherUser.findOne({ userId:id }); 
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const sent=0;
    user.thresholds.push({ type, value, cityId, operator, sent});
    await user.save();
    
    res.status(201).json(user.thresholds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete thresholds (now POST)
app.post('/api/users/thresholds/delete', async (req, res) => {
  try {
    const { userId, thresholdId } = req.body; // Get userId and thresholdId from body
    const id= encrypt(userId);
    const user = await WeatherUser.findOne({ userId:id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.thresholds = user.thresholds.filter(
      t => t._id.toString() !== thresholdId
    );
    await user.save();
    
    res.json(user.thresholds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get user-specific alerts (now POST)
app.post('/api/users/alerts', async (req, res) => {
  try {
    const { userId } = req.body; 
    const id= encrypt(userId);
    const alerts = await Alert.find({ userId:id })
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
