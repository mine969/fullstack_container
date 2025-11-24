const API_URL = 'http://localhost:8000';

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

  async getOrder(id) {
    const res = await fetch(`${API_URL}/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async getDrivers(token) {
    const res = await fetch(`${API_URL}/users/drivers`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch drivers');
    return res.json();
  },

  updateOrderStatus: async (orderId, status, token) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  assignDriver: async (orderId, driverId, token) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ driver_id: parseInt(driverId) }),
    });
    if (!res.ok) throw new Error('Failed to assign driver');
    return res.json();
  },

  createMenuItem: async (item, token) => {
    const res = await fetch(`${API_URL}/menu/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return res.json();
  },

  updateMenuItem: async (id, item, token) => {
    const res = await fetch(`${API_URL}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  deleteMenuItem: async (id, token) => {
    const res = await fetch(`${API_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
    return res.json();
  },
};
