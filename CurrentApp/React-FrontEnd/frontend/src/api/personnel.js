import client from './client';

// GET /api/personnel/
export async function listPersonnel(params = {}) {
  const res = await client.get('/api/personnel/', { params });
  return res.data;
}

export async function createPersonnel(payload) {
  const res = await client.post('/api/personnel/', payload);
  return res.data;
}

export async function updatePersonnel(id, payload) {
  const res = await client.patch(`/api/personnel/${id}/`, payload);
  return res.data;
}
