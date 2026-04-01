import { getApiUrl } from './api';

export const userApi = {
  async verify(firebaseUid, email, role, name) {
    const res = await fetch(`${getApiUrl()}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseUid, email, role, name })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'API error');
    }
    return res.json();
  },

  async getMe(firebaseUid, token) {
    const res = await fetch(`${getApiUrl()}/auth/me?firebaseUid=${firebaseUid}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'API error');
    }
    return res.json();
  },

  async updateRole(firebaseUid, role, token) {
    const res = await fetch(`${getApiUrl()}/auth/role`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ firebaseUid, role })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'API error');
    }
    return res.json();
  },

  async updateName(firebaseUid, name, token) {
    const res = await fetch(`${getApiUrl()}/auth/name`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ firebaseUid, name })
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'API error');
    }
    return res.json();
  }
};
