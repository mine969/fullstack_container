'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // Staff Registration State
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'driver' });
  const [regMessage, setRegMessage] = useState('');

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    checkUser(token);
  }, []);

  const checkUser = async (token) => {
    try {
      const userData = await api.getMe(token);
      if (userData.role !== 'admin' && userData.role !== 'manager') {
        router.push('/login'); // Restrict access
        return;
      }
      setUser(userData);
      loadOrders(token);
    } catch (err) {
      router.push('/login');
    }
  };

  const loadOrders = async (token) => {
    try {
      const data = await api.getOrders(token);
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      await api.updateOrderStatus(orderId, status, token);
      loadOrders(token);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegMessage('');
    try {
      await api.register(newStaff.name, newStaff.email, newStaff.password, newStaff.role);
      setRegMessage('Staff registered successfully!');
      setNewStaff({ name: '', email: '', password: '', role: 'driver' });
    } catch (err) {
      setRegMessage('Error: ' + err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Kitchen Dashboard'}
          </h1>
          <button onClick={() => { localStorage.removeItem('token'); router.push('/'); }} className="text-red-600 hover:underline">
            Logout
          </button>
        </div>

        {/* Admin Only: Staff Registration */}
        {user?.role === 'admin' && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Register New Staff</h2>
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Name"
                required
                className="p-2 border rounded text-black"
                value={newStaff.name}
                onChange={e => setNewStaff({...newStaff, name: e.target.value})}
              />
              <input
                type="email"
                placeholder="Email"
                required
                className="p-2 border rounded text-black"
                value={newStaff.email}
                onChange={e => setNewStaff({...newStaff, email: e.target.value})}
              />
              <input
                type="password"
                placeholder="Password"
                required
                className="p-2 border rounded text-black"
                value={newStaff.password}
                onChange={e => setNewStaff({...newStaff, password: e.target.value})}
              />
              <select
                className="p-2 border rounded text-black"
                value={newStaff.role}
                onChange={e => setNewStaff({...newStaff, role: e.target.value})}
              >
                <option value="driver">Driver</option>
                <option value="manager">Kitchen Staff</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="bg-blue-600 text-white rounded hover:bg-blue-700">
                Register
              </button>
            </form>
            {regMessage && <p className="mt-2 text-sm text-green-600">{regMessage}</p>}
          </div>
        )}

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Active Orders</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest/User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.guest_name ? `${order.guest_name} (Guest)` : `User #${order.customer_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'cooking' ? 'bg-orange-100 text-orange-800' :
                      order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => updateStatus(order.id, 'cooking')} className="text-orange-600 hover:text-orange-900">Cooking</button>
                    <button onClick={() => updateStatus(order.id, 'ready')} className="text-blue-600 hover:text-blue-900">Ready</button>
                    <button onClick={() => updateStatus(order.id, 'delivered')} className="text-green-600 hover:text-green-900">Delivered</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="p-6 text-center text-gray-500">No active orders found.</div>}
        </div>
      </div>
    </div>
  );
}
