import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function FinancialForecastSketcher() {
  const [forecastParams, setForecastParams] = useState({
    initialRevenue: 100000,
    growthRate: 10,
    expenses: 70000,
    expenseGrowthRate: 5,
    forecastMonths: 12
  });
  
  const [forecastData, setForecastData] = useState([]);
  
  useEffect(() => {
    generateForecast();
  }, [forecastParams]);
  
  const handleInputChange = (field, value) => {
    setForecastParams({
      ...forecastParams,
      [field]: Number(value)
    });
  };
  
  const generateForecast = () => {
    const { initialRevenue, growthRate, expenses, expenseGrowthRate, forecastMonths } = forecastParams;
    const data = [];
    
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    for (let i = 0; i < forecastMonths; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentDate.getFullYear() + Math.floor((currentMonth + i) / 12);
      
      const monthlyRevenue = initialRevenue * Math.pow(1 + growthRate / 100, i / 12);
      const monthlyExpenses = expenses * Math.pow(1 + expenseGrowthRate / 100, i / 12);
      const profit = monthlyRevenue - monthlyExpenses;
      
      data.push({
        name: `${months[monthIndex]} ${year}`,
        revenue: Math.round(monthlyRevenue),
        expenses: Math.round(monthlyExpenses),
        profit: Math.round(profit)
      });
    }
    
    setForecastData(data);
  };
  
  const totalRevenue = forecastData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = forecastData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const averageProfit = forecastData.length > 0 ? totalProfit / forecastData.length : 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Instant Financial Forecast Sketcher</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Forecast Parameters</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Monthly Revenue ($)</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={forecastParams.initialRevenue}
                onChange={(e) => handleInputChange('initialRevenue', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Annual Revenue Growth Rate (%)</label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={forecastParams.growthRate}
                onChange={(e) => handleInputChange('growthRate', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Monthly Expenses ($)</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={forecastParams.expenses}
                onChange={(e) => handleInputChange('expenses', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Annual Expense Growth Rate (%)</label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={forecastParams.expenseGrowthRate}
                onChange={(e) => handleInputChange('expenseGrowthRate', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Forecast Months</label>
              <input
                type="number"
                min="1"
                max="36"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                value={forecastParams.forecastMonths}
                onChange={(e) => handleInputChange('forecastMonths', e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold">Total Revenue (Forecast Period)</h3>
              <p className="text-2xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold">Total Expenses (Forecast Period)</h3>
              <p className="text-2xl font-bold mt-2">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold">Total Profit (Forecast Period)</h3>
              <p className="text-2xl font-bold mt-2">${totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold">Average Monthly Profit</h3>
              <p className="text-2xl font-bold mt-2">${Math.round(averageProfit).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Financial Forecast</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={forecastData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#059669" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Forecast Data Table</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecastData.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.expenses.toLocaleString()}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${entry.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${entry.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialForecastSketcher;