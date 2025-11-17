// API communication functions

const API_BASE_URL = 'http://localhost:3000/api';

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Auth API
export async function login(username, password) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

// Match API
export async function getActiveMatch() {
  return apiCall('/match/active');
}

export async function getMatch(matchId) {
  return apiCall(`/match/${matchId}`);
}

export async function createMatch(matchData) {
  return apiCall('/match/create', {
    method: 'POST',
    body: JSON.stringify(matchData)
  });
}

export async function startMatch(matchId) {
  return apiCall(`/match/${matchId}/start`, {
    method: 'POST'
  });
}

export async function recordBall(matchId, ballData) {
  return apiCall(`/match/${matchId}/ball`, {
    method: 'POST',
    body: JSON.stringify(ballData)
  });
}

export async function endInnings(matchId) {
  return apiCall(`/match/${matchId}/end-innings`, {
    method: 'POST'
  });
}

export async function endMatch(matchId, result) {
  return apiCall(`/match/${matchId}/end-match`, {
    method: 'POST',
    body: JSON.stringify({ result })
  });
}

