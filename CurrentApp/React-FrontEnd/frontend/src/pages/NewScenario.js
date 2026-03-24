import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { listAircraft } from '../api/aircraft';
import { listPersonnel } from '../api/personnel';
import { createScenario, previewRandomScenario } from '../api/scenarios';

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

function makeEmptyPersonnelEvent() {
  return {
    _id: makeId(),
    user_id: '',
    rank: '',
    primary_mos: '',
    current_unit: '',
    is_maintainer: '',
    simulated_casualty: '',
  };
}

export default function NewScenario() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [aircraftRows, setAircraftRows] = useState([]);
  const [personnelRows, setPersonnelRows] = useState([]);

  const [events, setEvents] = useState([]);
  const [personnelEvents, setPersonnelEvents] = useState([]);

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
        value: String(a.serial ?? ''),
        label: `${a.serial ?? '—'} · ${a.model_name ?? 'Unknown'} · ${a.current_unit ?? ''}`,
      }))
      .filter((o) => o.value);
  }, [aircraftRows]);

  const personnelOptions = useMemo(() => {
    return personnelRows
      .map((p) => ({
        value: String(p.user_id ?? ''),
        label: `${p.last_name ?? '—'}, ${p.first_name ?? ''} · ${p.rank ?? ''} · ${p.primary_mos ?? ''}`,
      }))
      .filter((o) => o.value);
  }, [personnelRows]);

  const updateEvent = (id, patch) => {
    setEvents((prev) => prev.map((e) => (e._id === id ? { ...e, ...patch } : e)));
  };

  const addEvent = () => {
    setEvents((prev) => [...prev, makeEmptyEvent()]);
  };

  const removeEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const addPersonnelEvent = () => {
    setPersonnelEvents((prev) => [...prev, makeEmptyPersonnelEvent()]);
  };

  const updatePersonnelEvent = (id, patch) => {
    setPersonnelEvents((prev) =>
      prev.map((e) => (e._id === id ? { ...e, ...patch } : e))
    );
  };

  const removePersonnelEvent = (id) => {
    setPersonnelEvents((prev) => prev.filter((e) => e._id !== id));
  };

  const payloadPreview = useMemo(() => {
    const aircraftPayload = events.map((e) => {
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

    const personnelPayload = personnelEvents.map((e) => {
      const base = {
        target: 'personnel',
        user_id: e.user_id || null,
        rank: e.rank || '',
        primary_mos: e.primary_mos || '',
        current_unit: e.current_unit || '',
        simulated_casualty: e.simulated_casualty || '',
      };

      if (e.is_maintainer !== '') {
        base.is_maintainer = e.is_maintainer === 'true';
      }

      Object.keys(base).forEach((k) => {
        if (base[k] === '' || base[k] === undefined) delete base[k];
      });

      return base;
    });

    return {
      name: name.trim(),
      description: description.trim(),
      events: [...aircraftPayload, ...personnelPayload],
    };
  }, [name, description, events, personnelEvents]);

  const validate = () => {
    const totalEvents = events.length + personnelEvents.length;

    if (!name.trim()) return 'Scenario name is required.';
    if (totalEvents === 0) return 'Add at least one aircraft or personnel event.';

    for (const e of events) {
      if (!e.aircraft_pk) return 'Each aircraft event must select an aircraft.';
      if (!e.status && !e.rtl && !e.remarks && !e.date_down) {
        return 'Each aircraft event must change at least one field (status, rtl, remarks, or date_down).';
      }
    }

    for (const e of personnelEvents) {
      if (!e.user_id) return 'Each personnel event must select a soldier.';
      if (
        !e.rank &&
        !e.primary_mos &&
        !e.current_unit &&
        e.is_maintainer === '' &&
        !e.simulated_casualty
      ) {
        return 'Each personnel event must change at least one field (rank, primary MOS, unit, role, or casualty status).';
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

      const nextAircraftEvents = (preview.events || [])
        .filter((ev) => (ev.target || 'aircraft') === 'aircraft')
        .map((ev) => ({
          _id: makeId(),
          aircraft_pk: String(ev.aircraft_pk ?? ''),
          status: ev.status ?? '',
          rtl: ev.rtl ?? '',
          remarks: ev.remarks ?? '',
          date_down: ev.date_down ?? '',
        }));

      setEvents(nextAircraftEvents);
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
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#FEF2F2', color: '#991B1B', fontWeight: 700 }}>
          {err}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 12 }}>Loading scenario builder…</div>
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
                {events.length === 0 ? null : events.map((e) => (
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
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-head" style={{ marginTop: 16 }}>
            <h3 className="section-title" style={{ fontSize: 18 }}>Personnel Events</h3>
            <div className="toolbar">
              <button className="btn btn-secondary" onClick={addPersonnelEvent}>
                + Add Personnel Event
              </button>
            </div>
          </div>

          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Soldier</th>
                  <th>Rank</th>
                  <th>MOS</th>
                  <th>Unit</th>
                  <th>Role</th>
                  <th>Casualty</th>
                  <th style={{ width: 110 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {personnelEvents.length === 0 ? null : personnelEvents.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <select
                        className="search-input"
                        value={e.user_id}
                        onChange={(evt) => updatePersonnelEvent(e._id, { user_id: evt.target.value })}
                      >
                        <option value="">Select soldier…</option>
                        {personnelOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <input
                        className="search-input"
                        value={e.rank}
                        onChange={(evt) => updatePersonnelEvent(e._id, { rank: evt.target.value })}
                        placeholder="e.g., CPT"
                      />
                    </td>

                    <td>
                      <input
                        className="search-input"
                        value={e.primary_mos}
                        onChange={(evt) => updatePersonnelEvent(e._id, { primary_mos: evt.target.value })}
                        placeholder="e.g., 15T"
                      />
                    </td>

                    <td>
                      <input
                        className="search-input"
                        value={e.current_unit}
                        onChange={(evt) => updatePersonnelEvent(e._id, { current_unit: evt.target.value })}
                        placeholder="e.g., WDDRA0"
                      />
                    </td>

                    <td>
                      <select
                        className="search-input"
                        value={e.is_maintainer}
                        onChange={(evt) => updatePersonnelEvent(e._id, { is_maintainer: evt.target.value })}
                      >
                        <option value="">—</option>
                        <option value="true">Maintainer</option>
                        <option value="false">Other</option>
                      </select>
                    </td>

                    <td>
                      <select
                        className="search-input"
                        value={e.simulated_casualty}
                        onChange={(evt) => updatePersonnelEvent(e._id, { simulated_casualty: evt.target.value })}
                      >
                        <option value="">—</option>
                        <option value="SimulatedInjury">Simulated Injury</option>
                        <option value="SimulatedKIA">Simulated KIA</option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => removePersonnelEvent(e._id)}
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