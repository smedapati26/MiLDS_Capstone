import client from './client';

export async function listScenarios() {
  const { data } = await client.get('/api/scenarios/');
  return data;
}
