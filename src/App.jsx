
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Xyz from './pages/Xyz';
import SalesChart from './pages/SalesChart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/xyz" element={<Xyz />} />
        <Route path="/sales-chart" element={<SalesChart />} />
      </Routes>
    </Router>
  );
}

export default App;