'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

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

      const newOrder = await api.createOrder(
        orderItems, 
        token, 
        token ? "123 Demo St" : guestDetails.address, 
        token ? null : { 
          guest_name: guestDetails.name, 
          guest_email: "guest@example.com", 
          guest_phone: guestDetails.phone 
        }
      );
      
      alert(`Order placed successfully! Your Order ID is: ${newOrder.id}\n\nPlease save this ID to track your order.`);
      setCart([]);
      if (!token) setGuestDetails({ name: '', phone: '', address: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brown-900 font-display text-2xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-cream-50">
       <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-100 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="text-2xl font-display text-primary tracking-wider transform rotate-[-2deg]">BURGER DELIVERY</span>
            </Link>
            <div className="flex items-center gap-6">
              {isLoggedIn && (
                <>
                  <Link href="/orders" className="font-bold text-brown-900 hover:text-primary transition">My Orders</Link>
                  <button
                    onClick={() => { 
                      localStorage.removeItem('token'); 
                      setIsLoggedIn(false); 
                      setGuestDetails({ name: '', phone: '', address: '' });
                    }}
                    className="font-bold text-red-600 hover:text-red-800 transition"
                  >
                    Logout
                  </button>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <Link href="/track" className="font-bold text-brown-900 hover:text-primary transition">Track Order</Link>
                  <Link href="/login" className="font-bold text-brown-900 hover:text-primary transition">Staff Login</Link>
                </>
              )}
              <div className="bg-primary text-white px-4 py-2 rounded-full font-bold shadow-md">
                Cart: {cart.length}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && <div className="text-red-500 mb-4 text-center font-bold">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-display text-brown-900 mb-6 border-b-4 border-primary inline-block pb-1">OUR MENU</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="card group hover:border-primary transition-colors">
                  <div className="h-48 bg-cream-100 relative overflow-hidden">
                     {/* Placeholder for item image - using hero for now or generic */}
                     <div className="absolute inset-0 flex items-center justify-center text-brown-300 font-display text-4xl opacity-20">
                        {item.category === 'Main' ? '🍔' : item.category === 'Drink' ? '🥤' : '🍟'}
                     </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-brown-900 font-display tracking-wide">{item.name}</h3>
                      <span className="bg-primary text-white text-sm font-bold px-2 py-1 rounded-full">
                        ${item.price}
                      </span>
                    </div>
                    <p className="text-brown-800 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-full py-2 px-4 bg-brown-900 text-white rounded-lg font-bold hover:bg-primary transition-colors shadow-md"
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 border-t-8 border-primary">
              <h2 className="text-2xl font-display text-brown-900 mb-6 flex items-center gap-2">
                <span>🛒</span> YOUR ORDER
              </h2>
              
              {cart.length === 0 ? (
                <p className="text-brown-800 italic text-center py-8">Your cart is empty. Hungry?</p>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {cart.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-brown-900 font-medium border-b border-cream-100 pb-2">
                            <span>{item.name}</span>
                            <span>${item.price}</span>
                        </div>
                    ))}
                  </div>
                  
                  <div className="border-t-2 border-dashed border-brown-200 pt-4 flex justify-between font-display text-2xl text-primary">
                      <span>TOTAL</span>
                      <span>${cart.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2)}</span>
                  </div>

                  {isLoggedIn && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-4">
                      <p className="text-green-800 text-sm font-bold mb-2">
                        You are logged in.
                      </p>
                      <p className="text-green-700 text-xs mb-3">
                        We'll use your profile address for delivery.
                      </p>
                      <button
                        onClick={() => { 
                          localStorage.removeItem('token'); 
                          setIsLoggedIn(false); 
                          setGuestDetails({ name: '', phone: '', address: '' });
                        }}
                        className="text-xs bg-white border border-green-200 text-green-700 px-3 py-1 rounded-full font-bold hover:bg-green-100 transition"
                      >
                        Not you? Logout
                      </button>
                    </div>
                  )}

                  {!isLoggedIn && (
                    <div className="space-y-3 bg-cream-100 p-4 rounded-xl">
                      <h3 className="font-bold text-brown-900 text-sm uppercase tracking-wider">Guest Details</h3>
                      <input
                        type="text"
                        placeholder="Name"
                        className="w-full p-2 border border-cream-200 rounded-lg text-brown-900 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                        value={guestDetails.name}
                        onChange={e => setGuestDetails({...guestDetails, name: e.target.value})}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        className="w-full p-2 border border-cream-200 rounded-lg text-brown-900 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                        value={guestDetails.phone}
                        onChange={e => setGuestDetails({...guestDetails, phone: e.target.value})}
                      />
                      <input
                        type="text"
                        placeholder="Delivery Address"
                        className="w-full p-2 border border-cream-200 rounded-lg text-brown-900 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                        value={guestDetails.address}
                        onChange={e => setGuestDetails({...guestDetails, address: e.target.value})}
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={placeOrder}
                    className="w-full py-4 bg-primary text-white rounded-xl font-display text-xl tracking-wide hover:bg-primary-dark transition-transform hover:scale-105 shadow-lg"
                  >
                    PLACE ORDER NOW
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
