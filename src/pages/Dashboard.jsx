import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundVideo from '../assets/videoplayback.mp4';

function Dashboard() {
  const navigate = useNavigate();
  const [showBotBox, setShowBotBox] = useState(false);
  const [zoomLink, setZoomLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const API_KEY = import.meta.env.VITE_MEETSTREAM_API_KEY || '';
  const BASE_URL = import.meta.env.VITE_MEETSTREAM_BASE_URL || '';
  const WEBHOOK_URL = import.meta.env.VITE_MEETSTREAM_WEBHOOK_URL || '';

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isValidZoomLink = (link) => {
    const zoomRegex = /^https?:\/\/([a-z0-9-]+\.)?zoom\.us\/(j|w)\/[^/?]+(\?.*)?$/;
    return zoomRegex.test(link);
  };

  const checkWebhookAvailability = async () => {
    try {
      await fetch(WEBHOOK_URL, { method: 'HEAD', mode: 'no-cors' });
      return true;
    } catch (error) {
      console.error('Webhook unavailable:', error);
      return false;
    }
  };

  const handleBotJoin = async (retryCount = 0) => {
    if (!zoomLink) {
      setStatusMessage('Please enter a Zoom link.');
      return;
    }
    if (!isValidZoomLink(zoomLink)) {
      setStatusMessage('Invalid Zoom link. Use format: https://zoom.us/j/<meeting_id> or https://zoom.us/w/<meeting_id>');
      return;
    }

    setLoading(true);
    setStatusMessage('');

    const webhookAvailable = await checkWebhookAvailability();
    if (!webhookAvailable) {
      setStatusMessage('⚠️ Webhook server may be down. Ensure ngrok is running.');
    }

    const payload = {
      meeting_link: zoomLink,
      bot_name: '2 Fast 2 Curious BOT',
      audio_required: true,
      video_required: false,
      live_audio_required: {},
      live_transcription_required: {
        webhook_url: WEBHOOK_URL,
      },
    };

    try {
      const response = await fetch(`${BASE_URL}/bots/create_bot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API response:', { status: response.status, data });

      if (response.ok) {
        setStatusMessage('✅ Bot successfully joined the meeting!');
        setZoomLink('');
        setShowBotBox(false);
      } else {
        const errorMsg = data?.detail || data?.message || 'Unknown error';
        if (errorMsg.toLowerCase().includes('api key')) {
          setStatusMessage('❌ Invalid API key. Contact Meetstream support.');
        } else if (errorMsg.toLowerCase().includes('webhook') && retryCount < 2) {
          console.log(`Retrying with default webhook (attempt ${retryCount + 1})...`);
          payload.live_transcription_required.webhook_url = 'https://default-webhook.example.com';
          setTimeout(() => handleBotJoin(retryCount + 1), 2000);
        } else {
          setStatusMessage(`❌ Error: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error('Request failed:', error);
      setStatusMessage(`❌ Request failed: ${error.message}`);
      if (error.message.includes('network') && retryCount < 2) {
        console.log(`Retrying after network error (attempt ${retryCount + 1})...`);
        setTimeout(() => handleBotJoin(retryCount + 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handlePaste = (event) => {
      const pastedText = (event.clipboardData || window.clipboardData).getData('text');
      if (isValidZoomLink(pastedText)) {
        setZoomLink(pastedText);
        setShowBotBox(true);
        setStatusMessage('');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !loading) {
      handleBotJoin();
    }
  };

  return (
    <div style={containerStyle}>
      <video autoPlay loop muted playsInline style={videoStyle}>
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        <h1 style={titleStyle}>MEETSTREAM DASHBOARD</h1>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <button onClick={() => handleNavigation('/livedashboard')} style={getButtonStyle()} onMouseEnter={hoverBtn} onMouseLeave={unhoverBtn}>
           LIve Dashboard
          </button>
          <button onClick={() => handleNavigation('/sales-chart')} style={getButtonStyle()} onMouseEnter={hoverBtn} onMouseLeave={unhoverBtn}>
            Sales Chart
          </button>
          <button onClick={() => handleNavigation('/sales-data')} style={getButtonStyle()} onMouseEnter={hoverBtn} onMouseLeave={unhoverBtn}>
            Sales Data Page
          </button>
        </div>
      </div>

      <div style={fabStyle} onClick={() => setShowBotBox(prev => !prev)}>
        A
      </div>

      {showBotBox && (
        <div style={botBoxStyle}>
          <label style={labelStyle}>Enter Zoom Link:</label>
          <input
            type="text"
            value={zoomLink}
            onChange={(e) => setZoomLink(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://zoom.us/j/..."
            style={inputStyle}
            autoFocus
          />
          <button
            onClick={handleBotJoin}
            disabled={loading}
            style={joinButtonStyle(loading)}
          >
            {loading ? 'Joining...' : 'Join via Bot'}
          </button>
          {statusMessage && (
            <p style={statusMessageStyle}>{statusMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

// --- Styles ---

const containerStyle = { position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
const videoStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -2 };
const overlayStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: -1 };
const contentStyle = { textAlign: 'center', maxWidth: '1000px', padding: '0 2rem', zIndex: 1 };
const titleStyle = { fontSize: '2.75rem', fontWeight: '300', color: 'white', marginBottom: '3rem', fontFamily: 'Montserrat, Helvetica Neue, sans-serif', letterSpacing: '0.05em' };
const fabStyle = { position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#E97451', borderRadius: '50%', padding: '1rem', width: '3rem', height: '3rem', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', cursor: 'pointer', zIndex: 2 };
const botBoxStyle = { position: 'fixed', bottom: '90px', right: '20px', backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', zIndex: 2, width: '300px' };
const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '500' };
const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc', fontSize: '0.9rem', marginBottom: '0.5rem' };
const joinButtonStyle = (loading) => ({ backgroundColor: '#E97451', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer', width: '100%', fontWeight: 'bold' });
const statusMessageStyle = { marginTop: '0.5rem', fontSize: '0.85rem', color: '#333' };

function getButtonStyle() {
  return {
    background: '#ffffff',
    transition: 'all 0.3s ease',
    padding: '1rem 1.5rem',
    borderRadius: '0.5rem',
    color: '#1f2937',
    fontWeight: '500',
    fontSize: '1.125rem',
    width: '100%',
    textAlign: 'center',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Montserrat, Helvetica Neue, sans-serif',
    letterSpacing: '0.025em',
    border: 'none',
    cursor: 'pointer'
  };
}

function hoverBtn(e) {
  e.currentTarget.style.background = '#E97451';
  e.currentTarget.style.color = 'white';
}

function unhoverBtn(e) {
  e.currentTarget.style.background = '#ffffff';
  e.currentTarget.style.color = '#1f2937';
}

export default Dashboard;
