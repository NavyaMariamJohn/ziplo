/**
 * @file api.js
 * @description Utility module: api. Provides helper functions used throughout the application.
 */

// 🌐 ROOT_URL: Used for generating short links (e.g., https://ziplo.in)
export const ROOT_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api$/, "").replace(/\/$/, "");

// 🛠️ API: Used for data-fetching (e.g., https://ziplo.in/api)
export const API = `${ROOT_URL}/api`;

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle Unauthorized (401)
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  // Handle No Content (204)
  if (response.status === 204) {
    return null;
  }

  // Standard JSON extraction and Error handling
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
};

export default API;