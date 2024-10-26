require('dotenv').config();

const config = {
  mongoUri: process.env.MONGO_STRING,
  openWeatherApiKey: process.env.API_KEY,
  cities: [
    { name: 'Delhi', id: 1273294 },
    { name: 'Mumbai', id: 1275339 },
    { name: 'Chennai', id: 1264527 },
    { name: 'Bangalore', id: 1277333 },
    { name: 'Kolkata', id: 1275004 },
    { name: 'Hyderabad', id: 1269843 }
  ],
  email: {
    service: 'gmail',
    user: process.env.USER,
    password: process.env.PASS
  },
};

module.exports = config;