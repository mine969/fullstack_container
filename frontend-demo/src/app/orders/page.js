'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function OrdersPage() {
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
      router.push('/login');
      return;
    }
    try {
      const userData = await api.getMe(token);
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
      console.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brown-900 font-display text-2xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-100 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="text-2xl font-display text-primary tracking-wider transform rotate-[-2deg]">BURGER DELIVERY</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/menu" className="font-bold text-brown-900 hover:text-primary transition">Menu</Link>
              <span className="text-brown-900 font-bold">Hello, {user?.name}</span>
              <button
                onClick={() => { localStorage.removeItem('token'); router.push('/'); }}
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
            <span>📦</span> My Orders
          </h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brown-500 italic text-xl mb-4">No orders yet. Time to order some burgers!</p>
              <Link href="/menu" className="btn-primary inline-block">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-cream-50 p-6 rounded-xl border border-cream-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-display text-2xl text-brown-900">Order #{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cooking' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'picked_up' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status === 'picked_up' ? 'Out for Delivery' : order.status}
                        </span>
                      </div>
                      <p className="text-sm text-brown-600">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <p className="text-brown-800 font-medium mt-1">
                        📍 {order.delivery_address}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-brown-600 mb-1">Total</p>
                      <p className="text-2xl font-display text-primary">
                        ${order.items.reduce((sum, item) => sum + (Number(item.menu_item.price) * item.quantity), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-cream-200 pt-4">
                    <h4 className="font-bold text-brown-900 mb-2">Order Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-brown-700">
                          <span>• {item.menu_item.name} x{item.quantity}</span>
                          <span>${(Number(item.menu_item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {order.status === 'delivered' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <span className="text-green-600 text-xl">✓</span>
                      <span className="text-green-800 font-medium">Delivered successfully!</span>
                    </div>
                  )}
                  
                  {order.status === 'picked_up' && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                      <span className="text-blue-600 text-xl">🚚</span>
                      <span className="text-blue-800 font-medium">Your order is on the way!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
