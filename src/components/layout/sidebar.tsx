import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  BarChart3,
  Shield,
  Wallet,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/firms', icon: Building2, label: 'Firms' },
  { to: '/accounts', icon: Wallet, label: 'Accounts' },
  { to: '/trades', icon: TrendingUp, label: 'Trades' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/risk', icon: Shield, label: 'Risk' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-card h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold">Trading Journal</h1>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
