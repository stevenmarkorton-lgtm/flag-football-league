// src/api.js
export const API_URL = import.meta.env.VITE_API_URL;

// helper for fetch calls
export async function fetchFromAPI(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

