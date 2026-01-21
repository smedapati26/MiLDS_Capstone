import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { listAircraft } from '../api/aircraft';
import { listPersonnel } from '../api/personnel';
import { listScenarios } from '../api/scenarios';
import { useNavigate } from 'react-router-dom';


export default function Assets() {

  const navigate = useNavigate();

  const [active, setActive] = useState('aircraft'); // 'aircraft' | 'personnel' | 'scenarios'

  // Search state
  const [aircraftSearch, setAircraftSearch] = useState('');
  const [personnelQuery, setPersonnelQuery] = useState('');

  // Connection indicators
  const [aircraftCount, setAircraftCount] = useState(null);
  const [personnelCount, setPersonnelCount] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Data rows
  const [aircraftRows, setAircraftRows] = useState([]);
  const [personnelRows, setPersonnelRows] = useState([]);

  const [scenarioRows, setScenarioRows] = useState([]);
  const [scenarioCount, setScenarioCount] = useState(null);

    // Which row is being edited?
  const [editingAircraftId, setEditingAircraftId] = useState(null);
  const [editingPersonnelId, setEditingPersonnelId] = useState(null);

  // Draft values user is typing
  const [aircraftDraft, setAircraftDraft] = useState({});
  const [personnelDraft, setPersonnelDraft] = useState({});


  // Scenario UI state
  const [scenarioApplyingId, setScenarioApplyingId] = useState(null);
  const [reverting, setReverting] = useState(false);

  useEffect(() => {
    let mounted = true;

    client
      .get('/api/csrf/')
      .catch(() => {
        if (mounted) setApiError('CSRF endpoint failed');
      })
      .finally(async () => {
        try {
          const [a, p, s] = await Promise.allSettled([
            listAircraft(),
            listPersonnel(),
            listScenarios(),
          ]);
          if (!mounted) return;

          if (a.status === 'fulfilled') {
            const raw = a.value;
            const items = Array.isArray(raw) ? raw : raw?.results ?? [];
            setAircraftRows(items);
            setAircraftCount(items.length);
          }

          if (p.status === 'fulfilled') {
            const raw = p.value;
            const items = Array.isArray(raw) ? raw : raw?.results ?? [];
            setPersonnelRows(items);
            setPersonnelCount(items.length);
          }

          if (s.status === 'fulfilled') {
            const raw = s.value;
            const items = Array.isArray(raw) ? raw : raw?.results ?? [];
            setScenarioRows(items);
            setScenarioCount(items.length);
          }

          if (
            a.status === 'rejected' ||
            p.status === 'rejected' ||
            s.status === 'rejected'
          ) {
            setApiError('Some resources failed to load');
          }
        } catch (e) {
          if (mounted) setApiError('API probe failed');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ---- Small UI helpers ----

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
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        border: '1px solid var(--border)',
        borderRadius: 999,
        background: 'var(--surface-strong)',
        color: '#374151',
        fontWeight: 600,
        fontSize: 12,
      }}
    >
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
          <tr>
            <td className="empty" colSpan={columns.length}>
              No data yet. Use the controls above to add or update entries.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const Button = ({ children, variant = 'primary', onClick, disabled }) => (
    <button
      className={`btn ${
        variant === 'primary' ? 'btn-primary' : 'btn-secondary'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );

  const startEditAircraft = (row) => {
    const id = row.pk; // this is what you use as <tr key={row.pk}>
    setEditingAircraftId(id);
    setAircraftDraft({
      status: row.status ?? '',
      current_unit: row.current_unit ?? '',
      hours_to_phase: row.hours_to_phase ?? '',
    });
  };

  const saveAircraft = async (row) => {
    try {
      const id = row.pk; // use pk (same key you render) :contentReference[oaicite:12]{index=12}

      const payload = {
        status: aircraftDraft.status,
        current_unit: aircraftDraft.current_unit,
        hours_to_phase: aircraftDraft.hours_to_phase === '' ? null : Number(aircraftDraft.hours_to_phase),
      };

      const updated = await updateAircraft(id, payload);

      setAircraftRows((prev) =>
        prev.map((r) => (r.pk === row.pk ? { ...r, ...updated } : r))
      );

      setEditingAircraftId(null);
      setAircraftDraft({});
    } catch (e) {
      console.error(e);
      setApiError(e?.response?.data?.detail || 'Failed to save aircraft changes');
    }
  };

  const savePersonnel = async (row) => {
    try {
      const id = row.user_id; // Soldier PK 

      const payload = {
        rank: personnelDraft.rank,
        primary_mos: personnelDraft.primary_mos,
        current_unit: personnelDraft.current_unit,
        is_maintainer: !!personnelDraft.is_maintainer,
      };

      const updated = await updatePersonnel(id, payload);

      setPersonnelRows((prev) =>
        prev.map((r) => (r.user_id === row.user_id ? { ...r, ...updated } : r))
      );

      setEditingPersonnelId(null);
      setPersonnelDraft({});
    } catch (e) {
      console.error(e);
      setApiError(e?.response?.data?.detail || 'Failed to save personnel changes');
    }
  };



  const cancelEditAircraft = () => {
    setEditingAircraftId(null);
    setAircraftDraft({});
  };

  const startEditPersonnel = (row) => {
    const id = row.user_id; // this is what you use as <tr key={row.user_id}>
    setEditingPersonnelId(id);
    setPersonnelDraft({
      rank: row.rank ?? '',
      primary_mos: row.primary_mos ?? '',
      current_unit: row.current_unit ?? '',
      is_maintainer: !!row.is_maintainer,
    });
  };

  const cancelEditPersonnel = () => {
    setEditingPersonnelId(null);
    setPersonnelDraft({});
  };


  // ---- Status chips ----

  const aircraftStatus = apiError ? (
    <Chip>⚠️ API error</Chip>
  ) : aircraftCount !== null ? (
    <Chip>API connected · {aircraftCount} aircraft</Chip>
  ) : (
    <Chip>Connecting…</Chip>
  );

  const personnelStatus = apiError ? (
    <Chip>⚠️ API error</Chip>
  ) : personnelCount !== null ? (
    <Chip>API connected · {personnelCount} personnel</Chip>
  ) : (
    <Chip>Connecting…</Chip>
  );

  // ---- Client-side search filters ----

  const normalizedSearch = aircraftSearch.trim().toLowerCase();

  const filteredAircraft = normalizedSearch
    ? aircraftRows.filter((row) => {
        const tail = String(row.aircraft_pk ?? row.pk ?? '').toLowerCase();
        const type = (row.model_name ?? '').toLowerCase();
        const unit = (row.current_unit ?? '').toLowerCase();
        const status = (row.status ?? '').toLowerCase();

        return (
          tail.includes(normalizedSearch) ||
          type.includes(normalizedSearch) ||
          unit.includes(normalizedSearch) ||
          status.includes(normalizedSearch)
        );
      })
    : aircraftRows;

  const normalizedPersonnelSearch = personnelQuery.trim().toLowerCase();

  const filteredPersonnel = normalizedPersonnelSearch
    ? personnelRows.filter((row) => {
        const name = `${row.first_name ?? ''} ${
          row.last_name ?? ''
        }`.toLowerCase();
        const rank = (row.rank ?? '').toLowerCase();
        const mos = (row.primary_mos ?? '').toLowerCase();
        const unit = (row.current_unit ?? '').toLowerCase();

        return (
          name.includes(normalizedPersonnelSearch) ||
          rank.includes(normalizedPersonnelSearch) ||
          mos.includes(normalizedPersonnelSearch) ||
          unit.includes(normalizedPersonnelSearch)
        );
      })
    : personnelRows;

  // ---- Apply scenario from frontend ----

  const handleApplyScenario = async (scenarioId) => {
    try {
      setScenarioApplyingId(scenarioId);
      setApiError(null);

      // Uses your existing HTML view /scenarios/<pk>/run/
      await client.get(`/scenarios/${scenarioId}/run/`);

      // Refresh aircraft + personnel to reflect changes
      const [a, p] = await Promise.allSettled([
        listAircraft(),
        listPersonnel(),
      ]);

      if (a.status === 'fulfilled') {
        const raw = a.value;
        const items = Array.isArray(raw) ? raw : raw?.results ?? [];
        setAircraftRows(items);
        setAircraftCount(items.length);
      }

      if (p.status === 'fulfilled') {
        const raw = p.value;
        const items = Array.isArray(raw) ? raw : raw?.results ?? [];
        setPersonnelRows(items);
        setPersonnelCount(items.length);
      }
    } catch (e) {
      console.error(e);
      setApiError('Failed to apply scenario');
    } finally {
      setScenarioApplyingId(null);
    }
  };

  // ---- Revert last scenario run ----

  const handleRevertLastScenario = async () => {
    try {
      setReverting(true);
      setApiError(null);

      await client.post('/api/scenarios/revert-last/');

      // After revert, refresh aircraft + personnel
      const [a, p] = await Promise.allSettled([
        listAircraft(),
        listPersonnel(),
      ]);

      if (a.status === 'fulfilled') {
        const raw = a.value;
        const items = Array.isArray(raw) ? raw : raw?.results ?? [];
        setAircraftRows(items);
        setAircraftCount(items.length);
      }

      if (p.status === 'fulfilled') {
        const raw = p.value;
        const items = Array.isArray(raw) ? raw : raw?.results ?? [];
        setPersonnelRows(items);
        setPersonnelCount(items.length);
      }
    } catch (e) {
      console.error(e);
      setApiError('Failed to revert last scenario');
    } finally {
      setReverting(false);
    }
  };

  // Scenarios toolbar component with Revert button
  const ScenariosToolbar = (
    <>
      <Button onClick={() => navigate('/scenarios/new')}>New Scenario</Button>
      <Button variant="secondary">Import</Button>
      <Button
        variant="secondary"
        onClick={handleRevertLastScenario}
        disabled={reverting}
      >
        {reverting ? 'Reverting…' : 'Revert last run'}
      </Button>
    </>
  );

  // ---- Render ----

  return (
    <main className="container">
      {/* Page title */}
      <h1 className="section-title" style={{ fontSize: 24, marginTop: 4 }}>
        Assets
      </h1>

      {/* Tabs */}
      <div
        className="tabs"
        role="tablist"
        aria-label="Assets sections"
        style={{ marginTop: 12 }}
      >
        <Tab id="aircraft" label="Aircraft" />
        <Tab id="personnel" label="Personnel" />
        <Tab id="scenarios" label="Custom Scenarios" />
      </div>

      {/* Panels */}
      <div style={{ marginTop: 16 }}>
        {active === 'aircraft' && (
          <>
            <SectionHead
              title="Aircraft"
              status={aircraftStatus}
              toolbar={null}
            />

            <div className="toolbar" style={{ marginBottom: 8 }}>
              <input
                type="search"
                placeholder="Search tail, type, unit..."
                className="search-input"
                value={aircraftSearch}
                onChange={(e) => setAircraftSearch(e.target.value)}
              />
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tail #</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Base</th>
                    <th>Hours to Phase</th>
                    <th style={{ width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAircraft.length === 0 ? (
                    <tr>
                      <td className="empty" colSpan={5}>
                        {aircraftRows.length === 0
                          ? 'No aircraft found.'
                          : 'No aircraft match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAircraft.map((row) => {
                      const isEditing = editingAircraftId === row.pk;

                      return (
                        <tr key={row.pk}>
                          <td>{row.aircraft_pk ?? row.pk}</td>
                          <td>{row.model_name}</td>

                          <td>
                            {isEditing ? (
                              <input
                                className="search-input"
                                value={aircraftDraft.status ?? ''}
                                onChange={(e) =>
                                  setAircraftDraft((d) => ({ ...d, status: e.target.value }))
                                }
                              />
                            ) : (
                              row.status
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <input
                                className="search-input"
                                value={aircraftDraft.current_unit ?? ''}
                                onChange={(e) =>
                                  setAircraftDraft((d) => ({ ...d, current_unit: e.target.value }))
                                }
                              />
                            ) : (
                              row.current_unit
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <input
                                className="search-input"
                                type="number"
                                value={aircraftDraft.hours_to_phase ?? ''}
                                onChange={(e) =>
                                  setAircraftDraft((d) => ({ ...d, hours_to_phase: e.target.value }))
                                }
                              />
                            ) : (
                              row.hours_to_phase ?? '—'
                            )}
                          </td>

                          <td>
                            {isEditing ? (
                              <>
                                <Button onClick={() => saveAircraft(row)}>Save</Button>
                                <Button variant="secondary" onClick={cancelEditAircraft}>
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button variant="secondary" onClick={() => startEditAircraft(row)}>
                                Edit
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })

                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === 'personnel' && (
          <>
            <SectionHead
              title="Personnel"
              toolbar={null}
              status={personnelStatus}
            />

            <div
              className="toolbar"
              style={{ marginBottom: 8, gap: 8, display: 'flex' }}
            >
              <input
                type="search"
                placeholder="Search name, rank, MOS, unit..."
                className="search-input"
                value={personnelQuery}
                onChange={(e) => setPersonnelQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button>Receive AMAP</Button>
              <Button variant="secondary">Update AMAP</Button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>EDIPI</th>
                    <th>Name</th>
                    <th>Rank</th>
                    <th>MOS</th>
                    <th>Unit</th>
                    <th>Role</th>
                    <th style={{ width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonnel.length === 0 ? (
                    <tr>
                      <td className="empty" colSpan={6}>
                        {personnelRows.length === 0
                          ? 'No personnel found.'
                          : 'No personnel match your search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPersonnel.map((row) => {
                      const isEditing = editingPersonnelId === row.user_id;

                      return (
                        <tr key={row.user_id}>
                          <td>{row.user_id}</td>

                          {/* Name (leave non-editable for now) */}
                          <td>
                            {row.last_name}, {row.first_name}
                          </td>

                          {/* Rank (editable) */}
                          <td>
                            {isEditing ? (
                              <input
                                className="search-input"
                                value={personnelDraft.rank ?? ''}
                                onChange={(e) =>
                                  setPersonnelDraft((d) => ({ ...d, rank: e.target.value }))
                                }
                                placeholder="e.g., CPT"
                              />
                            ) : (
                              row.rank
                            )}
                          </td>

                          {/* MOS (editable) */}
                          <td>
                            {isEditing ? (
                              <input
                                className="search-input"
                                value={personnelDraft.primary_mos ?? ''}
                                onChange={(e) =>
                                  setPersonnelDraft((d) => ({
                                    ...d,
                                    primary_mos: e.target.value,
                                  }))
                                }
                                placeholder="e.g., 15A"
                              />
                            ) : (
                              row.primary_mos
                            )}
                          </td>

                          {/* Unit (editable) */}
                          <td>
                            {isEditing ? (
                              <input
                                className="search-input"
                                value={personnelDraft.current_unit ?? ''}
                                onChange={(e) =>
                                  setPersonnelDraft((d) => ({
                                    ...d,
                                    current_unit: e.target.value,
                                  }))
                                }
                                placeholder="e.g., 2-101 CAB"
                              />
                            ) : (
                              row.current_unit
                            )}
                          </td>

                          {/* Role / is_maintainer (editable checkbox) */}
                          <td>
                            {isEditing ? (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <input
                                  type="checkbox"
                                  checked={!!personnelDraft.is_maintainer}
                                  onChange={(e) =>
                                    setPersonnelDraft((d) => ({
                                      ...d,
                                      is_maintainer: e.target.checked,
                                    }))
                                  }
                                />
                                <span style={{ fontWeight: 700 }}>
                                  {personnelDraft.is_maintainer ? 'Maintainer' : 'Other'}
                                </span>
                              </label>
                            ) : (
                              row.is_maintainer ? 'Maintainer' : 'Other'
                            )}
                          </td>

                          {/* Actions */}
                          <td>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: 8 }}>
                                {/* Save will be wired later */}
                                <Button onClick={() => savePersonnel(row)}>Save</Button>
                                <Button variant="secondary" onClick={cancelEditPersonnel}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button variant="secondary" onClick={() => startEditPersonnel(row)}>
                                Edit
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === 'scenarios' && (
          <>
            <SectionHead
              title="Custom Scenarios"
              toolbar={ScenariosToolbar}
              status={
                scenarioCount !== null ? (
                  <Chip>{scenarioCount} scenarios</Chip>
                ) : (
                  <Chip>Loading…</Chip>
                )
              }
            />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Events</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioRows.length === 0 ? (
                    <tr>
                      <td className="empty" colSpan={5}>
                        No scenarios defined yet.
                      </td>
                    </tr>
                  ) : (
                    scenarioRows.map((sc) => (
                      <tr key={sc.id}>
                        <td>{sc.name}</td>
                        <td>{sc.description}</td>
                        <td>{sc.event_count}</td>
                        <td>{new Date(sc.created_at).toLocaleString()}</td>
                        <td>
                          <Button
                            onClick={() => handleApplyScenario(sc.id)}
                            disabled={scenarioApplyingId === sc.id}
                          >
                            {scenarioApplyingId === sc.id
                              ? 'Applying…'
                              : 'Apply'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
