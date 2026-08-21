import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import BottomNav from './BottomNav'
import Footer from './Footer'
import DemoBanner from './DemoBanner'

export default function AppLayout({ children }: { readonly children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-0">
        {children ?? <Outlet />}
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
