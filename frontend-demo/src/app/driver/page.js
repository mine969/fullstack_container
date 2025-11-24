'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
      if (userData.role !== 'driver') {
        router.push('/menu');
      } else {
        loadOrders(token);
      }
    } catch (err) {
      router.push('/admin-portal');
    }
  };

  const loadOrders = async (token) => {
    try {
      const data = await api.getOrders(token);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    await api.updateOrderStatus(orderId, status, token);
    loadOrders(token);
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
              <span className="text-2xl font-display text-primary tracking-wider transform rotate-[-2deg]">DRIVER APP</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-brown-900 font-bold">Hello, {user?.name}</span>
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
        <div className="card p-6 min-h-[500px]">
          <h2 className="text-3xl font-display text-brown-900 mb-6 flex items-center gap-2">
            <span>🚚</span> Assigned Deliveries
          </h2>
          
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-cream-50 p-6 rounded-xl border border-cream-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-display text-2xl text-brown-900">#{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-brown-800 font-bold text-lg">{order.guest_name || 'Customer'}</p>
                  <p className="text-brown-600 mb-2">{order.delivery_address || '123 Demo St'}</p>
                  <div className="text-sm text-brown-700 bg-white p-3 rounded-lg border border-cream-100">
                    {order.items.map((item, i) => (
                        <span key={i} className="block">• {item.menu_item.name} x{item.quantity}</span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {order.status === 'assigned' && (
                    <button onClick={() => updateStatus(order.id, 'picked_up')} className="btn-primary w-full md:w-auto">
                      Pick Up Order
                    </button>
                  )}
                  {order.status === 'picked_up' && (
                    <button onClick={() => updateStatus(order.id, 'delivered')} className="btn-primary w-full md:w-auto bg-green-600 hover:bg-green-700">
                      Mark Delivered
                    </button>
                  )}
                  {order.status === 'delivered' && (
                      <span className="text-green-600 font-bold flex items-center gap-1">
                          ✓ Completed
                      </span>
                  )}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-brown-500 italic text-xl">No active deliveries. Time for a break!</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
