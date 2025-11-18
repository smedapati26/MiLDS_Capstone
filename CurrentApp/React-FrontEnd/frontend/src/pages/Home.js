import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home(){
  const navigate = useNavigate();

  return (
    <main className="centered" style={{ minHeight:'100vh' }}>
      <div className="container">
        <div className="card" style={{ textAlign:'center', padding:'40px 32px' }}>
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
