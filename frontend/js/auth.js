// Authentication handling

export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

export function clearAuth() {
  localStorage.removeItem('authToken');
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

