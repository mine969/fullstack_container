'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Main' });
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'kitchen' });
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [users, setUsers] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      // Only admin/manager can access this page
      if (userData.role !== 'admin') {
        router.push('/staff');
        return;
      }
      
      loadData(token);
    } catch (err) {
      router.push('/admin-portal');
    }
  };

  const loadData = async (token) => {
    try {
      const [ordersData, menuData, driversData, usersData] = await Promise.all([
        api.getOrders(token),
        api.getMenu(),
        api.getDrivers(token),
        api.getUsers(token)
      ]);
      setOrders(ordersData);
      setMenuItems(menuData);
      setDrivers(driversData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    await api.updateOrderStatus(orderId, status, token);
    loadData(token);
  };

  const assignDriver = async (orderId, driverId) => {
    const token = localStorage.getItem('token');
    await api.assignDriver(orderId, driverId, token);
    loadData(token);
  };

  const [editingId, setEditingId] = useState(null);

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingId) {
        await api.updateMenuItem(editingId, newItem, token);
        alert('Item updated!');
        setEditingId(null);
      } else {
        await api.createMenuItem(newItem, token);
        alert('Item added!');
      }
      setNewItem({ name: '', description: '', price: '', category: 'Main' });
      loadData(token);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewItem({ name: '', description: '', price: '', category: 'Main' });
  };

  const handleDeleteMenuItem = async (id) => {
    if(!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    try {
      await api.deleteMenuItem(id, token);
      loadData(token);
    } catch (err) {
      if (err.message === 'Session expired') {
        localStorage.removeItem('token');
        router.push('/admin-portal');
        return;
      }
      alert(err.message);
    }
  };

  const handleRegisterStaff = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (editingStaffId) {
        // Update existing user
        const updateData = { ...newStaff };
        if (!updateData.password) delete updateData.password; // Don't send empty password
        
        await api.updateUser(editingStaffId, updateData, token);
        alert('Staff updated successfully');
        setEditingStaffId(null);
      } else {
        // Register new user
        await api.register(newStaff.name, newStaff.email, newStaff.password, newStaff.role);
        alert('Staff registered successfully');
      }
      setNewStaff({ name: '', email: '', password: '', role: 'kitchen' });
      loadData(token);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditStaff = (user) => {
    setEditingStaffId(user.id);
    setNewStaff({ name: user.name, email: user.email, password: '', role: user.role });
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('token');
    try {
      await api.deleteUser(id, token);
      loadData(token);
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Total Price', 'Status'];
    const rows = orders.map(order => [
      order.id,
      new Date(order.created_at).toLocaleString(),
      order.guest_name || 'Customer',
      order.items.map(i => `${i.menu_item.name} x${i.quantity}`).join('; '),
      order.items.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0).toFixed(2),
      order.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (!confirm(`Are you sure you want to delete "${categoryToDelete}"? Items in this category will be moved to "Main".`)) return;
    
    const token = localStorage.getItem('token');
    try {
      // Find all items in this category
      const itemsToUpdate = menuItems.filter(item => item.category === categoryToDelete);
      
      // Update them to 'Main'
      await Promise.all(itemsToUpdate.map(item => 
        api.updateMenuItem(item.id, { ...item, category: 'Main' }, token)
      ));
      
      alert(`Category "${categoryToDelete}" deleted. Items moved to Main.`);
      loadData(token);
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brown-900 font-display text-2xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-100 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="text-2xl font-display text-primary tracking-wider transform rotate-[-2deg]">ADMIN DASHBOARD</span>
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
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          {['orders', 'menu', 'staff', 'reports'].map((tab) => (
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
          ))}
        </div>

        <div className="card p-6 min-h-[500px]">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-display text-brown-900 mb-6">Manage Orders</h2>
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
                {orders.length === 0 && <p className="text-center text-brown-500 italic">No orders</p>}
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-cream-50 p-6 rounded-xl h-fit">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-display text-brown-900">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                  <button 
                    onClick={() => setShowCategoryModal(true)}
                    className="text-xs bg-brown-200 text-brown-800 px-2 py-1 rounded hover:bg-brown-300 font-bold"
                  >
                    Manage Categories
                  </button>
                </div>
                <form onSubmit={handleCreateMenuItem} className="space-y-4">
                  <input type="text" placeholder="Name" className="w-full p-3 rounded-lg border border-cream-200" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
                  <textarea placeholder="Description" className="w-full p-3 rounded-lg border border-cream-200" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                  <input type="number" step="0.01" placeholder="Price" className="w-full p-3 rounded-lg border border-cream-200" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brown-700">Image</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Image URL" 
                        className="flex-1 p-3 rounded-lg border border-cream-200" 
                        value={newItem.image_url || ''} 
                        onChange={e => setNewItem({...newItem, image_url: e.target.value})} 
                      />
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            try {
                              const res = await api.uploadImage(file);
                              setNewItem(prev => ({ ...prev, image_url: res.url }));
                            } catch (err) {
                              alert('Upload failed: ' + err.message);
                            }
                          }}
                        />
                        <button type="button" className="bg-brown-200 text-brown-800 px-4 py-3 rounded-lg font-bold hover:bg-brown-300 transition">
                          Upload
                        </button>
                      </div>
                    </div>
                    {newItem.image_url && (
                      <div className="relative w-full bg-cream-100 rounded-lg overflow-hidden">
                         <Image 
                           src={newItem.image_url} 
                           alt="Preview" 
                           width={0}
                           height={0}
                           sizes="100vw"
                           style={{ width: '100%', height: 'auto' }}
                           unoptimized 
                         />
                      </div>
                    )}
                  </div>



                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brown-700">Category</label>
                    <select 
                      className="w-full p-3 rounded-lg border border-cream-200" 
                      value={isCustomCategory ? 'custom' : newItem.category} 
                      onChange={e => {
                        if (e.target.value === 'custom') {
                          setIsCustomCategory(true);
                          setNewItem({...newItem, category: ''});
                        } else {
                          setIsCustomCategory(false);
                          setNewItem({...newItem, category: e.target.value});
                        }
                      }}
                    >
                      {[...new Set(['Main', 'Side', 'Drink', ...menuItems.map(i => i.category)])].sort().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">+ Create New Category</option>
                    </select>
                    
                    {isCustomCategory && (
                      <input 
                        type="text" 
                        placeholder="Enter new category name" 
                        className="w-full p-3 rounded-lg border border-cream-200 mt-2" 
                        value={newItem.category} 
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                        autoFocus
                      />
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" className="w-full btn-primary">{editingId ? 'Update Item' : 'Add Item'}</button>
                    {editingId && (
                      <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-300 text-gray-800 font-bold py-3 rounded-full hover:bg-gray-400 transition">Cancel</button>
                    )}
                  </div>
                </form>
              </div>
              
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white border border-cream-200 p-4 rounded-xl flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-brown-900">{item.name}</h4>
                      <p className="text-sm text-brown-600">${item.price}</p>
                      <p className="text-xs text-brown-500">{item.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingId(item.id);
                          setNewItem({ ...item });
                        }} 
                        className="text-blue-500 hover:text-blue-700 text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteMenuItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-cream-50 p-8 rounded-xl h-fit">
                <h3 className="text-2xl font-display text-brown-900 mb-6 text-center">{editingStaffId ? 'Edit Staff' : 'Register New Staff'}</h3>
                <form onSubmit={handleRegisterStaff} className="space-y-4">
                  <input type="text" placeholder="Name" className="w-full p-3 rounded-lg border border-cream-200" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} required />
                  <input type="email" placeholder="Email" className="w-full p-3 rounded-lg border border-cream-200" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} required />
                  <input type="password" placeholder={editingStaffId ? "Password (leave blank to keep current)" : "Password"} className="w-full p-3 rounded-lg border border-cream-200" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} required={!editingStaffId} />
                  <select className="w-full p-3 rounded-lg border border-cream-200" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>

                  </select>
                  <div className="flex gap-2">
                    <button type="submit" className="w-full btn-primary">{editingStaffId ? 'Update Staff' : 'Register Staff'}</button>
                    {editingStaffId && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingStaffId(null);
                          setNewStaff({ name: '', email: '', password: '', role: 'kitchen' });
                        }}
                        className="w-full bg-gray-300 text-gray-800 font-bold py-3 rounded-full hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-display text-brown-900 mb-6">Staff List</h3>
                {users.map(u => (
                  <div key={u.id} className="bg-white border border-cream-200 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-brown-900">{u.name}</p>
                      <p className="text-sm text-brown-600">{u.email}</p>
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'kitchen' ? 'bg-orange-100 text-orange-800' :
                        u.role === 'driver' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditStaff(u)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-bold"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteStaff(u.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-8">
              <div className="flex justify-end">
                <button 
                  onClick={downloadCSV}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <span>Download Report (CSV)</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-center">
                  <h3 className="text-purple-900 font-bold uppercase text-sm mb-2">Total Income</h3>
                  <p className="text-4xl font-display text-purple-600">
                    ${orders
                      .filter(o => o.status === 'delivered')
                      .reduce((acc, order) => acc + order.items.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-cream-200 shadow-sm">
                <h3 className="text-xl font-display text-brown-900 mb-6">Sales Overview</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(orders.reduce((acc, order) => {
                        const date = new Date(order.created_at).toLocaleDateString();
                        acc[date] = (acc[date] || 0) + order.items.reduce((sum, item) => sum + (item.menu_item.price * item.quantity), 0);
                        return acc;
                      }, {})).map(([date, amount]) => ({ date, amount }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" fill="#8884d8" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-display text-brown-900 mb-6">Manage Categories</h3>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {[...new Set(menuItems.map(i => i.category))].sort().map(category => (
                <div key={category} className="flex justify-between items-center p-3 bg-cream-50 rounded-lg border border-cream-100">
                  <span className="font-bold text-brown-900">{category}</span>
                  {category !== 'Main' && (
                    <button 
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-500 hover:text-red-700 text-sm font-bold px-3 py-1 bg-white rounded border border-red-100 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                  {category === 'Main' && (
                    <span className="text-xs text-gray-400 italic px-2">Default</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
