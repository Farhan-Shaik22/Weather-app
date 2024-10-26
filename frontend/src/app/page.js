"use client"
import React, { useState, useEffect } from 'react';
import { SignedIn, useUser } from '@clerk/nextjs';
import axios from 'axios';
import cities from '../../public/cities';
import parameters from '../../public/parameters';
import getWeatherIcon from './_components/ConditionIcon';
import { Plus, AlertTriangle } from 'lucide-react';
import AlertModal from './_components/AlertModal';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const words = [
  { id: 'greater than', label: 'exceeded' },
  { id: 'less than', label: 'dropped below' },
  { id: 'equal to', label: 'Equal to' }
];
const Card = ({ children, className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-white/10 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 backdrop-blur-lg border border-white/10 ${className}`}
  >
    {children}
  </button>
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="bg-slate-800/80 text-white border border-white/10 rounded-lg p-2 backdrop-blur-lg transition-all duration-200 hover:bg-slate-800"
  >
    {children}
  </select>
);

const WeatherDashboard = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [weatherSum, setWeatherSum] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState(cities[5].id);
  const [parameter, setParameter] = useState(parameters[2].id);
  const [tempUnit, setTempUnit] = useState('celsius');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const convertTemperature = (celsius) => {
    celsius=Number(celsius);
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
  const getYesterdayIST = () => {
    // Get current date and subtract one day (24 hours in milliseconds)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Format to IST timezone
    const istOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    };
    
    const istString = yesterday.toLocaleString("en-IN", istOptions);
    return istString;
  };
  const getCurrentDateWithCheck = () => {
    // Get current time in IST
    const now = new Date();
    const istTime = now.toLocaleString("en-IN", { 
      timeZone: "Asia/Kolkata",
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    // Parse hours and minutes
    const [hours, minutes] = istTime.split(':').map(Number);
    
    // Check if time is between 00:00 and 00:06
    const isInMaintenanceWindow = hours === 0 && minutes >= 0 && minutes <= 6;
    
    // Get date string based on the check
    if (isInMaintenanceWindow) {
      const yesterday = new Date(now - 24 * 60 * 60 * 1000);
      return yesterday.toLocaleString("en-IN", { 
        timeZone: "Asia/Kolkata",
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split(',')[0].split('/').reverse().join('-');
    }
  
    // Return current date if not in maintenance window
    return now.toLocaleString("en-IN", { 
      timeZone: "Asia/Kolkata" 
    }).split(',')[0].split('/').reverse().join('-');
  };
  

  useEffect(() => {
    const fetchCurrentWeather = async () => {
      try {
        const datee = getCurrentDateWithCheck();
        const response = await axios.post(`${API_BASE_URL}/api/weather`, { cityId: selectedCityId, date: datee });
        setCurrentWeather(response.data);
      } catch (error) {
        console.error('Error fetching current weather:', error);
      }
    };
  
    const fetchWeatherHistory = async () => {
      try {
        const datee = getCurrentDateWithCheck();
        const response = await axios.post(`${API_BASE_URL}/api/hourlyweather`, { cityId: selectedCityId, date: datee });
        const dat = response.data;
        const updatedweatherhist = dat.map((item) => {
          return {
            ...item,
            temperature: item.temperature.toFixed(2),
            timestamp: new Date(item.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }).split(',')[1] 
          };
        });
        setWeatherHistory(updatedweatherhist);
      } catch (error) {
        console.error('Error fetching weather history:', error);
      }
    };
  
    const fetchDailySummery = async () => {
      try {
        const datee= (getYesterdayIST().split(',')[0]).split('/').reverse().join('-');
        // console.log(datee);
        // console.log(selectedCityId);
        const response = await axios.post(`${API_BASE_URL}/api/summary`, { cityId: selectedCityId,date:datee });
        const dat= response.data;
        
        const weathersummery = {
          ...dat,
          avgTemperature: dat.avgTemperature.toFixed(2),
          maxTemperature: dat.maxTemperature.toFixed(2),
          minTemperature: dat.minTemperature.toFixed(2),
          avgHumidity: dat.avgHumidity.toFixed(2),
          avgWindSpeed: dat.avgWindSpeed.toFixed(2),
          dominantWeatherCondition: dat.dominantWeatherCondition.toUpperCase(),
        };
        setWeatherSum(weathersummery);
        // console.log(weathersummery)
      } catch (error) {
        console.error('Error fetching weather summery:', error);
      }
    };

    // const fetchUserAlerts = async () => {
    //   try {
    //     console.log(user.id);
    //     const response = await axios.post(`${API_BASE_URL}/api/users/alerts`, { userId: user });
    //     console.log(response);
    //     setAlerts(response.data);
    //   } catch (error) {
    //     console.error('Error fetching user alerts:', error);
    //   }
    // };

    fetchCurrentWeather();
    fetchWeatherHistory();
    // fetchUserAlerts();
    fetchDailySummery();
    
  }, [selectedCityId]); 

  useEffect(() => {
    const fetchUserAlerts = async () => {
      try {
        if (isLoaded && user) { 
          // console.log(user.id)
          const response = await axios.post(`${API_BASE_URL}/api/users/alerts`, { userId: user.id });
          setAlerts(response.data);
        }
      } catch (error) {
        console.error('Error fetching user alerts:', error);
      }
    };
  
    if (isSignedIn) {
      fetchUserAlerts();
    }
  }, [isLoaded, isSignedIn, user, selectedCityId]);
  

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
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="timestamp" 
            stroke="#ffffff"
            tick={{ fill: '#ffffff' }}
          />
          <YAxis 
            stroke="#ffffff"
            tick={{ fill: '#ffffff' }}
          />
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#ffffff"
            opacity={0.1}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#ffffff'
            }}
            labelStyle={{ color: '#ffffff' }}
          />
          <Area 
            type="monotone" 
            dataKey={parameters[parameter].name}
            stroke="#ffffff" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorTemperature)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="w-full min-h-screen  text-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <Card className="col-span-1 md:col-span-4">
          <div className="flex flex-row items-center gap-4">
            <h2 className="text-2xl font-light">Select City:</h2>
            <Select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
            >
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <h2 className="text-xl font-light mb-6">Current Weather</h2>
          <div className="space-y-6">
            <p className="text-6xl font-extralight">
              {currentWeather?.temperature && 
                `${convertTemperature(currentWeather.temperature)}${getUnitSymbol()}`
              }
            </p>

            <div className="flex gap-2">
              {['celsius', 'fahrenheit', 'kelvin'].map(unit => (
                <button
                  key={unit}
                  onClick={() => setTempUnit(unit)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    tempUnit === unit 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {unit === 'celsius' ? '°C' : unit === 'fahrenheit' ? '°F' : 'K'}
                </button>
              ))}
            </div>

            <div className="space-y-3 text-white/80">
              <p className="text-lg">Humidity: {currentWeather?.humidity}%</p>
              <p className="text-lg">Wind: {currentWeather?.windSpeed} km/h</p>
              <p className="text-sm text-white/60">
                Last updated: {currentWeather?.timestamp && 
                  new Date(currentWeather.timestamp).toLocaleString("en-IN", { 
                    timeZone: "Asia/Kolkata" 
                  })
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <h2 className="text-xl font-light mb-6">Weather Condition</h2>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-light">{currentWeather?.weatherCondition}</p>
            <div className="absolute right-4 bottom-4 opacity-20">
              {getWeatherIcon(currentWeather?.weatherCondition)}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-light mb-2">Weather Summary</h2>
          <p className="text-sm text-white/60 mb-6">Date: {weatherSum?.date}</p>
          <div className="space-y-3 text-white/80">
            {weatherSum?.avgTemperature && 
              <p>Avg Temp: {convertTemperature(weatherSum.avgTemperature)}{getUnitSymbol()}</p>
            }
            <p>Avg Humidity: {weatherSum?.avgHumidity}%</p>
            <p>Avg Wind: {weatherSum?.avgWindSpeed} km/h</p>
            <p>Condition: {weatherSum?.dominantWeatherCondition}</p>
            {weatherSum?.maxTemperature && 
              <p>Max: {convertTemperature(weatherSum.maxTemperature)}{getUnitSymbol()}</p>
            }
            {weatherSum?.minTemperature && 
              <p>Min: {convertTemperature(weatherSum.minTemperature)}{getUnitSymbol()}</p>
            }
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-4">
          <div className="flex flex-row items-center gap-4">
            <h2 className="text-xl font-light">Select Parameter:</h2>
            <Select
              value={parameter}
              onChange={(e) => setParameter(e.target.value)}
            >
              {parameters.map(param => (
                <option key={param.id} value={param.id}>
                  {param.name}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-4">
          <h2 className="text-xl font-light mb-6">{parameters[parameter].name.toUpperCase()} Trend</h2>
          <div className="h-[300px] w-full">
            <CustomLineChart data={weatherHistory} />
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-400">Alerts</h2>
            {isSignedIn && 
              <Button onClick={() => setIsAlertModalOpen(true)}>
                <Plus className="w-4 h-4" />
                <span>Add Alert</span>
              </Button>
            }
          </div>
          
          {isSignedIn ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert._id} className="bg-white/5 border-l-4 border-white/20 p-4 rounded-lg backdrop-blur-lg">
                  <div className="flex justify-between items-center ">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-700" />
                      <span className=" text-red-400 font-semibold">Alert: {alert.type} in {alert.cityName} {words.find(word => word.id === alert.operator).label} {alert.threshold}°C</span>
                    </div>
                    <span className="text-sm text-white/60">
                      {new Date(alert?.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border-l-4 border-white/20 p-4 rounded-lg backdrop-blur-lg">
              <p>Sign in or Sign up to use this functionality</p>
            </div>
          )}
        </Card>
      </div>
      
      {isSignedIn && (
        <AlertModal 
          isOpen={isAlertModalOpen} 
          onClose={() => setIsAlertModalOpen(false)}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default WeatherDashboard;