import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import RealTimeSalesVisualization from './pages/RealTimeSalesVisualization';
import StrategyCanvasGenerator from './pages/StrategyCanvasGenerator';
import FinancialForecastSketcher from './pages/FinancialForecastSketcher';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/real-time-sales" element={<RealTimeSalesVisualization />} />
          <Route path="/strategy-canvas" element={<StrategyCanvasGenerator />} />
          <Route path="/financial-forecast" element={<FinancialForecastSketcher />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;