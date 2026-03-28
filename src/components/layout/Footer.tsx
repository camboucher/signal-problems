import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="hidden sm:block border-t border-gray-200 mt-8">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between text-[10px] text-gray-400">
        <span>Signal Problems &middot; Not real money</span>
        <nav className="flex gap-4">
          <Link to="/about" className="hover:text-gray-600 transition-colors">About</Link>
          <Link to="/leaderboard" className="hover:text-gray-600 transition-colors">Leaderboard</Link>
        </nav>
      </div>
    </footer>
  )
}
