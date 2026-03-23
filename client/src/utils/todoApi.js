import { getApiUrl } from './api';

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export const todoApi = {
  async getAll(token) {
    const res = await fetch(`${getApiUrl()}/todos`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.json();
  },

  async create(todo, token) {
    const res = await fetch(`${getApiUrl()}/todos`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todo)
    });
    return res.json();
  },

  async update(id, update, token) {
    const res = await fetch(`${getApiUrl()}/todos/${id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(update)
    });
    return res.json();
  },

  async delete(id, token) {
    const res = await fetch(`${getApiUrl()}/todos/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.json();
  }
};

export const adminApi = {
  async getAllTodos(token) {
    const res = await fetch(`${getApiUrl()}/admin/todos`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.json();
  },

  async getAllUsers(token) {
    const res = await fetch(`${getApiUrl()}/admin/users`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.json();
  },

  async deleteTodo(id, token) {
    const res = await fetch(`${getApiUrl()}/admin/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.json();
  },

  async restoreTodo(id, token) {
    const res = await fetch(`${getApiUrl()}/admin/${id}/restore`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return res.json();
  }
};
