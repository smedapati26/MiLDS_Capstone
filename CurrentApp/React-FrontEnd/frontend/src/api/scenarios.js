import client from './client';


export async function listScenarios() {
  const { data } = await client.get('/api/scenarios/');
  return data;
}


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

export async function createScenario(payload) {
  const csrfToken = getCookie('csrftoken');

  const resp = await client.post('/api/scenarios/', payload, {
    headers: {
      'X-CSRFToken': csrfToken,
    },
  });

  return resp.data;
}
export async function listScenarioRuns(limit = 50) {
  const { data } = await client.get('/api/scenario-runs/', { params: { limit } });
  return data;
}

export async function getScenarioRunLogs(runId) {
  const { data } = await client.get(`/api/scenario-runs/${runId}/logs/`);
  return data;
}
