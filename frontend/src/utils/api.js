/**
 * @file api.js
 * @description Utility module: api. Provides helper functions used throughout the application.
 */

export const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
export const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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