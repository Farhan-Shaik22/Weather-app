const config = {
  mongoUri: 'mongodb://localhost:27017/weather-monitoring',
  openWeatherApiKey: '1be9d606dafceeeccecf1b07623b8419',
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
    user: '21bd1a661qcsma@gmail.com',
    password: 'tnay sjue ylvx tpoq'
  },
};

module.exports = config;