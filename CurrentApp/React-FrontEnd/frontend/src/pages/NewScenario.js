import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { listAircraft } from '../api/aircraft';
import { listPersonnel } from '../api/personnel';

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function NewScenario() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [aircraftRows, setAircraftRows] = useState([]);
  const [personnelRows, setPersonnelRows] = useState([]);

  const [events, setEvents] = useState(() => [
    {
      _id: makeId(),
      target: 'aircraft',      // 'aircraft' | 'personnel'
      aircraft_pk: '',
      user_id: '',
      status: '',
      rtl: '',
      remarks: '',
      date_down: '',           // "YYYY-MM-DD"
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Load aircraft/personnel for dropdowns
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // keep your CSRF bootstrap pattern consistent
        await client.get('/api/csrf/');

        const [a, p] = await Promise.all([listAircraft(), listPersonnel()]);

        if (!mounted) return;

        const aircraft = Array.isArray(a) ? a : (a?.results ?? []);
        const personnel = Array.isArray(p) ? p : (p?.results ?? []);

        setAircraftRows(aircraft);
        setPersonnelRows(personnel);
      } catch (e) {
        console.error(e);
        if (mounted) setErr('Failed to load aircraft/personnel for scenario builder.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const aircraftOptions = useMemo(() => {
    // Your backend model uses aircraft_pk as primary key
    // and your API list includes aircraft_pk. 
    return aircraftRows
      .map((a) => ({
        value: String(a.aircraft_pk ?? a.pk ?? ''),
        label: `${a.aircraft_pk ?? a.pk ?? '—'} · ${a.model_name ?? 'Unknown'} · ${a.current_unit ?? ''}`,
      }))
      .filter((o) => o.value);
  }, [aircraftRows]);

  const personnelOptions = useMemo(() => {
    // Soldier PK is user_id in your models. :contentReference[oaicite:5]{index=5}
    return personnelRows
      .map((s) => ({
        value: String(s.user_id ?? ''),
        label: `${s.user_id ?? '—'} · ${s.rank ?? ''} ${s.last_name ?? ''}, ${s.first_name ?? ''} · ${s.primary_mos ?? ''}`,
      }))
      .filter((o) => o.value);
  }, [personnelRows]);

  const updateEvent = (id, patch) => {
    setEvents((prev) => prev.map((e) => (e._id === id ? { ...e, ...patch } : e)));
  };

  const addEvent = () => {
    setEvents((prev) => [
      ...prev,
      {
        _id: makeId(),
        target: 'aircraft',
        aircraft_pk: '',
        user_id: '',
        status: '',
        rtl: '',
        remarks: '',
        date_down: '',
      },
    ]);
  };

  const removeEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const payloadPreview = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    const cleanedEvents = events.map((e) => {
      const base = {
        target: e.target,
        // IMPORTANT: Only one of these should be filled depending on target
        aircraft_pk: e.target === 'aircraft' ? (e.aircraft_pk || null) : null,
        user_id: e.target === 'personnel' ? (e.user_id || null) : null,
        status: e.status || '',
        rtl: e.rtl || '',
        remarks: e.remarks || '',
        date_down: e.date_down || null,
      };

      // remove empty strings to keep payload clean
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
      if (e.target === 'aircraft' && !e.aircraft_pk) return 'Each aircraft event must select an aircraft.';
      if (e.target === 'personnel' && !e.user_id) return 'Each personnel event must select a person.';
      if (!e.status && !e.rtl && !e.remarks && !e.date_down) {
        return 'Each event must change at least one field (status, rtl, remarks, or date_down).';
      }
    }
    return null;
  };

  const handleSave = async () => {
    // Step 1: UI only — we validate and show the payload.
    // Step 2 will be wiring this to a backend POST endpoint.
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setErr(null);

    // For now: show payload preview in console + alert.
    // When you add POST /api/scenarios/, replace this with client.post(...)
    console.log('Scenario create payload:', payloadPreview);
    alert('Scenario payload is ready (see console). Next step is wiring POST /api/scenarios/.');
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
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#FEF2F2', color: '#991B1B', fontWeight: 700 }}>
          {err}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 12 }}>Loading aircraft/personnel…</div>
      ) : (
        <>
          <div className="card" style={{ padding: 16, marginTop: 12 }}>
            <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>Scenario Name</span>
              <input
                className="search-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Night Maintenance Surge"
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>Description</span>
              <textarea
                className="search-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this scenario simulate?"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </label>
          </div>

          <div className="section-head" style={{ marginTop: 16 }}>
            <h3 className="section-title" style={{ fontSize: 18 }}>Events</h3>
            <div className="toolbar">
              <button className="btn btn-secondary" onClick={addEvent}>
                + Add Event
              </button>
            </div>
          </div>

          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 120 }}>Target</th>
                  <th>Aircraft / Person</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 120 }}>RTL</th>
                  <th>Date Down</th>
                  <th>Remarks</th>
                  <th style={{ width: 110 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {events.map((e) => {
                  const isAircraft = e.target === 'aircraft';
                  return (
                    <tr key={e._id}>
                      <td>
                        <select
                          className="search-input"
                          value={e.target}
                          onChange={(evt) => {
                            const nextTarget = evt.target.value;
                            updateEvent(e._id, {
                              target: nextTarget,
                              aircraft_pk: '',
                              user_id: '',
                            });
                          }}
                        >
                          <option value="aircraft">Aircraft</option>
                          <option value="personnel">Personnel</option>
                        </select>
                      </td>

                      <td>
                        {isAircraft ? (
                          <select
                            className="search-input"
                            value={e.aircraft_pk}
                            onChange={(evt) => updateEvent(e._id, { aircraft_pk: evt.target.value })}
                          >
                            <option value="">Select aircraft…</option>
                            {aircraftOptions.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        ) : (
                          <select
                            className="search-input"
                            value={e.user_id}
                            onChange={(evt) => updateEvent(e._id, { user_id: evt.target.value })}
                          >
                            <option value="">Select person…</option>
                            {personnelOptions.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td>
                        <input
                          className="search-input"
                          value={e.status}
                          onChange={(evt) => updateEvent(e._id, { status: evt.target.value })}
                          placeholder="e.g., NMC"
                        />
                      </td>

                      <td>
                        <input
                          className="search-input"
                          value={e.rtl}
                          onChange={(evt) => updateEvent(e._id, { rtl: evt.target.value })}
                          placeholder="e.g., NRTL"
                        />
                      </td>

                      <td>
                        <input
                          className="search-input"
                          type="date"
                          value={e.date_down}
                          onChange={(evt) => updateEvent(e._id, { date_down: evt.target.value })}
                        />
                      </td>

                      <td>
                        <input
                          className="search-input"
                          value={e.remarks}
                          onChange={(evt) => updateEvent(e._id, { remarks: evt.target.value })}
                          placeholder="Optional remarks"
                        />
                      </td>

                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => removeEvent(e._id)}
                          disabled={events.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ padding: 16, marginTop: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Payload Preview (what we’ll POST in Step 2)</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(payloadPreview, null, 2)}
            </pre>
          </div>
        </>
      )}
    </main>
  );
}
