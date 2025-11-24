'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Menu Form State
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Main' });
  
  // Staff Registration State
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'kitchen' });

  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin-portal');
      return;
    }
    try {
      const userData = await api.getMe(token);
      setUser(userData);
      if (userData.role !== 'admin' && userData.role !== 'manager') {
        router.push('/menu');
      } else {
        loadData(token, userData.role);
      }
    } catch (err) {
      router.push('/admin-portal');
    }
  };

  const loadData = async (token, role) => {
    try {
      const ordersData = await api.getOrders(token);
      setOrders(ordersData);
      
      if (role === 'admin') {
         const menuData = await api.getMenu();
         setMenuItems(menuData);
         const driversData = await api.getDrivers(token);
         setDrivers(driversData);
      } else if (role === 'manager') {
         const driversData = await api.getDrivers(token);
         setDrivers(driversData);
      }
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    await api.updateOrderStatus(orderId, status, token);
    loadData(token, user.role);
  };

  const assignDriver = async (orderId, driverId) => {
    const token = localStorage.getItem('token');
    await api.assignDriver(orderId, driverId, token);
    loadData(token, user.role);
  };

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await api.createMenuItem(newItem, token);
    setNewItem({ name: '', description: '', price: '', category: 'Main' });
    loadData(token, user.role);
    alert('Item added!');
  };

  const handleDeleteMenuItem = async (id) => {
    if(!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    await api.deleteMenuItem(id, token);
    loadData(token, user.role);
  };

  const handleRegisterStaff = async (e) => {
    e.preventDefault();
    try {
      await api.register(newStaff.name, newStaff.email, newStaff.password, newStaff.role);
      alert('Staff registered successfully');
      setNewStaff({ name: '', email: '', password: '', role: 'kitchen' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brown-900 font-display text-2xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-100 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
             <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="text-2xl font-display text-primary tracking-wider transform rotate-[-2deg]">DASHBOARD</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-brown-900 font-bold">Hello, {user?.name} ({user?.role})</span>
              <button
                onClick={() => { localStorage.removeItem('token'); router.push('/admin-portal'); }}
                className="text-sm text-red-600 hover:text-red-800 font-bold"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {['orders', 'menu', 'reports', 'staff'].map((tab) => (
            (tab === 'orders' || user?.role === 'admin') && (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-bold uppercase tracking-wide transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white shadow-lg transform scale-105'
                    : 'bg-white text-brown-900 hover:bg-cream-100'
                }`}
              >
                {tab}
              </button>
            )
          ))}
        </div>

        {/* Content */}
        <div className="card p-6 min-h-[500px]">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-display text-brown-900 mb-6">Active Orders</h2>
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-cream-50 p-6 rounded-xl border border-cream-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-display text-2xl text-brown-900">#{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cooking' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-brown-800 font-medium">{order.guest_name || 'Customer'}</p>
                      <p className="text-sm text-brown-600">{new Date(order.created_at).toLocaleString()}</p>
                      <div className="mt-2 text-sm text-brown-700">
                        {order.items.map((item, i) => (
                            <span key={i} className="block">• {item.menu_item.name} x{item.quantity}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {order.status === 'pending' && (
                        <button onClick={() => updateStatus(order.id, 'cooking')} className="btn-primary text-sm">
                          Accept & Cook
                        </button>
                      )}
                      {order.status === 'cooking' && (
                        <button onClick={() => updateStatus(order.id, 'ready')} className="btn-primary text-sm bg-green-600 hover:bg-green-700">
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && !order.driver_id && (
                        <div className="flex gap-2">
                            <select 
                                className="p-2 border rounded text-brown-900"
                                onChange={(e) => assignDriver(order.id, e.target.value)}
                                defaultValue=""
                            >
                                <option value="" disabled>Assign Driver</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                      )}
                      {order.driver_id && (
                          <span className="text-sm font-bold text-blue-600">Driver Assigned</span>
                      )}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-center text-brown-500 italic">No active orders</p>}
              </div>
            </div>
          )}

          {activeTab === 'menu' && user?.role === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-cream-50 p-6 rounded-xl h-fit">
                <h3 className="text-xl font-display text-brown-900 mb-4">Add New Item</h3>
                <form onSubmit={handleCreateMenuItem} className="space-y-4">
                  <input type="text" placeholder="Name" className="w-full p-3 rounded-lg border border-cream-200" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                  <textarea placeholder="Description" className="w-full p-3 rounded-lg border border-cream-200" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                  <input type="number" step="0.01" placeholder="Price" className="w-full p-3 rounded-lg border border-cream-200" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                  <select className="w-full p-3 rounded-lg border border-cream-200" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    <option value="Main">Main</option>
                    <option value="Side">Side</option>
                    <option value="Drink">Drink</option>
                  </select>
                  <button type="submit" className="w-full btn-primary">Add Item</button>
                </form>
              </div>
              
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white border border-cream-200 p-4 rounded-xl flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-brown-900">{item.name}</h4>
                      <p className="text-sm text-brown-600">${item.price}</p>
                    </div>
                    <button onClick={() => handleDeleteMenuItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && user?.role === 'admin' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                    <h3 className="text-blue-900 font-bold uppercase text-sm mb-2">Total Orders</h3>
                    <p className="text-4xl font-display text-blue-600">{orders.length}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                    <h3 className="text-green-900 font-bold uppercase text-sm mb-2">Completed</h3>
                    <p className="text-4xl font-display text-green-600">{orders.filter(o => o.status === 'delivered').length}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 text-center">
                    <h3 className="text-orange-900 font-bold uppercase text-sm mb-2">Pending</h3>
                    <p className="text-4xl font-display text-orange-600">{orders.filter(o => o.status !== 'delivered').length}</p>
                </div>
            </div>
          )}

          {activeTab === 'staff' && user?.role === 'admin' && (
             <div className="max-w-md mx-auto bg-cream-50 p-8 rounded-xl">
                <h3 className="text-2xl font-display text-brown-900 mb-6 text-center">Register New Staff</h3>
                <form onSubmit={handleRegisterStaff} className="space-y-4">
                  <input type="text" placeholder="Name" className="w-full p-3 rounded-lg border border-cream-200" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
                  <input type="email" placeholder="Email" className="w-full p-3 rounded-lg border border-cream-200" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} required />
                  <input type="password" placeholder="Password" className="w-full p-3 rounded-lg border border-cream-200" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} required />
                  <select className="w-full p-3 rounded-lg border border-cream-200" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" className="w-full btn-primary">Register Staff</button>
                </form>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
