
import client from './client';

// GET /api/aircraft/
export async function listAircraft(params = {}) {
  const res = await client.get('/api/aircraft/', { params });
  return res.data;
}

// POST /api/aircraft/
export async function createAircraft(payload) {
  const res = await client.post('/api/aircraft/', payload);
  return res.data;
}

// PATCH /api/aircraft/:id/
export async function updateAircraft(id, payload) {
  const res = await client.patch(`/api/aircraft/${id}/`, payload);
  return res.data;
}



export async function syncAircraft(uic) {
  const clean = String(uic || '').trim();
  if (!clean) throw new Error('UIC is required');

  // Ninja route: @router.post("/sync/unit/{uic}") :contentReference[oaicite:4]{index=4}
  const res = await client.post(`/api/aircraft/sync/unit/${encodeURIComponent(clean)}`);
  return res.data;
}

export async function injectAircraftUpdate(aircraft_pk, field, value) {
  const params = {
    aircraft_pk: Number(aircraft_pk),
    field: String(field || '').trim(),
    value: value === null || value === undefined ? '' : String(value),
  };
  if (!params.aircraft_pk) throw new Error('aircraft_pk is required');
  if (!params.field) throw new Error('field is required');

  const res = await client.post('/api/aircraft/inject/update', null, { params });
  return res.data;
}


export async function pushAircraft(uic) {
  const clean = String(uic || '').trim();
  if (!clean) throw new Error('UIC is required');

  const res = await client.post(`/api/aircraft/push/unit/${encodeURIComponent(clean)}`);
  return res.data;
}


