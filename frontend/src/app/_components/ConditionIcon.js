import { 
    Sun, Cloud, CloudRain, Droplets, CloudLightning, Snowflake, Plus, Wind, CloudDrizzle 
  } from 'lucide-react';

export default function getWeatherIcon(condition){
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
        case 'clouds':
        return (
          <div className="relative">
            <Cloud className="w-20 h-20 text-gray-300 absolute bottom-0 right-5" />
            <Cloud className="w-16 h-16 text-gray-300 absolute bottom-2 right-0" />
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
      
        case 'haze':
        return (
          <div className="relative">
            <Sun className="w-20 h-20 text-yellow-500 absolute right-10" />
            <Wind className="w-10 h-10 text-yellow-500" />
            <Wind className="w-10 h-10 text-yellow-500" />
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
  