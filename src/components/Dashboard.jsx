import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundVideo from '../assets/videoplayback.mp4';

function Dashboard() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const backgroundStyle = {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const videoStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: -2,
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: -1,
  };

  const buttonStyle = {
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
    cursor: 'pointer',
  };

  const buttonHoverStyle = {
    background: '#E97451',
    color: 'white',
  };

  const titleStyle = {
    fontSize: '2.75rem',
    fontWeight: '300',
    color: 'white',
    marginBottom: '3rem',
    fontFamily: 'Montserrat, Helvetica Neue, sans-serif',
    letterSpacing: '0.05em',
  };

  return (
    <div style={backgroundStyle}>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={videoStyle}
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div style={overlayStyle}></div>
      
      <div style={{ textAlign: 'center', maxWidth: '1000px', padding: '0 2rem', zIndex: 1 }}>
        <h1 style={titleStyle}>
          MEETSTREAM DASHBOARD
        </h1>
        
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <button 
            onClick={() => handleNavigation('/xyz')}
            style={buttonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: '#ffffff', color: '#1f2937' })}
          >
            Xyz
          </button>
          
          <button 
            onClick={() => handleNavigation('/sales-chart')}
            style={buttonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: '#ffffff', color: '#1f2937' })}
          >
            Sales Chart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;