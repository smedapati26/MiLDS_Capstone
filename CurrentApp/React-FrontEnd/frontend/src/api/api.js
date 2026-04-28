import axios from "axios";

const api = axios.create({
  baseURL: "http://10.211.125.246:8000",
  withCredentials: true, // allows cookies to flow (needed for session auth)
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  timeout: 15000,
});

export default api;