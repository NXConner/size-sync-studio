import React from 'react';

const AppSimple = () => {
  console.log("AppSimple: Rendering simple app...");
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'red' }}>
        Size Seeker - Simple Test
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'yellow' }}>
        If you can see this, the basic React app is working!
      </p>
      <div style={{ 
        backgroundColor: '#0ea5e9', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '5px',
        display: 'inline-block',
        cursor: 'pointer'
      }}
      onClick={() => alert('Button clicked!')}>
        Test Button
      </div>
      <div style={{ 
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '5px'
      }}>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
        <p>Window size: {window.innerWidth}x{window.innerHeight}</p>
      </div>
    </div>
  );
};

export default AppSimple;
