
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

