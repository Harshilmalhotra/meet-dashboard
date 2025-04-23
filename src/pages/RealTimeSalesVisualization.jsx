import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function RealTimeSalesVisualization() {
  const [salesData, setSalesData] = useState([]);
  
  // Simulate fetching real-time data
  useEffect(() => {
    // Initial data
    const initialData = [
      { time: '9:00 AM', sales: 2400 },
      { time: '10:00 AM', sales: 1398 },
      { time: '11:00 AM', sales: 9800 },
      { time: '12:00 PM', sales: 3908 },
      { time: '1:00 PM', sales: 4800 },
      { time: '2:00 PM', sales: 3800 },
      { time: '3:00 PM', sales: 4300 },
    ];
    
    setSalesData(initialData);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newEntry = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sales: Math.floor(Math.random() * 10000)
      };
      
      setSalesData(prevData => {
        // Keep only the last 10 entries
        const updatedData = [...prevData, newEntry];
        if (updatedData.length > 10) {
          return updatedData.slice(updatedData.length - 10);
        }
        return updatedData;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Real-Time Sales Visualization</h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={salesData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Today's Sales</h3>
          <p className="text-3xl font-bold mt-2">$24,658</p>
          <p className="text-green-600 mt-1">↑ 12% from yesterday</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Conversion Rate</h3>
          <p className="text-3xl font-bold mt-2">3.2%</p>
          <p className="text-green-600 mt-1">↑ 0.8% from last week</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Average Order Value</h3>
          <p className="text-3xl font-bold mt-2">$58.32</p>
          <p className="text-red-600 mt-1">↓ 2.1% from last week</p>
        </div>
      </div>
    </div>
  );
}

export default RealTimeSalesVisualization;