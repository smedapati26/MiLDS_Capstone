import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import client from '../api/client';
import { listAircraft } from '../api/aircraft';
import { listPersonnel } from '../api/personnel';
import { createScenario, previewRandomScenario } from '../api/scenarios';
function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function makeEmptyAircraftEvent() {
  return {
    _id: makeId(),
    target: 'aircraft',
    aircraft_pk: '',
    status: '',
    rtl: '',
    remarks: '',
    date_down: '',
  };
}

function makeEmptyPersonnelEvent() {
  return {
    _id: makeId(),
    target: 'personnel',
    user_id: '',
    rank: '',
    first_name: '',
    last_name: '',
    primary_mos: '',
    current_unit: '',
    is_maintainer: '',
    simulated_casualty: '',
    remarks: '',
  };
}

const PERSONNEL_FIELDS = [
  { key: 'rank', label: 'Rank' },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'primary_mos', label: 'MOS' },
  { key: 'current_unit', label: 'Unit' },
  { key: 'is_maintainer', label: 'Maintainer' },
  { key: 'simulated_casualty', label: 'Simulated Casualty' },
  { key: 'remarks', label: 'Remarks' },
];

export default function NewScenario() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [aircraftRows, setAircraftRows] = useState([]);
  const [personnelRows, setPersonnelRows] = useState([]);
  const [events, setEvents] = useState(() => [makeEmptyAircraftEvent()]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [numEvents, setNumEvents] = useState(5);
  const [seed, setSeed] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        await client.get('/api/csrf/');

        const [a, p] = await Promise.all([listAircraft(), listPersonnel()]);
        if (!mounted) return;

        const aircraft = Array.isArray(a) ? a : (a?.results ?? []);
        const personnel = Array.isArray(p) ? p : (p?.results ?? []);

        setAircraftRows(aircraft);
        setPersonnelRows(personnel);
      } catch (e) {
        console.error(e);
        if (mounted) setErr('Failed to load scenario builder data.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const aircraftOptions = useMemo(() => {
    return aircraftRows
      .map((a) => ({
        value: String(a.serial ?? a.aircraft_pk ?? a.pk ?? ''),
        label: `${a.serial ?? a.aircraft_pk ?? a.pk ?? '—'} · ${a.model_name ?? 'Unknown'} · ${a.current_unit ?? ''}`,
      }))
      .filter((o) => o.value);
  }, [aircraftRows]);

  const personnelOptions = useMemo(() => {
    return personnelRows
      .map((p) => ({
        value: String(p.user_id ?? ''),
        label: `${p.user_id ?? '—'} · ${p.rank ?? ''} ${p.first_name ?? ''} ${p.last_name ?? ''}`.trim(),
      }))
      .filter((o) => o.value);
  }, [personnelRows]);

  const updateEvent = (id, patch) => {
    setEvents((prev) => prev.map((e) => (e._id === id ? { ...e, ...patch } : e)));
  };

  const addAircraftEvent = () => {
    setEvents((prev) => [...prev, makeEmptyAircraftEvent()]);
  };

  const addPersonnelEvent = () => {
    setEvents((prev) => [...prev, makeEmptyPersonnelEvent()]);
  };

  const removeEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const payloadPreview = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    const cleanedEvents = events.map((e) => {
      if (e.target === 'personnel') {
        const base = {
          target: 'personnel',
          user_id: e.user_id || null,
          rank: e.rank || '',
          first_name: e.first_name || '',
          last_name: e.last_name || '',
          primary_mos: e.primary_mos || '',
          current_unit: e.current_unit || '',
          simulated_casualty: e.simulated_casualty || '',
          remarks: e.remarks || '',
        };

        if (e.is_maintainer !== '') {
          base.is_maintainer = e.is_maintainer === true || e.is_maintainer === 'true';
        }

        Object.keys(base).forEach((k) => {
          if (base[k] === '' || base[k] === undefined) delete base[k];
        });

        return base;
      }

      const base = {
        target: 'aircraft',
        aircraft_pk: e.aircraft_pk || null,
        status: e.status || '',
        rtl: e.rtl || '',
        remarks: e.remarks || '',
        date_down: e.date_down || null,
      };

      Object.keys(base).forEach((k) => {
        if (base[k] === '' || base[k] === undefined) delete base[k];
      });

      return base;
    });

    return {
      name: trimmedName,
      description: trimmedDesc,
      events: cleanedEvents,
    };
  }, [name, description, events]);

  const validate = () => {
    if (!name.trim()) return 'Scenario name is required.';
    if (events.length === 0) return 'Add at least one event.';

    for (const e of events) {
      if (e.target === 'personnel') {
        if (!e.user_id) return 'Each personnel event must select a person.';

        const hasPersonnelChange =
          !!e.rank ||
          !!e.first_name ||
          !!e.last_name ||
          !!e.primary_mos ||
          !!e.current_unit ||
          e.is_maintainer !== '' ||
          !!e.simulated_casualty ||
          !!e.remarks;

        if (!hasPersonnelChange) {
          return 'Each personnel event must change at least one personnel field.';
        }
      } else {
        if (!e.aircraft_pk) return 'Each aircraft event must select an aircraft.';
        if (!e.status && !e.rtl && !e.remarks && !e.date_down) {
          return 'Each aircraft event must change at least one field (status, rtl, remarks, or date_down).';
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    try {
      setErr(null);
      await client.get('/api/csrf/');
      await createScenario(payloadPreview);
      navigate('/assets');
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        'Failed to save scenario. Check backend logs.';
      setErr(msg);
    }
  };

  const handleRandomizePreview = async () => {
    if (!name.trim()) {
      setErr('Scenario name is required before randomizing.');
      return;
    }

    try {
      setErr(null);
      await client.get('/api/csrf/');

      const previewReq = {
        name: name.trim(),
        description: description.trim(),
        num_events: Number(numEvents) || 5,
        seed: seed.trim() === '' ? null : Number(seed),
      };

      const preview = await previewRandomScenario(previewReq);

      const nextEvents = (preview.events || []).map((ev) => {
        if ((ev.target || 'aircraft') === 'personnel') {
          return {
            _id: makeId(),
            target: 'personnel',
            user_id: String(ev.user_id ?? ''),
            rank: ev.rank ?? '',
            first_name: ev.first_name ?? '',
            last_name: ev.last_name ?? '',
            primary_mos: ev.primary_mos ?? '',
            current_unit: ev.current_unit ?? '',
            is_maintainer:
              ev.is_maintainer === true || ev.is_maintainer === false
                ? String(ev.is_maintainer)
                : '',
            simulated_casualty: ev.simulated_casualty ?? '',
            remarks: ev.remarks ?? '',
          };
        }

        return {
          _id: makeId(),
          target: 'aircraft',
          aircraft_pk: String(ev.aircraft_pk ?? ev.serial ?? ''),
          status: ev.status ?? '',
          rtl: ev.rtl ?? '',
          remarks: ev.remarks ?? '',
          date_down: ev.date_down ?? '',
        };
      });

      setEvents(nextEvents.length ? nextEvents : [makeEmptyAircraftEvent()]);
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        'Failed to generate random preview. Check backend logs.';
      setErr(msg);
    }
  };

  return (
    <main className="container" style={{ paddingTop: 16 }}>
      <div className="section-head">
        <h2 className="section-title">Create Custom Scenario</h2>
        <div className="toolbar" style={{ gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/assets')}>
            Back
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            Save Scenario
          </button>
          <button className="btn btn-secondary" onClick={handleRandomizePreview} disabled={loading}>
            Randomize (Preview)
          </button>
        </div>
      </div>

      {err && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            background: '#FEF2F2',
            color: '#991B1B',
            border: '1px solid #FECACA',
          }}
        >
          {err}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          Loading scenario builder…
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 16, marginTop: 12 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Scenario Name</div>
                <input
                  className="search-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Griffin Degradation Drill"
                />
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Description</div>
                <input
                  className="search-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16, marginTop: 12 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontWeight: 800 }}>Scenario Events</div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={addAircraftEvent}>
                  + Add Aircraft Event
                </button>
                <button className="btn btn-secondary" onClick={addPersonnelEvent}>
                  + Add Personnel Event
                </button>
              </div>
            </div>

            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 120 }}>Target</th>
                    <th>Selection</th>
                    <th>Changes</th>
                    <th style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((e) => (
                    <tr key={e._id}>
                      <td style={{ verticalAlign: 'top' }}>
                        <strong>{e.target === 'personnel' ? 'Personnel' : 'Aircraft'}</strong>
                      </td>

                      <td style={{ verticalAlign: 'top', minWidth: 260 }}>
                        {e.target === 'personnel' ? (
                          <select
                            className="search-input"
                            value={e.user_id}
                            onChange={(evt) => updateEvent(e._id, { user_id: evt.target.value })}
                          >
                            <option value="">Select person…</option>
                            {personnelOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            className="search-input"
                            value={e.aircraft_pk}
                            onChange={(evt) => updateEvent(e._id, { aircraft_pk: evt.target.value })}
                          >
                            <option value="">Select aircraft…</option>
                            {aircraftOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td style={{ verticalAlign: 'top' }}>
                        {e.target === 'personnel' ? (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
                              gap: 8,
                            }}
                          >
                            <input
                              className="search-input"
                              value={e.rank}
                              onChange={(evt) => updateEvent(e._id, { rank: evt.target.value })}
                              placeholder="Rank"
                            />

                            <input
                              className="search-input"
                              value={e.first_name}
                              onChange={(evt) => updateEvent(e._id, { first_name: evt.target.value })}
                              placeholder="First Name"
                            />

                            <input
                              className="search-input"
                              value={e.last_name}
                              onChange={(evt) => updateEvent(e._id, { last_name: evt.target.value })}
                              placeholder="Last Name"
                            />

                            <input
                              className="search-input"
                              value={e.primary_mos}
                              onChange={(evt) => updateEvent(e._id, { primary_mos: evt.target.value })}
                              placeholder="MOS"
                            />

                            <input
                              className="search-input"
                              value={e.current_unit}
                              onChange={(evt) => updateEvent(e._id, { current_unit: evt.target.value })}
                              placeholder="Unit"
                            />

                            <select
                              className="search-input"
                              value={e.is_maintainer}
                              onChange={(evt) => updateEvent(e._id, { is_maintainer: evt.target.value })}
                            >
                              <option value="">Maintainer unchanged</option>
                              <option value="true">Maintainer</option>
                              <option value="false">Other</option>
                            </select>

                            <input
                              className="search-input"
                              value={e.simulated_casualty}
                              onChange={(evt) =>
                                updateEvent(e._id, { simulated_casualty: evt.target.value })
                              }
                              placeholder="Simulated Casualty"
                            />

                            <input
                              className="search-input"
                              value={e.remarks}
                              onChange={(evt) => updateEvent(e._id, { remarks: evt.target.value })}
                              placeholder="Remarks"
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
                              gap: 8,
                            }}
                          >
                            <input
                              className="search-input"
                              value={e.status}
                              onChange={(evt) => updateEvent(e._id, { status: evt.target.value })}
                              placeholder="e.g. NMC"
                            />

                            <input
                              className="search-input"
                              value={e.rtl}
                              onChange={(evt) => updateEvent(e._id, { rtl: evt.target.value })}
                              placeholder="e.g. NRTL"
                            />

                            <input
                              className="search-input"
                              type="date"
                              value={e.date_down}
                              onChange={(evt) => updateEvent(e._id, { date_down: evt.target.value })}
                            />

                            <input
                              className="search-input"
                              value={e.remarks}
                              onChange={(evt) => updateEvent(e._id, { remarks: evt.target.value })}
                              placeholder="Optional remarks"
                            />
                          </div>
                        )}
                      </td>

                      <td style={{ verticalAlign: 'top' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => removeEvent(e._id)}
                          disabled={events.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: 16, marginTop: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Random Preview Settings</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 180px',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Num Events</div>
                <input
                  className="search-input"
                  type="number"
                  min="1"
                  value={numEvents}
                  onChange={(e) => setNumEvents(e.target.value)}
                />
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Seed</div>
                <input
                  className="search-input"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16, marginTop: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Payload Preview</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(payloadPreview, null, 2)}
            </pre>
          </div>
        </>
      )}
    </main>
  );
}