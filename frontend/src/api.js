// src/api.js
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({ baseURL: API });

// Will be called with token (string) to attach Authorization header
export const setupApi = (token) => {
  // remove existing interceptor if any (simple approach: override default headers)
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};
