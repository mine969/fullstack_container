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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await api.getMenu();
      // Sort items: Burgers first
      const sortedItems = items.sort((a, b) => {
        const isBurgerA = a.name.toLowerCase().includes('burger') || (a.category && a.category.toLowerCase().includes('burger'));
        const isBurgerB = b.name.toLowerCase().includes('burger') || (b.category && b.category.toLowerCase().includes('burger'));
        
        if (isBurgerA && !isBurgerB) return -1;
        if (!isBurgerA && isBurgerB) return 1;
        return 0;
      });
      setMenuItems(sortedItems);
    } catch (err) {
      setError('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        return prevCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const placeOrder = () => {
    if (!guestDetails.name || !guestDetails.phone || !guestDetails.address) {
      alert('Please fill in all guest details');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }));

      const newOrder = await api.createOrder(
        orderItems, 
        null, // No token
        guestDetails.address, 
        { 
          guest_name: guestDetails.name, 
          guest_email: "guest@example.com", 
          guest_phone: guestDetails.phone 
        }
      );
      
      setOrderResult(newOrder);
      setShowPaymentModal(false);
      setShowConfirmation(true);
      setCart([]);
      setGuestDetails({ name: '', phone: '', address: '' });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsProcessingPayment(false);
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
              <span className="text-2xl font-display text-primary tracking-wider transform rotate-[-2deg]">KITCHEN BELL</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/track" className="font-bold text-brown-900 hover:text-primary transition">Track Order</Link>
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
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  selectedCategory === 'All' 
                    ? 'bg-primary text-white shadow-lg transform scale-105' 
                    : 'bg-white text-brown-900 hover:bg-cream-200'
                }`}
              >
                All
              </button>
              {[...new Set(menuItems.map(item => item.category || 'Other'))].sort().map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    selectedCategory === category 
                      ? 'bg-primary text-white shadow-lg transform scale-105' 
                      : 'bg-white text-brown-900 hover:bg-cream-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems
                .filter(item => selectedCategory === 'All' || (item.category || 'Other') === selectedCategory)
                .map((item) => (
                <div key={item.id} className="card group hover:border-primary transition-colors">
                  <div className="h-48 bg-cream-100 relative overflow-hidden">
                     {item.image_url ? (
                        <Image 
                          src={item.image_url} 
                          alt={item.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          unoptimized
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                     ) : null}
                     <div className={`absolute inset-0 flex items-center justify-center text-brown-300 font-display text-4xl opacity-20 ${item.image_url ? 'hidden' : ''}`}>
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
                        <div key={index} className="flex justify-between items-center text-sm text-brown-900 font-medium border-b border-cream-100 pb-2">
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span>{item.name}</span>
                                <span>${(Number(item.price) * item.quantity).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-cream-200 hover:bg-cream-300 flex items-center justify-center text-xs font-bold">-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-cream-200 hover:bg-cream-300 flex items-center justify-center text-xs font-bold">+</button>
                                <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 text-xs hover:text-red-700">Remove</button>
                              </div>
                            </div>
                        </div>
                    ))}
                  </div>
                  
                  <div className="border-t-2 border-dashed border-brown-200 pt-4 flex justify-between font-display text-2xl text-primary">
                      <span>TOTAL</span>
                      <span>${cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
                  </div>

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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <h3 className="text-2xl font-display text-brown-900 mb-6 text-center">Secure Payment</h3>
            
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brown-700 mb-1">Card Number</label>
                <input required type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 border border-cream-200 rounded-lg bg-cream-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-brown-700 mb-1">Expiry</label>
                  <input required type="text" placeholder="MM/YY" className="w-full p-3 border border-cream-200 rounded-lg bg-cream-50" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brown-700 mb-1">CVC</label>
                  <input required type="text" placeholder="123" className="w-full p-3 border border-cream-200 rounded-lg bg-cream-50" />
                </div>
              </div>
              
              <div className="border-t border-cream-200 pt-4 mt-6">
                <div className="flex justify-between text-lg font-bold text-brown-900 mb-4">
                  <span>Total to Pay</span>
                  <span>${cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isProcessingPayment}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      Processing...
                    </>
                  ) : (
                    'PAY NOW'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Screen */}
      {showConfirmation && orderResult && (
        <div className="fixed inset-0 bg-primary/95 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
            
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✓</span>
            </div>
            
            <h2 className="text-4xl font-display text-brown-900 mb-2">Order Confirmed!</h2>
            <p className="text-brown-600 mb-8">Your delicious food is on the way.</p>
            
            <div className="bg-cream-50 rounded-xl p-6 mb-8 border border-cream-100">
              <p className="text-sm text-brown-500 uppercase tracking-widest font-bold mb-2">Tracking ID</p>
              <p className="text-4xl font-display text-primary tracking-wider">{orderResult.id}</p>
              <p className="text-xs text-brown-400 mt-2">Save this ID to track your order</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link 
                href="/track" 
                className="w-full py-4 bg-brown-900 text-white rounded-xl font-bold hover:bg-brown-800 transition-colors"
              >
                TRACK ORDER
              </Link>
              <button 
                onClick={() => setShowConfirmation(false)}
                className="w-full py-4 bg-transparent text-brown-600 font-bold hover:text-brown-900"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
