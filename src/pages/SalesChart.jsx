import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Select from 'react-select';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
 // Replace with your Gemini API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const extractForecast = (transcript, historicalData) => {
  const lowerTranscript = transcript.toLowerCase();
  const timeKeywords = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'next quarter', 'q1', 'q2', 'q3', 'q4'];
  const percentMatch = lowerTranscript.match(/(\d+)\s*percent/);
  const growthPercent = percentMatch ? parseInt(percentMatch[1]) : 10;

  for (const period of timeKeywords) {
    if (lowerTranscript.includes(period)) {
      return { period: period.charAt(0).toUpperCase() + period.slice(1), growthPercent };
    }
  }
  return null;
};

function SalesChart() {
  const [transcripts, setTranscripts] = useState([]);
  const [graphData, setGraphData] = useState([]); // Empty initially
  const [forecastData, setForecastData] = useState(null);
  const [graphType, setGraphType] = useState('line');
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [isFetching, setIsFetching] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [errorMessage, setErrorMessage] = useState('');

  const WEBSOCKET_URL = 'wss://60e9-103-4-221-252.ngrok-free.app'; // Update with new ngrok URL
  const HARDCODED_DATA = [
    { time: 'January', sales: 100 },
    { time: 'February', sales: 40 },
    { time: 'March', sales: 150 }
  ];

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
      setErrorMessage('');
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

          // Process sales chart with Gemini
          const aiResponse = await analyzeWithGemini(newTranscript.text);
          console.log('Gemini response:', aiResponse);
          if (aiResponse.data.length > 0) {
            setGraphData((prev) => {
              const newData = [...prev];
              aiResponse.data.forEach((newItem) => {
                const existingIndex = newData.findIndex((item) => item.time.toLowerCase() === newItem.time.toLowerCase());
                if (existingIndex !== -1) {
                  newData[existingIndex] = newItem;
                } else {
                  newData.push(newItem);
                }
              });
              return newData;
            });
            setGraphType(aiResponse.graphType);
          }

          // Process forecast
          const forecast = extractForecast(newTranscript.text, HARDCODED_DATA);
          if (forecast) {
            console.log('Forecast detected:', forecast);
            const lastSales = HARDCODED_DATA[HARDCODED_DATA.length - 1].sales; // March: 150
            const predicted = Math.round(lastSales * (1 + forecast.growthPercent / 100));
            setForecastData({
              title: `Forecast for ${forecast.period}`,
              data: [
                ...HARDCODED_DATA.map(item => ({ name: item.time, value: item.sales })),
                { name: forecast.period, value: predicted }
              ]
            });
            console.log('Forecast data set:', {
              title: `Forecast for ${forecast.period}`,
              data: [
                ...HARDCODED_DATA.map(item => ({ name: item.time, value: item.sales })),
                { name: forecast.period, value: predicted }
              ]
            });
          } else {
            console.log('No forecast detected for:', newTranscript.text);
          }
        } else {
          console.warn('Invalid message format:', message);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error, 'Raw data:', event.data);
        setErrorMessage('Error processing transcript. Check console for details.');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error connecting to WebSocket');
      setErrorMessage('WebSocket connection failed. Ensure ngrok server is running with a valid URL.');
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
      setErrorMessage('');
      return;
    }

    const socket = connectWebSocket();

    return () => {
      socket.close();
    };
  }, [isFetching]);

  const analyzeWithGemini = async (transcript) => {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Extract sales data from this transcript for a chart. Return JSON with:
- data: Array of { time: string, sales: number } for months or days.
- graphType: "line" for months, "bar" for days (use "bar" if "today" or "yesterday" is mentioned).
Interpret percentages (e.g., "30 percent") as dollars scaled by 1000 (e.g., $30,000).
Example transcript: "create sales chart of month January of 30 percent"
Example output: { data: [{ time: "January", sales: 30000 }], graphType: "line" }
If no sales data is found, return { data: [], graphType: "line" }.
Transcript: ${transcript}`
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No content returned from Gemini API');
      }

      // Extract JSON from response (Gemini may wrap in ```json ... ```)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      const parsedData = JSON.parse(jsonString);

      return {
        data: parsedData.data || [],
        graphType: parsedData.graphType || 'line'
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      setErrorMessage('Failed to process transcript with Gemini API. Check API key and network.');
      return { data: [], graphType: 'line' };
    }
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
      const [year, selectedMonth] = period.split('-');
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

      {errorMessage && (
        <div style={{ marginBottom: '1rem' }}>
          <span
            style={{
              fontSize: '0.875rem',
              color: '#ef4444',
            }}
          >
            {errorMessage}
          </span>
        </div>
      )}

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
              Speak a prompt to display the sales chart (e.g., "create sales chart of month January of 30 percent").
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