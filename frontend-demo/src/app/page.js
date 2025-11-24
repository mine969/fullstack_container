'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
              <span className="text-2xl font-display text-primary tracking-wider transform rotate-[-2deg]">BURGER DELIVERY</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/menu" className="font-bold text-brown-900 hover:text-primary transition">Menu</Link>
              <Link href="/track" className="font-bold text-brown-900 hover:text-primary transition">Track Order</Link>
              <Link href="/about" className="font-bold text-brown-900 hover:text-primary transition">About</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative bg-cream-50 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-cream-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-5xl tracking-tight font-display text-brown-900 sm:text-6xl md:text-7xl">
                    <span className="block xl:inline">TASTE THE</span>{' '}
                    <span className="block text-primary xl:inline">DIFFERENCE</span>
                  </h1>
                  <p className="mt-3 text-base text-brown-800 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 font-medium">
                    WHERE EVERY BITE HIT DIFFERENT. Fresh ingredients, premium beef, and secret sauce delivered straight to your door.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                    <div className="rounded-md shadow">
                      <Link href="/menu" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary-dark md:py-4 md:text-lg md:px-10 transition-transform hover:scale-105 shadow-lg">
                        ORDER NOW
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full bg-cream-100 flex items-center justify-center overflow-hidden">
                <Image src="/hero.png" alt="Delicious Burger" width={800} height={600} className="object-cover w-full h-full" priority />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
