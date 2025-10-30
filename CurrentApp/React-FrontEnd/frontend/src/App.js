import { Link, Routes, Route, useLocation } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Assets from './pages/Assets';

function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="App">
      {/* Simple top nav (visible on all pages) */}
      <nav style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #333' }}>
        <Link to="/" style={{ marginRight: 16 }}>Home</Link>
        <Link to="/assets">Assets</Link>
      </nav>

      {/* Show the big CRA header ONLY on the home route */}
      {isHome && (
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>

          <div style={{ marginTop: 16 }}>
            <Link to="/assets" style={{ color: '#61dafb' }}>
              Go to Assets →
            </Link>
          </div>
        </header>
      )}

      {/* Route outlet */}
      <Routes>
        <Route path="/assets" element={<Assets />} />
        {/* Optional: render nothing for home since header is the content */}
        <Route path="/" element={null} />
      </Routes>
    </div>
  );
}

export default App;
