import client from './client';

// --- STANDARD CRUD (The Missing Code) ---

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

// --- NEW INTEGRATION FUNCTIONS ---

// POST /api/aircraft/sync/{uic}
export async function syncAircraft(uic) {
  const clean = String(uic || '').trim();
  if (!clean) throw new Error('UIC is required');

  const res = await client.post(`/api/aircraft/sync/${encodeURIComponent(clean)}`);
  return res.data;
}

// POST /api/aircraft/inject/update
export async function injectAircraftUpdate(id, field, value) {
  const res = await client.post(`/api/aircraft/inject/update`, null, {
    params: {
      aircraft_pk: id,
      field: field,
      value: value
    }
  });
  return res.data;
}

// POST /api/aircraft/inject/nmc
export async function injectAircraftNMC(id) {
  const res = await client.post(`/api/aircraft/inject/nmc`, null, {
    params: { aircraft_pk: id }
  });
  return res.data;
}