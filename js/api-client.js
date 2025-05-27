// API Client for Veterans Claims Portal
const BASE_URL = '/.netlify/functions';

export async function submitClaim(claimData) {
  const response = await fetch(`${BASE_URL}/claims/submitClaim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(claimData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit claim');
  }
  
  return response.json();
}

export async function getClaims(token) {
  const response = await fetch(`${BASE_URL}/claims/getClaims`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch claims');
  }
  
  return response.json();
}

export async function updateStatus(claimId, status, note, token) {
  const response = await fetch(`${BASE_URL}/claims/updateStatus`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      claimId,
      status,
      note
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update status');
  }

  return response.json();
}

export async function login(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Authentication failed');
  }
  
  const data = await response.json();
  localStorage.setItem('authToken', data.token);
  return data;
}

export async function uploadFile(file, claimId, category) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('claimId', claimId);
  formData.append('category', category);
  
  const response = await fetch(`${BASE_URL}/files/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('File upload failed');
  }
  
  return response.json();
}

export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function clearAuthToken() {
  localStorage.removeItem('authToken');
}

// Helper function for handling API errors
export function handleApiError(error) {
  console.error('API Error:', error);
  throw new Error(error.message || 'An error occurred');
}
