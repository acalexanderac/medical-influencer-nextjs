import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Search
            </Link>
            <Link href="/leaderboard" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Leaderboard
            </Link>
            <Link href="/favorites" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Favorites
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 