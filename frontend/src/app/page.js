"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sun, Cloud, CloudRain, Droplets, CloudLightning, Snowflake, Plus, AlertTriangle, CloudDrizzle 
} from 'lucide-react';
import cities from '../../public/cities';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
// Custom Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-200 rounded-lg  shadow-lg p-4 ${className}`}>
    {children}
  </div>
);

// Custom Button Component
const Button = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${className}`}
  >
    {children}
  </button>
);

const WeatherDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState(cities[4].id); 
  const [tempUnit, setTempUnit] = useState('celsius');

  const convertTemperature = (celsius) => {
    switch (tempUnit) {
      case 'fahrenheit':
        return ((celsius * 9/5) + 32).toFixed(2);
      case 'kelvin':
        return (celsius + 273.15).toFixed(2);
      default:
        return celsius.toFixed(2);
    }
  };

  const getUnitSymbol = () => {
    switch (tempUnit) {
      case 'fahrenheit':
        return '°F';
      case 'kelvin':
        return 'K';
      default:
        return '°C';
    }
  };

  useEffect(() => {
    const fetchCurrentWeather = async () => {
      try {
        const response = await axios.post('http://localhost:3001/api/weather', { cityId: selectedCityId });
        console.log(response);
        setCurrentWeather(response.data);
      } catch (error) {
        console.error('Error fetching current weather:', error);
      }
    };

    const fetchWeatherHistory = async () => {
      try {
        const response = await axios.post('http://localhost:3001/api/hourlyweather', { cityId: selectedCityId });
        const dat= response.data;
        console.log(dat);
        const updatedweatherhist=dat.map((item) => {
          return {
            ...item,
            temperature:item.temperature.toFixed(2),
            timestamp: new Date(item.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }).split(',')[1] 
          };
        });
        setWeatherHistory(updatedweatherhist);
      } catch (error) {
        console.error('Error fetching weather history:', error);
      }
    };

    const fetchUserAlerts = async () => {
      try {
        const response = await axios.post('http://localhost:3001/api/users/alerts', { userId: 'user123' });
        console.log(response);
        setAlerts(response.data);
      } catch (error) {
        console.error('Error fetching user alerts:', error);
      }
    };

    fetchCurrentWeather();
    fetchWeatherHistory();
    fetchUserAlerts();
    
  }, [selectedCityId]); // Fetch data whenever the selected city changes

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      // Clear sky
      case 'clear':
        return (
          <div className="relative">
            <Sun className="w-20 h-20 text-yellow-500" />
          </div>
        );
      
      // Few clouds
      case 'few clouds':
        return (
          <div className="relative">
            <Sun className="w-20 h-20 text-yellow-500" />
            <Cloud className="w-12 h-12 text-gray-300 absolute bottom-0 right-0" />
          </div>
        );
      
      // Scattered clouds
      case 'scattered clouds':
        return (
          <div className="relative">
            <Cloud className="w-20 h-20 text-gray-300" />
            <Cloud className="w-12 h-12 text-gray-400 absolute bottom-0 right-0" />
          </div>
        );
      
      // Broken clouds
      case 'broken clouds':
        return (
          <div className="relative">
            <Cloud className="w-20 h-20 text-gray-400" />
            <Cloud className="w-16 h-16 text-gray-500 absolute bottom-0 right-0" />
            <Cloud className="w-12 h-12 text-gray-600 absolute top-0 right-4" />
          </div>
        );
      
      // Shower rain
      case 'shower rain':
        return (
          <div className="relative">
            <Cloud className="w-20 h-20 text-gray-500" />
            <CloudDrizzle className="w-16 h-16 text-blue-400 absolute bottom-0 right-0" />
          </div>
        );
      
      // Rain
      case 'rain':
        return (
          <div className="relative">
            <Cloud className="w-20 h-20 text-gray-600" />
            <CloudRain className="w-16 h-16 text-blue-500 absolute bottom-0 right-0" />
          </div>
        );
      
      // Thunderstorm
      case 'thunderstorm':
        return (
          <div className="relative">
            <Cloud className="w-20 h-20 text-gray-700" />
            <CloudLightning className="w-16 h-16 text-yellow-400 absolute bottom-0 right-0" />
          </div>
        );
      
      // Snow
      case 'snow':
        return (
          <div className="relative">
            <Cloud className="w-20 h-20 text-gray-400" />
            <Snowflake className="w-16 h-16 text-blue-200 absolute bottom-0 right-0" />
          </div>
        );
      
      // Mist
      case 'mist':
        return (
          <div className="relative">
            <Droplets className="w-20 h-20 text-gray-400" />
            <Droplets className="w-12 h-12 text-gray-300 absolute bottom-0 right-0" />
            <Droplets className="w-10 h-10 text-gray-200 absolute top-0 right-4" />
          </div>
        );
        
      // Default case - clear sky
      default:
        return (
          <div className="relative">
            <Sun className="w-20 h-20 text-yellow-500" />
          </div>
        );
    }
  };
  const CustomLineChart = ({ data, width = 730, height = 250 }) => {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#475569" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#475569" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="timestamp" 
            stroke="#475569"
            tick={{ fill: '#475569' }}
          />
          <YAxis 
            stroke="#475569"
            tick={{ fill: '#475569' }}
          />
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#94a3b8"
            opacity={0.3}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px'
            }}
            labelStyle={{ color: '#475569' }}
          />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stroke="#475569" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTemperature)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
      <Card className="col-span-1 md:col-span-2">
          <div className=" flex flex-row items-center">
            <label htmlFor="citySelect" className="text-2xl font-bold text-gray-800 mr-5">Select City:</label>
            <select
              id="citySelect"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="p-2 border rounded-md text-black"
            >
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
        {/* Current Weather Card */}
      
      <Card className="p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Current Weather</h2>
        </div>
        <div className="space-y-4">
          {/* Temperature display */}
          <p className="text-4xl font-bold text-gray-900">
            {currentWeather?.temperature && 
              `${convertTemperature(currentWeather.temperature)}${getUnitSymbol()}`
            }
          </p>

          {/* Temperature unit buttons */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setTempUnit('celsius')}
              className={`px-3 py-1 rounded-md transition-colors ${
                tempUnit === 'celsius' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('fahrenheit')}
              className={`px-3 py-1 rounded-md transition-colors ${
                tempUnit === 'fahrenheit'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              °F
            </button>
            <button
              onClick={() => setTempUnit('kelvin')}
              className={`px-3 py-1 rounded-md transition-colors ${
                tempUnit === 'kelvin'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              K
            </button>
          </div>

        {/* Other weather details */}
        <div className="space-y-2">
          <p className="text-lg text-gray-700">Humidity: {currentWeather?.humidity}%</p>
          <p className="text-lg text-gray-700">Wind: {currentWeather?.windSpeed} km/h</p>
          <p className="text-sm text-gray-500">
            Last updated: {currentWeather?.timestamp && 
              new Date(currentWeather.timestamp).toLocaleString("en-IN", { 
                timeZone: "Asia/Kolkata" 
              })
            }
          </p>
        </div>
      </div>
    </Card>

        {/* Weather Condition Card */}
        <Card className="relative overflow-hidden">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Weather Condition</h2>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-gray-800">{currentWeather?.weatherCondition}</p>
            <div className="absolute right-4 bottom-4 opacity-50">
              {getWeatherIcon(currentWeather?.weatherCondition)}
            </div>
          </div>
        </Card>

        {/* Weather History Graph */}
        <Card className="col-span-1 md:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Temperature Trend</h2>
          </div>
          <div className="h-[300px] w-full flex justify-center">
            <CustomLineChart data={weatherHistory} width={800} height={300} />
          </div>
        </Card>

        {/* Alerts Card */}
        <Card className="col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Alerts</h2>
            <Button>
              <Plus className="w-4 h-4" />
              <span>Add Alert</span>
            </Button>
          </div>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert._id} className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-gray-700">Alert: {alert.type} in {alert.cityName} {alert.operator} {alert.threshold} </span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(alert?.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};


export default WeatherDashboard;