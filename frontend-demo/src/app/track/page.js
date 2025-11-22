'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const data = await api.getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError('Order not found. Please check your Order ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 transform transition-transform group-hover:scale-110 duration-300">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-display text-primary tracking-wider transform rotate-[-2deg] group-hover:rotate-0 transition-transform duration-300">
                BURGER DELIVERY
              </span>
            </Link>
            <div className="flex items-center gap-6">
                <Link href="/menu" className="text-brown-600 hover:text-primary font-bold transition-colors">Menu</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display text-brown-900 mb-4">Track Your Order</h1>
          <p className="text-brown-600 text-lg">Enter your Order ID to see real-time updates.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-cream-200 mb-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <input
              type="number"
              placeholder="Enter Order ID (e.g. 1)"
              className="flex-1 p-4 rounded-xl border-2 border-cream-200 focus:border-primary focus:outline-none text-lg font-bold text-brown-900 placeholder-brown-300 transition-colors"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Tracking...' : 'Track'}
            </button>
          </form>
          {error && <p className="mt-4 text-red-500 font-bold text-center">{error}</p>}
        </div>

        {order && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-cream-200 animate-fade-in-up">
            <div className="flex justify-between items-center mb-8 border-b border-cream-100 pb-6">
              <div>
                <h2 className="text-3xl font-display text-brown-900">Order #{order.id}</h2>
                <p className="text-brown-600">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className={`px-6 py-2 rounded-full text-lg font-bold uppercase tracking-wide ${
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                order.status === 'cooking' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status}
              </div>
            </div>

            <div className="space-y-8">
              {/* Progress Bar */}
              <div className="relative pt-4">
                <div className="flex justify-between mb-2 text-sm font-bold text-brown-400 uppercase tracking-wider">
                  <span className={['pending', 'cooking', 'ready', 'assigned', 'picked_up', 'delivered'].includes(order.status) ? 'text-primary' : ''}>Placed</span>
                  <span className={['cooking', 'ready', 'assigned', 'picked_up', 'delivered'].includes(order.status) ? 'text-primary' : ''}>Cooking</span>
                  <span className={['ready', 'assigned', 'picked_up', 'delivered'].includes(order.status) ? 'text-primary' : ''}>Ready</span>
                  <span className={['picked_up', 'delivered'].includes(order.status) ? 'text-primary' : ''}>On Way</span>
                  <span className={order.status === 'delivered' ? 'text-green-600' : ''}>Delivered</span>
                </div>
                <div className="h-3 bg-cream-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${order.status === 'delivered' ? 'bg-green-500' : 'bg-primary'}`}
                    style={{ width: 
                      order.status === 'pending' ? '10%' :
                      order.status === 'cooking' ? '30%' :
                      order.status === 'ready' ? '50%' :
                      order.status === 'assigned' ? '60%' :
                      order.status === 'picked_up' ? '80%' :
                      '100%'
                    }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-brown-900 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-cream-50 rounded-lg">
                        <span className="font-bold text-brown-800">{item.menu_item.name}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-brown-600">x{item.quantity}</span>
                            <span className="font-bold text-primary">${item.item_price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-cream-200 flex justify-between items-center">
                    <span className="font-bold text-brown-900 text-lg">Total</span>
                    <span className="font-display text-2xl text-primary">${order.total_amount || '0.00'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-brown-900 mb-4">Delivery Details</h3>
                  <div className="bg-cream-50 p-6 rounded-xl space-y-4">
                    <div>
                        <label className="text-xs font-bold text-brown-500 uppercase">Guest Name</label>
                        <p className="text-brown-900 font-bold text-lg">{order.guest_name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-brown-500 uppercase">Address</label>
                        <p className="text-brown-900 font-bold text-lg">{order.delivery_address}</p>
                    </div>
                    {order.driver_id && (
                        <div className="pt-4 border-t border-cream-200">
                            <label className="text-xs font-bold text-blue-600 uppercase">Driver Assigned</label>
                            <p className="text-blue-900 font-bold">Your order is on the way!</p>
                        </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
