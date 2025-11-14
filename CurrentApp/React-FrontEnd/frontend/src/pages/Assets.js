import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { listAircraft } from '../api/aircraft';
import { listPersonnel } from '../api/personnel';

export default function Assets(){
  const [active, setActive] = useState('aircraft'); // 'aircraft' | 'personnel' | 'scenarios'
  const [aircraftQuery, setAircraftQuery] = useState('');
  const [personnelQuery, setPersonnelQuery] = useState('');

  // Minimal connection indicators
  const [aircraftCount, setAircraftCount] = useState(null);   // number | null
  const [personnelCount, setPersonnelCount] = useState(null); // number | null
  const [apiError, setApiError] = useState(null);              // string | null

  useEffect(() => {
    let mounted = true;

    // Ensure CSRF cookie exists, then probe both endpoints
    client.get('/api/csrf/').finally(async () => {
      try {
        const [a, p] = await Promise.allSettled([listAircraft(), listPersonnel()]);
        if (!mounted) return;

        if (a.status === 'fulfilled') {
          const data = a.value;
          const count = Array.isArray(data) ? data.length : (data?.results?.length ?? 0);
          setAircraftCount(count);
        }
        if (p.status === 'fulfilled') {
          const data = p.value;
          const count = Array.isArray(data) ? data.length : (data?.results?.length ?? 0);
          setPersonnelCount(count);
        }

        if ((a.status === 'rejected') || (p.status === 'rejected')) {
          setApiError('Some resources failed to load');
        }
      } catch (e) {
        if (mounted) setApiError('API probe failed');
      }
    });

    return () => { mounted = false; };
  }, []);

  const Tab = ({ id, label }) => (
    <div
      role="tab"
      className={`tab ${active === id ? 'tab--active' : ''}`}
      onClick={() => setActive(id)}
      aria-pressed={active === id}
    >
      {label}
    </div>
  );

  const Chip = ({ children }) => (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding:'6px 10px', border:'1px solid var(--border)', borderRadius:999,
      background:'var(--surface-strong)', color:'#374151', fontWeight:600, fontSize:12
    }}>
      {children}
    </span>
  );

  const SectionHead = ({ title, toolbar, status }) => (
    <div className="section-head">
      <h2 className="section-title">{title}</h2>
      <div className="toolbar">
        {status}
        {toolbar}
      </div>
    </div>
  );

  const TableShell = ({ columns }) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr><td className="empty" colSpan={columns.length}>No data yet. Use the controls above to add or update entries.</td></tr>
        </tbody>
      </table>
    </div>
  );

  const Search = ({ value, onChange, placeholder }) => (
    <div className="search">
      <span className="icon" aria-hidden>🔎</span>
      <input className="input" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );

  const Button = ({ children, variant='primary', onClick }) => (
    <button className={`btn ${variant === 'primary' ? 'btn-primary':'btn-secondary'}`} onClick={onClick}>
      {children}
    </button>
  );

  const AircraftToolbar = (
    <>
      <Search
        value={aircraftQuery}
        onChange={(e)=>setAircraftQuery(e.target.value)}
        placeholder="Search aircraft (Tail #, Type, etc.)"
      />
      <Button>Receive Griffin</Button>
      <Button variant="secondary">Update Griffin</Button>
    </>
  );

  const PersonnelToolbar = (
    <>
      <Search
        value={personnelQuery}
        onChange={(e)=>setPersonnelQuery(e.target.value)}
        placeholder="Search personnel (Name, Rank, etc.)"
      />
      <Button>Receive AMAP</Button>
      <Button variant="secondary">Update AMAP</Button>
    </>
  );

  const ScenariosToolbar = (
    <>
      <Button>New Scenario</Button>
      <Button variant="secondary">Import</Button>
    </>
  );

  // Status chips
  const aircraftStatus = apiError
    ? <Chip>⚠️ API error</Chip>
    : (aircraftCount !== null ? <Chip>API connected · {aircraftCount} aircraft</Chip> : <Chip>Connecting…</Chip>);

  const personnelStatus = apiError
    ? <Chip>⚠️ API error</Chip>
    : (personnelCount !== null ? <Chip>API connected · {personnelCount} personnel</Chip> : <Chip>Connecting…</Chip>);

  return (
    <main className="container">
      {/* Page title */}
      <h1 className="section-title" style={{ fontSize:24, marginTop:4 }}>Assets</h1>

      {/* Tabs */}
      <div className="tabs" role="tablist" aria-label="Assets sections" style={{ marginTop:12 }}>
        <Tab id="aircraft" label="Aircraft" />
        <Tab id="personnel" label="Personnel" />
        <Tab id="scenarios" label="Custom Scenarios" />
      </div>

      {/* Panels */}
      <div style={{ marginTop:16 }}>
        {active === 'aircraft' && (
          <>
            <SectionHead title="Aircraft" toolbar={AircraftToolbar} status={aircraftStatus} />
            <TableShell columns={['Tail #','Type','Status','Base','Notes']} />
          </>
        )}

        {active === 'personnel' && (
          <>
            <SectionHead title="Personnel" toolbar={PersonnelToolbar} status={personnelStatus} />
            <TableShell columns={['Name','Rank','Role','Unit','Status']} />
          </>
        )}

        {active === 'scenarios' && (
          <>
            <SectionHead title="Custom Scenarios" toolbar={ScenariosToolbar} status={<Chip>Ready</Chip>} />
            <TableShell columns={['Scenario Name','Type','Status','Owner','Last Updated']} />
          </>
        )}
      </div>
    </main>
  );
}
