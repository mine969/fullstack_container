'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guestDetails, setGuestDetails] = useState({ name: '', phone: '', address: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await api.getMenu();
      setMenuItems(items);
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1 }]);
  };

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token && (!guestDetails.name || !guestDetails.phone || !guestDetails.address)) {
        alert('Please fill in all guest details');
        return;
      }

      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: 1
      }));

      await api.createOrder(
        orderItems, 
        token, 
        token ? "123 Demo St" : guestDetails.address, // Use guest address if not logged in
        token ? null : { 
          guest_name: guestDetails.name, 
          guest_email: "guest@example.com", 
          guest_phone: guestDetails.phone 
        }
      );
      
      alert('Order placed successfully!');
      setCart([]);
      if (!token) setGuestDetails({ name: '', phone: '', address: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Menu</h1>
          <div className="flex items-center gap-4">
            {!isLoggedIn && (
              <button onClick={() => router.push('/login')} className="text-blue-600 hover:underline">
                Staff Login
              </button>
            )}
            <div className="bg-white p-4 rounded-lg shadow">
              <span className="font-bold text-gray-800">Cart: {cart.length} items</span>
            </div>
          </div>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ${item.price}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                  <div className="mt-4">
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full py-2 px-4 bg-gray-900 text-white rounded hover:bg-gray-800 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Checkout</h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {!isLoggedIn && (
                    <div className="space-y-3 border-b pb-4">
                      <h3 className="font-semibold text-gray-700">Guest Details</h3>
                      <input
                        type="text"
                        placeholder="Name"
                        className="w-full p-2 border rounded text-black"
                        value={guestDetails.name}
                        onChange={e => setGuestDetails({...guestDetails, name: e.target.value})}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        className="w-full p-2 border rounded text-black"
                        value={guestDetails.phone}
                        onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})}
                      />
                      <input
                        type="text"
                        placeholder="Delivery Address"
                        className="w-full p-2 border rounded text-black"
                        value={guestDetails.address}
                        onChange={e => setGuestDetails({...guestDetails, address: e.target.value})}
                      />
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button
                      onClick={placeOrder}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
