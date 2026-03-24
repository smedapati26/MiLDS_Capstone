import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Assets from './pages/assets/Assets';
import Home from './pages/Home';
import NewScenario from './pages/NewScenario';
import mildsLogo from './assets/logo2.png';

export default function App() {
  const { pathname } = useLocation();
  const showBadge = pathname !== '/';

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {showBadge && (
        <div className="app-badge">
          <img src={mildsLogo} alt="MILDS logo" className="app-badge-logo" />
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/scenarios/new" element={<NewScenario />} />
      </Routes>
    </div>
  );
}



