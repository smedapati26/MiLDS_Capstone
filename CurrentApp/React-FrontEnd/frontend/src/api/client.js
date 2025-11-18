import axios from 'axios';

const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

const client = axios.create({
  baseURL,                 // e.g., http://localhost:8000
  withCredentials: true,   // include cookies for session/CSRF
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  timeout: 15000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API error:', err?.response?.status, err?.response?.data || err?.message);
    return Promise.reject(err);
  }
);

export default client;
