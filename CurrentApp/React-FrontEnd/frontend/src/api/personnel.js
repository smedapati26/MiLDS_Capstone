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

// ✅ NEW: POST /api/personnel/sync/{uic}  (Django-Ninja route)
export async function syncPersonnel(uic) {
  const clean = String(uic || '').trim();
  if (!clean) throw new Error('UIC is required');

  // Your Ninja router defines: @router.post("/sync/{uic}") :contentReference[oaicite:3]{index=3}
  const res = await client.post(`/api/personnel/sync/${encodeURIComponent(clean)}`);
  return res.data;
}
