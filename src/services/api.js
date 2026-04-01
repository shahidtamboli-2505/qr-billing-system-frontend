import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  // This provides a clear error during development if the .env variable is missing.
  console.error("VITE_BACKEND_URL is not defined. Please check your .env file.");
}

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;