import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import parameters from '../../../public/parameters';
import cities from '../../../public/cities';

const AlertModal = ({ isOpen, onClose, userId }) => {
  const [thresholds, setThresholds] = useState([]);
  const [parameter, setParameter] = useState(parameters[0].id);
  const [cityid,setCityid] =useState(cities[0].id);
  const [operator, setOperator] = useState('greater than');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";


  const operators = [
    { id: 'greater than', label: 'Greater than' },
    { id: 'less than', label: 'Less than' },
    { id: 'equal to', label: 'Equal to' }
  ];
  

  useEffect(() => {
    fetchThresholds();
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchThresholds = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/users/thresholds`, { userId });
      setThresholds(response.data);
    } catch (error) {
      console.error('Error fetching thresholds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddThreshold = async () => {
    if (!value.trim()) return;

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/users/thresholds/add`, {
        userId,
        type: parameters[parameter].name,
        value: Number(value),
        operator,
        cityId: cityid
      });
      setValue('');
      await fetchThresholds();
    } catch (error) {
      console.error('Error adding threshold:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThreshold = async (thresholdId) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/users/thresholds/delete`, {
        userId,
        thresholdId
      });
      await fetchThresholds();
    } catch (error) {
      console.error('Error deleting threshold:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-bold text-white">
            Manage Alert Thresholds
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {/* Add new threshold section */}
          <div className="flex gap-3 items-center mb-6">
          <select
              value={cityid}
              onChange={(e) => setCityid(e.target.value)}
              className="p-2 rounded-md bg-slate-600 text-white flex-1"
            >
              {cities.map(city => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
            <select
              value={parameter}
              onChange={(e) => setParameter(e.target.value)}
              className="p-2 rounded-md bg-slate-600 text-white flex-1"
            >
              {parameters.map(param => (
                <option key={param.id} value={param.id}>
                  {param.name}
                </option>
              ))}
            </select>

            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="p-2 rounded-md bg-slate-600 text-white flex-1"
            >
              {operators.map(op => (
                <option key={op.id} value={op.id}>
                  {op.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value (only °C)"
              className="p-2 rounded-md bg-slate-600 text-white flex-1"
            />

            <button
              onClick={handleAddThreshold}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {/* Existing thresholds list */}
          <div className="space-y-3 ">
            {thresholds.map((threshold) => (
              <div
                key={threshold._id}
                className="flex items-center justify-between p-3 rounded-md border bg-slate-400"
              >
                <div className="flex items-center gap-2 ">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                  <span className="text-gray-700">
                    {threshold.type} {threshold.operator} {threshold.value} in {cities.find(city => city.id === threshold.cityId).name}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteThreshold(threshold._id)}
                  disabled={loading}
                  className="text-white transition-colors disabled:opacity-50 rounded-full bg-red-500 hover:bg-red-700 px-3 py-1"
                >
                  {/* <X className="h-6 w-6" /> */}
                  Delete
                </button>
              </div>
            ))}

            {thresholds.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No thresholds set. Add one above.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;