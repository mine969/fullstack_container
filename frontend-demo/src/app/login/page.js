'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.access_token);
      
      // Get user role
      const user = await api.getMe(data.access_token);
      
      if (user.role === 'admin' || user.role === 'manager') {
        router.push('/staff');
      } else if (user.role === 'driver') {
        router.push('/driver');
      } else {
        router.push('/orders');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 card p-8 border-t-4 border-primary">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="mx-auto h-20 w-auto object-contain" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-display text-brown-900 tracking-wide">
            STAFF LOGIN
          </h2>
          <p className="mt-2 text-center text-sm text-brown-800">
            Access the kitchen, driver, or admin dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-600 text-center bg-red-50 p-2 rounded border border-red-200">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-cream-100 placeholder-gray-400 text-brown-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-cream-100 placeholder-gray-400 text-brown-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform hover:scale-105 shadow-lg"
            >
              SIGN IN
            </button>
          </div>
          <div className="text-center">
             <Link href="/" className="text-sm text-primary hover:text-primary-dark font-medium">
                Back to Home
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
