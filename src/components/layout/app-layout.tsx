import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
