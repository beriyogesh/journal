import { useMemo } from 'react'
import { DrawdownMonitor } from '@/components/risk/drawdown-monitor'
import { PositionCalculator } from '@/components/risk/position-calculator'
import { useAccounts } from '@/hooks/use-accounts'
import { useTrades } from '@/hooks/use-trades'
import { format } from 'date-fns'

export function RiskPage() {
  const { accounts, loading: accountsLoading } = useAccounts()
  const { trades, loading: tradesLoading } = useTrades()

  const today = format(new Date(), 'yyyy-MM-dd')
  const activeAccounts = useMemo(
    () => accounts.filter((a) => a.status === 'active'),
    [accounts]
  )

  if (accountsLoading || tradesLoading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Risk Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PositionCalculator />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Account Limits</h2>
          {activeAccounts.length === 0 ? (
            <p className="text-muted-foreground">No active accounts</p>
          ) : (
            activeAccounts.map((account) => {
              const todayTrades = trades.filter(
                (t) => t.account_id === account.id && t.entry_date.startsWith(today)
              )
              return (
                <DrawdownMonitor
                  key={account.id}
                  account={account}
                  todayTrades={todayTrades}
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
