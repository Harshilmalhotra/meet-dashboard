import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function StrategyCanvasGenerator() {
  const [factors, setFactors] = useState([
    { name: 'Price', yourScore: 7, competitorScore: 9 },
    { name: 'Quality', yourScore: 8, competitorScore: 6 },
    { name: 'Customer Service', yourScore: 9, competitorScore: 5 },
    { name: 'Innovation', yourScore: 8, competitorScore: 4 },
    { name: 'Brand Recognition', yourScore: 6, competitorScore: 8 },
  ]);
  
  const [newFactor, setNewFactor] = useState({ name: '', yourScore: 5, competitorScore: 5 });
  
  const handleFactorChange = (index, field, value) => {
    const updatedFactors = [...factors];
    updatedFactors[index][field] = field === 'name' ? value : Number(value);
    setFactors(updatedFactors);
  };
  
  const handleNewFactorChange = (field, value) => {
    setNewFactor({
      ...newFactor,
      [field]: field === 'name' ? value : Number(value)
    });
  };
  
  const addNewFactor = () => {
    if (newFactor.name) {
      setFactors([...factors, newFactor]);
      setNewFactor({ name: '', yourScore: 5, competitorScore: 5 });
    }
  };
  
  const removeFactor = (index) => {
    const updatedFactors = [...factors];
    updatedFactors.splice(index, 1);
    setFactors(updatedFactors);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Strategy Canvas Generator</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Strategic Factors Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={factors}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="yourScore" name="Your Company" fill="#8884d8" />
              <Bar dataKey="competitorScore" name="Competitor" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Edit Strategic Factors</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">Factor</th>
                <th className="px-6 py-3">Your Score (0-10)</th>
                <th className="px-6 py-3">Competitor Score (0-10)</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {factors.map((factor, index) => (
                <tr key={index} className="border-b">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full"
                      value={factor.name}
                      onChange={(e) => handleFactorChange(index, 'name', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="border rounded px-2 py-1 w-full"
                      value={factor.yourScore}
                      onChange={(e) => handleFactorChange(index, 'yourScore', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="border rounded px-2 py-1 w-full"
                      value={factor.competitorScore}
                      onChange={(e) => handleFactorChange(index, 'competitorScore', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => removeFactor(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    placeholder="New factor name"
                    className="border rounded px-2 py-1 w-full"
                    value={newFactor.name}
                    onChange={(e) => handleNewFactorChange('name', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="border rounded px-2 py-1 w-full"
                    value={newFactor.yourScore}
                    onChange={(e) => handleNewFactorChange('yourScore', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="border rounded px-2 py-1 w-full"
                    value={newFactor.competitorScore}
                    onChange={(e) => handleNewFactorChange('competitorScore', e.target.value)}
                  />
                </td>
                <td className="px-6 py-4">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={addNewFactor}
                  >
                    Add Factor
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StrategyCanvasGenerator;