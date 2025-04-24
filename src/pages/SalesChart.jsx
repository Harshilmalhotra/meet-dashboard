// src/components/SalesChart.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Select from 'react-select';

function SalesChart() {
  const [transcripts, setTranscripts] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [graphType, setGraphType] = useState('line');
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [isFetching, setIsFetching] = useState(false);

  const WEBSOCKET_URL = 'wss://60e9-103-4-221-252.ngrok-free.app';
  const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

  const periodOptions = [
    { value: 'All', label: 'All Time' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
    { value: '2025-01', label: 'January 2025' },
    { value: '2025-02', label: 'February 2025' },
  ];

  useEffect(() => {
    if (!isFetching) return;
    const socket = new WebSocket(WEBSOCKET_URL);

    socket.onopen = () => console.log('✅ WebSocket connected');

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'transcript') {
        const newTranscript = {
          ...message.data,
          timestamp: message.data.timestamp ? new Date(message.data.timestamp) : new Date(),
        };
        setTranscripts((prev) => [...prev, newTranscript].slice(-1000));

        const geminiResponse = await analyzeWithGemini(newTranscript.text);
        if (geminiResponse.toLowerCase().includes('chart this')) {
          console.log('📊 Gemini triggered chart update!');
          processTranscriptions([...transcripts, newTranscript], selectedPeriod);
        }
      }
    };

    socket.onclose = () => console.log('❌ WebSocket disconnected');

    return () => socket.close();
  }, [isFetching]);

  const analyzeWithGemini = async (text) => {
    const prompt = `You are an AI assistant that listens to business meetings. Whenever a sentence includes sales, revenue, or profit trends that should be charted, respond with: \"chart this\". Otherwise, respond with \"no chart\".\nSentence: \"${text}\"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };

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
    setGraphData(aiResponse.data);
    setGraphType(aiResponse.graphType);
  };

  const simulateInsight7Analysis = async (transcripts) => {
    const transcriptText = transcripts.map(t => t.text.toLowerCase()).join(' ');
    const salesKeywords = ['sales', 'revenue', 'profit', 'income', 'deal', 'contract'];
    const timeKeywords = ['january', 'february', 'march', 'q1', 'q2', '2024', '2025', 'today', 'yesterday'];
    const valueKeywords = ['\\$\\d+k?', '\\d+%'];

    if (!salesKeywords.some(k => transcriptText.includes(k))) {
      return { data: [], graphType: 'line' };
    }

    const isDaily = transcriptText.includes('today') || transcriptText.includes('yesterday');
    const isMonthly = timeKeywords.some(k => transcriptText.includes(k.toLowerCase()));
    const graphType = isDaily ? 'bar' : 'line';

    const data = [];
    const valueRegex = new RegExp(valueKeywords.join('|'), 'g');
    const matches = transcriptText.match(valueRegex) || [];

    if (graphType === 'line') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr'];
      months.forEach((month, i) => {
        const monthTranscripts = transcripts.filter(t => t.text.toLowerCase().includes(month.toLowerCase()));
        let salesValue = 0;
        monthTranscripts.forEach(t => {
          const match = t.text.match(/\$(\d+k?)/i);
          if (match) {
            salesValue += parseInt(match[1].replace('k', '000')) || 0;
          }
        });
        if (salesValue > 0 || matches.length > 0) {
          data.push({ time: month, sales: salesValue || (i + 1) * 10000 });
        }
      });
    } else {
      const days = ['Day 1', 'Day 2', 'Day 3'];
      days.forEach((day, i) => {
        const dayTranscripts = transcripts.filter(t => t.timestamp.getDate() === new Date().getDate() - i);
        let salesValue = 0;
        dayTranscripts.forEach(t => {
          const match = t.text.match(/\$(\d+k?)/i);
          if (match) {
            salesValue += parseInt(match[1].replace('k', '000')) || 0;
          }
        });
        if (salesValue > 0 || matches.length > 0) {
          data.push({ time: day, sales: salesValue || (i + 1) * 5000 });
        }
      });
    }

    return { data, graphType };
  };

  const downloadGraphData = () => {
    const data = JSON.stringify(graphData, null, 2);
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
    <div style={{ background: '#000', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1f2937' }}>Sales Chart</h2>

        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: isFetching ? '#22c55e' : '#ef4444' }}>
            {isFetching ? 'Fetching Transcriptions' : 'Not Fetching Transcriptions'}
          </span>
        </div>

        <button
          onClick={() => setIsFetching(!isFetching)}
          style={{ background: isFetching ? '#ef4444' : '#3b82f6', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          {isFetching ? 'Stop Fetching' : 'Start Fetching'}
        </button>

        <div style={{ margin: '1.5rem 0' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Select Time Period</h3>
          <Select
            options={periodOptions}
            value={periodOptions.find((opt) => opt.value === selectedPeriod)}
            onChange={handlePeriodChange}
            styles={{ control: (base) => ({ ...base, width: '16rem', border: '1px solid #d1d5db' }) }}
          />
        </div>

        <button
          onClick={downloadGraphData}
          style={{ background: '#10b981', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
        >
          Download Sales Data
        </button>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Sales Analysis</h3>
          <div style={{ height: '24rem' }}>
            {graphData.length === 0 ? (
              <p style={{ fontSize: '1rem', color: '#6b7280', textAlign: 'center' }}>
                No sales data available. Start fetching transcriptions to generate the chart.
              </p>
            ) : graphType === 'line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
      </div>
    </div>
  );
}

export default SalesChart;
