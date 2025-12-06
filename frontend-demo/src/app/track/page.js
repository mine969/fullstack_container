'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function TrackOrder() {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      // Using api.trackOrder for consistent URL handling
      console.log('Tracking Order ID:', trackingId);
      const data = await api.trackOrder(trackingId);
      console.log('Tracking Result:', data);
      setOrder(data);
    } catch (err) {
      console.error('Tracking Error:', err);
      setError(`Order not found. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="mx-auto h-20 w-auto object-contain" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-display text-brown-900 tracking-wide">
            TRACK YOUR ORDER
          </h2>
          <p className="mt-2 text-center text-sm text-brown-600">
            Enter your Tracking ID to see the status
          </p>
        </div>

        <div className="card p-8 border-t-4 border-primary">
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label htmlFor="tracking-id" className="sr-only">Tracking ID</label>
              <input
                id="tracking-id"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-cream-100 placeholder-gray-400 text-brown-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g. 123 (Order ID)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg text-center border border-red-100">
              {error}
            </div>
          )}
        </div>

        {order && (
          <div className="card p-6 border-t-4 border-green-500 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-brown-900">Order #{order.id}</h3>
                <p className="text-sm text-brown-500">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'cooking' ? 'bg-orange-100 text-orange-800' :
                order.status === 'ready' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-3 border-t border-cream-100 pt-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-brown-800">{item.quantity}x {item.menu_item.name}</span>
                  <span className="text-brown-600 font-medium">${item.item_price}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-cream-100 flex justify-between items-center">
              <span className="font-bold text-brown-900">Total</span>
              <span className="font-display text-xl text-primary">${order.total_amount}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
