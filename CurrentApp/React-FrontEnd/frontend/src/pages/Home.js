
import React from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ add this import
import heroBg from '../assets/helicopter.png';

export default function Home() {
  const navigate = useNavigate();

  return (
    <main
      className="centered"
      style={{
        minHeight: '100vh',
        // ✅ background image
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      {/* ✅ dark overlay for readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
        }}
      />

      {/* ✅ content sits above overlay */}
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '40px 32px',
            // optional: make card slightly translucent
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <h1 className="hero-title">MiLDS</h1>
          <p className="hero-sub">Military Logistical Demand Simulator</p>

          <button className="btn btn-primary" onClick={() => navigate('/assets')}>
            Launch Application
          </button>
        </div>
      </div>
    </main>
  );
}
