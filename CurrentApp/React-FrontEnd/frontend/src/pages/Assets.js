import React, { useState } from 'react';

export default function Assets() {
  const [activeTab, setActiveTab] = useState('aircraft'); // 'aircraft' | 'personnel'

  const TabButton = ({ id, label }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          flex: 1,
          padding: '0.75rem 1rem',
          fontWeight: 600,
          border: '1px solid #2a2a2a',
          borderRight: id === 'aircraft' ? 'none' : '1px solid #2a2a2a',
          background: isActive ? '#111827' : '#121212',
          color: isActive ? '#d1d5db' : '#9ca3af',
          cursor: 'pointer',
          transition: 'background 120ms ease, color 120ms ease',
        }}
        aria-pressed={isActive}
      >
        {label}
      </button>
    );
  };

  const Tabs = () => (
    <div
      role="tablist"
      aria-label="Assets sections"
      style={{
        display: 'flex',
        border: '1px solid #2a2a2a',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#111827',
      }}
    >
      <TabButton id="aircraft" label="Aircraft" />
      <TabButton id="personnel" label="Personnel" />
    </div>
  );

  const TableShell = ({ title, columns }) => (
    <section style={{ marginTop: '1rem' }}>
      <h2 style={{ margin: '0.5rem 0 0.75rem', fontSize: 20 }}>{title}</h2>
      <div
        style={{
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#0b0b0b',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#111827' }}>
            <tr>
              {columns.map((c) => (
                <th
                  key={c}
                  style={{
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #1f2937',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#d1d5db',
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Placeholder empty state row */}
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '1.25rem 1rem', color: '#9ca3af', fontStyle: 'italic' }}
              >
                No data yet. Click “Add” (coming soon) to create the first entry.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <main
      style={{
        padding: '1.25rem',
        textAlign: 'left',
        maxWidth: 1000,
        margin: '0 auto',
        color: '#e5e7eb',
      }}
    >
      <h1 style={{ marginBottom: '0.75rem' }}>Assets</h1>

      <Tabs />

      {/* Content area */}
      <div style={{ marginTop: '1rem' }}>
        {activeTab === 'aircraft' && (
          <TableShell
            title="Aircraft"
            columns={['Tail #', 'Type', 'Status', 'Base', 'Notes']}
          />
        )}
        {activeTab === 'personnel' && (
          <TableShell
            title="Personnel"
            columns={['Name', 'Rank', 'Role', 'Unit', 'Status']}
          />
        )}
      </div>
    </main>
  );
}
