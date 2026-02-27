import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { listAircraft } from '../api/aircraft';
import { createScenario } from '../api/scenarios';


function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function makeEmptyEvent() {
  return {
    _id: makeId(),
    aircraft_pk: '',
    status: '',
    rtl: '',
    remarks: '',
    date_down: '',
  };
}

export default function NewScenario() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [aircraftRows, setAircraftRows] = useState([]);
  const [events, setEvents] = useState(() => [makeEmptyEvent()]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        await client.get('/api/csrf/');

        const a = await listAircraft();
        if (!mounted) return;

        const aircraft = Array.isArray(a) ? a : (a?.results ?? []);
        setAircraftRows(aircraft);
      } catch (e) {
        console.error(e);
        if (mounted) setErr('Failed to load aircraft for scenario builder.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const aircraftOptions = useMemo(() => {
    return aircraftRows
      .map((a) => ({
        value: String(a.aircraft_pk ?? a.pk ?? ''),
        label: `${a.aircraft_pk ?? a.pk ?? '—'} · ${a.model_name ?? 'Unknown'} · ${a.current_unit ?? ''}`,
      }))
      .filter((o) => o.value);
  }, [aircraftRows]);

  const updateEvent = (id, patch) => {
    setEvents((prev) => prev.map((e) => (e._id === id ? { ...e, ...patch } : e)));
  };

  const addEvent = () => {
    setEvents((prev) => [...prev, makeEmptyEvent()]);
  };

  const removeEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const payloadPreview = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    const cleanedEvents = events.map((e) => {
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
      if (!e.aircraft_pk) return 'Each event must select an aircraft.';
      if (!e.status && !e.rtl && !e.remarks && !e.date_down) {
        return 'Each event must change at least one field (status, rtl, remarks, or date_down).';
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
        <div style={{ marginTop: 12 }}>Loading aircraft…</div>
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
            <h3 className="section-title" style={{ fontSize: 18 }}>Aircraft Events</h3>
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
                  <th>Aircraft</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 120 }}>RTL</th>
                  <th>Date Down</th>
                  <th>Remarks</th>
                  <th style={{ width: 110 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {events.map((e) => (
                  <tr key={e._id}>
                    <td>
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
                ))}
              </tbody>
            </table>
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
