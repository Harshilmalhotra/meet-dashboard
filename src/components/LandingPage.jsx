import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-700 via-red-900 to-black">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Business Analytics Dashboard</h1>
        <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
          Powerful tools for real-time sales tracking, strategy development, and financial forecasting
          all in one interactive platform.
        </p>
        <button 
          onClick={handleGetStarted} 
          className="px-8 py-4 bg-red-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-red-600 transform transition-all duration-300 hover:scale-105"
        >
          Get Started
        </button>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-black bg-opacity-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">Real-Time Sales</h3>
            <p className="text-gray-300">Monitor your sales performance as it happens with interactive charts and metrics.</p>
          </div>
          <div className="bg-black bg-opacity-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">Strategy Canvas</h3>
            <p className="text-gray-300">Compare your strengths and weaknesses against competitors to find your competitive edge.</p>
          </div>
          <div className="bg-black bg-opacity-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-3">Financial Forecasts</h3>
            <p className="text-gray-300">Create instant financial projections to guide your business decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
