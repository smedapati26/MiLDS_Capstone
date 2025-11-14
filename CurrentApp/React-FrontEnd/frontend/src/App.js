import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Assets from './pages/Assets';
import Home from './pages/Home';


export default function App() {
  const { pathname } = useLocation();
  const showBadge = pathname !== '/';

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {showBadge && <div className="app-badge">MiLDS</div>}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assets" element={<Assets />} />
      </Routes>
    </div>
  );
}
