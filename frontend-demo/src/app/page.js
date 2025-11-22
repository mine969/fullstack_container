import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Food Delivery App</h1>
      <p className="mb-8 text-gray-600">Delicious food delivered to your doorstep.</p>
      <div className="space-x-4">
        <Link href="/menu" className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
          Order Now (Guest)
        </Link>
        <Link href="/login" className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Staff Login
        </Link>
      </div>
    </div>
  );
}
