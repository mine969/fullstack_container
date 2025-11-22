const API_URL = '/api';

export const api = {
  async register(name, email, password, role = 'customer') {
    const res = await fetch(`${API_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Login failed');
    }
    return res.json();
  },

  async getMenu() {
    const res = await fetch(`${API_URL}/menu/`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async createOrder(items, token, deliveryAddress, guestDetails = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const body = { 
      items, 
      delivery_address: deliveryAddress,
      ...guestDetails 
    };

    const res = await fetch(`${API_URL}/orders/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Order failed');
    }
    return res.json();
  },

  async getOrders(token) {
    const res = await fetch(`${API_URL}/orders/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async updateOrderStatus(orderId, status, token) {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },
};
