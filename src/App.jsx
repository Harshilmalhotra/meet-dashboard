
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SalesChart from './pages/SalesChart';
import SalesDataPage from './pages/SalesDataPage';
import LiveDashboard from './pages/LiveDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/livedashboard" element={<LiveDashboard />} />
        <Route path="/sales-chart" element={<SalesChart />} />
        <Route path="/sales-data" element={<SalesDataPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;