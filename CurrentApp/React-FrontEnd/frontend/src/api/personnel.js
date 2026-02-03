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


export async function injectPersonnelUpdate(user_id, field, value) {
  const params = {
    user_id: String(user_id || '').trim(),
    field: String(field || '').trim(),
    value: value === null || value === undefined ? '' : String(value),
  };

  if (!params.user_id) throw new Error('user_id is required');
  if (!params.field) throw new Error('field is required');

  // axios: third arg is config; sending null body with query params
  const res = await client.post('/api/personnel/inject/update', null, { params });
  return res.data;
}
