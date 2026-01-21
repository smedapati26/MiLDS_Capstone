import client from './client';


export async function listScenarios() {
  const { data } = await client.get('/api/scenarios/');
  return data;
}


export async function createScenario(payload) {
  const resp = await client.post("/api/scenarios/", payload);
  return resp.data;
}
