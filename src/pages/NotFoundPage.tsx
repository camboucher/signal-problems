import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold tabular-nums mb-4">404</p>
        <p className="text-gray-500 mb-6">Page not found</p>
        <Link to="/" className="btn-primary">Back to markets</Link>
      </div>
    </div>
  )
}
