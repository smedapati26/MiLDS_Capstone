import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // allows cookies to flow (needed for session auth)
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  timeout: 15000,
});

export default api;