import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AccountCard } from '@/components/accounts/account-card'
import { TradeTable } from '@/components/trades/trade-table'
import { useAccounts } from '@/hooks/use-accounts'
import { useTrades } from '@/hooks/use-trades'
import { formatCurrency, getPnlColor } from '@/lib/utils'
import { Plus, TrendingUp, Target, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

export function DashboardPage() {
  const navigate = useNavigate()
  const { accounts, loading: accountsLoading } = useAccounts()
  const { trades, loading: tradesLoading } = useTrades()

  const today = format(new Date(), 'yyyy-MM-dd')

  const activeAccounts = useMemo(
    () => accounts.filter((a) => a.status === 'active'),
    [accounts]
  )

  const todayTrades = useMemo(
    () => trades.filter((t) => t.entry_date.startsWith(today)),
    [trades, today]
  )

  const todayPnl = todayTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const recentTrades = trades.slice(0, 5)

  const thisWeekTrades = useMemo(() => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    return trades.filter((t) => new Date(t.entry_date) >= weekStart)
  }, [trades])

  const weekWinRate = thisWeekTrades.length > 0
    ? (thisWeekTrades.filter((t) => (t.pnl ?? 0) > 0).length / thisWeekTrades.length) * 100
    : 0

  const weekPnl = thisWeekTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)

  // Check for accounts near drawdown limits
  const warningAccounts = activeAccounts.filter((a) => {
    const totalPnl = a.current_balance - a.starting_balance
    if (a.max_total_drawdown && Math.abs(Math.min(0, totalPnl)) / a.max_total_drawdown >= 0.75) return true
    return false
  })

  if (accountsLoading || tradesLoading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/trades/new')} className="gap-2">
          <Plus className="h-4 w-4" /> Log Trade
        </Button>
      </div>

      {/* Risk Warnings */}
      {warningAccounts.length > 0 && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="font-medium text-red-500">Drawdown Warning</p>
            <p className="text-sm text-muted-foreground">
              {warningAccounts.map((a) => a.firm_name).join(', ')} approaching drawdown limit
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Today's P&L
            </p>
            <p className={`text-2xl font-bold ${getPnlColor(todayPnl)}`}>
              {formatCurrency(todayPnl)}
            </p>
            <p className="text-xs text-muted-foreground">{todayTrades.length} trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className={`text-2xl font-bold ${getPnlColor(weekPnl)}`}>
              {formatCurrency(weekPnl)}
            </p>
            <p className="text-xs text-muted-foreground">{thisWeekTrades.length} trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Week Win Rate
            </p>
            <p className="text-2xl font-bold">{weekWinRate.toFixed(0)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active Accounts</p>
            <p className="text-2xl font-bold">{activeAccounts.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      {activeAccounts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Active Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Trades */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Trades</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/trades')}>View all</Button>
        </CardHeader>
        <CardContent>
          <TradeTable trades={recentTrades} compact />
        </CardContent>
      </Card>

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Get started by adding your first prop firm account</p>
            <Button onClick={() => navigate('/accounts/new')}>
              <Plus className="h-4 w-4 mr-2" /> Add Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
