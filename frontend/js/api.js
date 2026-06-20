/**
 * api.js — API client for communicating with the TrailScope FastAPI backend.
 */

// Retrieve backend URL from localStorage, or default to http://localhost:8000
export const getBackendUrl = () => {
  return localStorage.getItem('TRAILSCOPE_BACKEND_URL')
    || 'https://trailscope-backend.onrender.com';
};

// Set and save backend URL in localStorage
export const setBackendUrl = (url) => {
  let cleanUrl = url.trim();
  if (cleanUrl.endsWith('/')) {
    cleanUrl = cleanUrl.slice(0, -1);
  }
  localStorage.setItem('TRAILSCOPE_BACKEND_URL', cleanUrl);
};

/**
 * Helper function for unified fetch requests.
 */
async function request(endpoint) {
  const backendUrl = getBackendUrl();
  const url = `${backendUrl}${endpoint}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error fetching ${url}:`, error);
    throw error;
  }
}

/**
 * Fetch backend system health status.
 */
export async function fetchHealth() {
  return await request('/api/health');
}

/**
 * Fetch ML evaluation metrics from backend.
 */
export async function fetchModelMetrics() {
  return await request('/api/metrics');
}

/**
 * Fetch all risk-scored accounts.
 * Defaults to sorting by riskScore descending.
 */
export async function fetchAccounts(sort = 'riskScore', order = 'desc') {
  return await request(`/api/accounts?sort=${sort}&order=${order}`);
}

/**
 * Fetch a single risk-scored account.
 */
export async function fetchAccountDetails(accountId) {
  return await request(`/api/accounts/${accountId}`);
}

/**
 * Fetch precomputed highlighted fraud rings.
 */
export async function fetchRings() {
  return await request('/api/rings');
}

/**
 * Fetch the network subgraph centered on a specific account ID (1-hop neighbors).
 */
export async function fetchSubgraph(accountId) {
  return await request(`/api/graph/${accountId}`);
}
