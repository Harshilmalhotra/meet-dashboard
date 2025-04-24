import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Select from 'react-select';

const extractForecast = (transcript) => {
  const lowerTranscript = transcript.toLowerCase();
  const timeKeywords = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'next quarter', 'q1', 'q2', 'q3', 'q4'];
  const percentMatch = lowerTranscript.match(/(\d+)\s*percent/);
  const growthPercent = percentMatch ? parseInt(percentMatch[1]) : 10; // Default 10% if no percent specified

  for (const period of timeKeywords) {
    if (lowerTranscript.includes(period)) {
      return { period: period.charAt(0).toUpperCase() + period.slice(1), growthPercent };
    }
  }
  return null;
};

function SalesChart() {
  const [transcripts, setTranscripts] = useState([]);
  const [graphData, setGraphData] = useState([
    { time: 'January', sales: 100 },
    { time: 'February', sales: 40 },
    { time: 'March', sales: 150 }
  ]);
  const [forecastData, setForecastData] = useState(null);
  const [graphType, setGraphType] = useState('line');
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [isFetching, setIsFetching] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not connected');

  const WEBSOCKET_URL = 'wss://60e9-103-4-221-252.ngrok-free.app';

  const periodOptions = [
    { value: 'All', label: 'All Time' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2025-01', label: 'January 2025' },
    { value: '2025-02', label: 'February 2025' },
  ];

  const connectWebSocket = (retryCount = 0) => {
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnectionStatus('Connected');
    };

    socket.onmessage = async (event) => {
      try {
        console.log('Raw WebSocket message:', event.data);
        let message;
        try {
          message = JSON.parse(event.data);
        } catch (parseError) {
          console.warn('Failed to parse JSON, treating as raw text:', event.data);
          message = { type: 'transcript', data: { text: event.data, timestamp: new Date().toISOString() } };
        }
        console.log('Parsed message:', message);

        if (message.type === 'transcript' && message.data?.text) {
          const newTranscript = {
            text: message.data.text,
            timestamp: message.data.timestamp ? new Date(message.data.timestamp) : new Date(),
          };
          console.log('New transcript:', newTranscript);
          setTranscripts((prev) => [...prev, newTranscript].slice(-1000));

          // Process forecast
          const forecast = extractForecast(newTranscript.text);
          if (forecast) {
            console.log('Forecast detected:', forecast);
            const lastSales = graphData[graphData.length - 1].sales; // March: 150
            const predicted = Math.round(lastSales * (1 + forecast.growthPercent / 100));
            setForecastData({
              title: `Forecast for ${forecast.period}`,
              data: [
                ...graphData.map(item => ({ name: item.time, value: item.sales })),
                { name: forecast.period, value: predicted }
              ]
            });
            console.log('Forecast data set:', {
              title: `Forecast for ${forecast.period}`,
              data: [
                ...graphData.map(item => ({ name: item.time, value: item.sales })),
                { name: forecast.period, value: predicted }
              ]
            });
          } else {
            console.log('No forecast detected for:', newTranscript.text);
          }

          // Process sales chart
          console.log('Processing transcript for sales chart:', newTranscript.text);
          processTranscriptions([...transcripts, newTranscript], selectedPeriod);
        } else {
          console.warn('Invalid message format:', message);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error, 'Raw data:', event.data);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error connecting to WebSocket');
    };

    socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setConnectionStatus(`Disconnected (Retry ${retryCount + 1})`);
      if (isFetching) {
        const delay = Math.min(1000 * 2 ** retryCount, 30000);
        console.log(`Retrying connection in ${delay}ms...`);
        setTimeout(() => connectWebSocket(retryCount + 1), delay);
      }
    };

    return socket;
  };

  useEffect(() => {
    if (!isFetching) {
      setConnectionStatus('Not connected');
      return;
    }

    const socket = connectWebSocket();

    return () => {
      socket.close();
    };
  }, [isFetching]);

  const processTranscriptions = async (transcripts, period) => {
    const filteredTranscripts = transcripts.filter((t) => {
      const date = t.timestamp;
      if (period === 'All') return true;
      if (period.length === 4) return date.getFullYear().toString() === period;
      const [year, month] = period.split('-');
      return (
        date.getFullYear().toString() === year &&
        (date.getMonth() + 1).toString().padStart(2, '0') === month
      );
    });

    const aiResponse = await simulateInsight7Analysis(filteredTranscripts);
    console.log('Processed graph data:', aiResponse.data, 'Graph type:', aiResponse.graphType);
    if (aiResponse.data.length > 0) {
      setGraphData(aiResponse.data);
    } // Keep hardcoded data if no new data
    setGraphType(aiResponse.graphType);
  };

  const simulateInsight7Analysis = async (transcripts) => {
    const transcriptText = transcripts.map(t => t.text.toLowerCase()).join(' ');
    console.log('Transcript text for analysis:', transcriptText);
    const salesKeywords = ['sales', 'revenue', 'profit', 'income', 'deal', 'contract', 'chart'];
    const timeKeywords = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'today', 'yesterday'];
    const valueKeywords = ['\\$\\d+k?', '\\d+\\s*percent'];

    if (!salesKeywords.some(k => transcriptText.includes(k))) {
      console.log('No sales keywords found');
      return { data: graphData, graphType: 'line' }; // Return hardcoded data
    }

    const isDaily = transcriptText.includes('today') || transcriptText.includes('yesterday');
    const graphType = isDaily ? 'bar' : 'line';

    const data = [...graphData]; // Start with hardcoded data
    const valueRegex = new RegExp(valueKeywords.join('|'), 'g');
    const matches = transcriptText.match(valueRegex) || [];
    console.log('Value matches:', matches);

    if (graphType === 'line') {
      const timePeriods = [];
      transcripts.forEach(t => {
        const lowerText = t.text.toLowerCase();
        for (const period of timeKeywords) {
          if (lowerText.includes(period) && !timePeriods.includes(period)) {
            timePeriods.push(period);
          }
        }
      });

      timePeriods.forEach((period) => {
        const periodTranscripts = transcripts.filter(t => t.text.toLowerCase().includes(period));
        let salesValue = 0;
        periodTranscripts.forEach(t => {
          const dollarMatch = t.text.match(/\$(\d+k?)/i);
          const percentMatch = t.text.match(/(\d+)\s*percent/i);
          if (dollarMatch) {
            salesValue += parseInt(dollarMatch[1].replace('k', '000')) || 0;
          } else if (percentMatch) {
            salesValue += parseInt(percentMatch[1]) * 1000; // Scale percent to dollars
          }
        });
        if (salesValue > 0) {
          const existingIndex = data.findIndex(d => d.time.toLowerCase() === period);
          if (existingIndex !== -1) {
            data[existingIndex] = { time: period.charAt(0).toUpperCase() + period.slice(1), sales: salesValue };
          } else {
            data.push({ time: period.charAt(0).toUpperCase() + period.slice(1), sales: salesValue });
          }
        }
      });
    } else {
      const days = ['Day 1', 'Day 2', 'Day 3'];
      days.forEach((day, i) => {
        const dayTranscripts = transcripts.filter(t => t.timestamp.getDate() === new Date().getDate() - i);
        let salesValue = 0;
        dayTranscripts.forEach(t => {
          const dollarMatch = t.text.match(/\$(\d+k?)/i);
          const percentMatch = t.text.match(/(\d+)\s*percent/i);
          if (dollarMatch) {
            salesValue += parseInt(dollarMatch[1].replace('k', '000')) || 0;
          } else if (percentMatch) {
            salesValue += parseInt(percentMatch[1]) * 1000;
          }
        });
        if (salesValue > 0) {
          data.push({ time: day, sales: salesValue });
        }
      });
    }

    return { data, graphType };
  };

  const filterGraphDataByPeriod = () => {
    if (selectedPeriod === 'All') return graphData;
    const filtered = graphData.filter(item => {
      const monthMap = {
        'January': '01',
        'February': '02',
        'March': '03',
        'April': '04',
        'May': '05',
        'June': '06',
        'July': '07',
        'August': '08',
        'September': '09',
        'October': '10',
        'November': '11',
        'December': '12'
      };
      const month = monthMap[item.time];
      if (!month) return false;
      if (selectedPeriod.length === 4) return true;
      const [year, selectedMonth] = selectedPeriod.split('-');
      return year === '2025' && month === selectedMonth;
    });
    return filtered.length > 0 ? filtered : graphData;
  };

  const downloadGraphData = () => {
    const data = JSON.stringify(filterGraphDataByPeriod(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-chart-${selectedPeriod}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePeriodChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    processTranscriptions(transcripts, selectedOption.value);
  };

  return (
    <div
      style={{
        background: '#000000',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'Montserrat, Helvetica Neue, sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#1f2937',
          }}
        >
          Sales Chart & Forecast
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <span
            style={{
              fontSize: '0.875rem',
              color: connectionStatus === 'Connected' ? '#22c55e' : '#ef4444',
            }}
          >
            WebSocket Status: {connectionStatus}
          </span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setIsFetching(!isFetching)}
            style={{
              background: isFetching ? '#ef4444' : '#3b82f6',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontFamily: 'Montserrat, Helvetica Neue, sans-serif',
            }}
            onMouseEnter={(e) => (e.target.style.background = isFetching ? '#dc2626' : '#2563eb')}
            onMouseLeave={(e) => (e.target.style.background = isFetching ? '#ef4444' : '#3b82f6')}
          >
            {isFetching ? 'Stop Fetching' : 'Start Fetching'}
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#1f2937',
            }}
          >
            Select Time Period
          </h3>
          <Select
            options={periodOptions}
            value={periodOptions.find((opt) => opt.value === selectedPeriod)}
            onChange={handlePeriodChange}
            styles={{
              control: (base) => ({
                ...base,
                width: '16rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
              }),
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={downloadGraphData}
            style={{
              background: '#10b981',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              fontFamily: 'Montserrat, Helvetica Neue, sans-serif',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#059669')}
            onMouseLeave={(e) => (e.target.style.background = '#10b981')}
          >
            Download Sales Data
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#1f2937',
            }}
          >
            Sales Analysis
          </h3>
          <div style={{ height: '24rem' }}>
            {filterGraphDataByPeriod().length === 0 ? (
              <p
                style={{
                  fontSize: '1rem',
                  color: '#6b7280',
                  textAlign: 'center',
                }}
              >
                No sales data available for selected period.
              </p>
            ) : graphType === 'line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filterGraphDataByPeriod()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filterGraphDataByPeriod()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {forecastData && (
          <div style={{ marginBottom: '2rem' }}>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#1f2937',
              }}
            >
              {forecastData.title}
            </h3>
            <div style={{ height: '24rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastData.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#34D399" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesChart;