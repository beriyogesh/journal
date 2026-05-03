import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AppLayout } from '@/components/layout/app-layout'
import { LoginForm } from '@/components/auth/login-form'
import { DashboardPage } from '@/pages/dashboard'
import { AccountsPage } from '@/pages/accounts'
import { AccountAddPage } from '@/pages/account-add'
import { AccountDetailPage } from '@/pages/account-detail'
import { TradesPage } from '@/pages/trades'
import { TradeAddPage } from '@/pages/trade-add'
import { TradeDetailPage } from '@/pages/trade-detail'
import { JournalPage } from '@/pages/journal'
import { AnalyticsPage } from '@/pages/analytics'
import { RiskPage } from '@/pages/risk'
import { FirmsPage } from '@/pages/firms'
import { SettingsPage } from '@/pages/settings'

function ProtectedRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) return <LoginForm />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/firms" element={<FirmsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/new" element={<AccountAddPage />} />
        <Route path="/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/trades" element={<TradesPage />} />
        <Route path="/trades/new" element={<TradeAddPage />} />
        <Route path="/trades/:id" element={<TradeDetailPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/risk" element={<RiskPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default fun