import { useState } from 'react'
import { Select } from '@/components/ui/select'
import { EquityCurve } from '@/components/analytics/equity-curve'
import { CalendarHeatmap } from '@/components/analytics/calendar-heatmap'
import { DrawdownChart } from '@/components/analytics/drawdown-chart'
import { WinRateCard, MetricsCards, PerformanceByGroup, StreakTracker, MonthlyBreakdown } from '@/components/analytics/performance-charts'
import { useAccounts } from '@/hooks/use-accounts'
import { useTrades } from '@/hooks/use-trades'
import { useAnalytics } from '@/hooks/use-analytics'

export function AnalyticsPage() {
  const { accounts } = useAccounts()
  const [selectedAccountId, setSelectedAccountId] = useState('')

  const { trades, loading } = useTrades({
    accountId: selectedAccountId || undefined,
  })

  const {
    overview,
    equityCurve,
    calendarData,
    performanceByInstrument,
    performanceBySetup,
    performanceByDay,
    performanceBySession,
    streaks,
    monthlyBreakdown,
    drawdownData,
  } = useAnalytics(trades)

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Select
          options={[
            { value: '', label: 'All Accounts' },
            ...accounts.map((a) => ({
              value: a.id,
              label: `${a.firm_name}${a.account_label ? ` - ${a.account_label}` : ''}`,
            })),
          ]}
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="w-56"
        />
      </div>

      {/* Overview Metrics */}
      <div className="flex gap-4 flex-wrap">
        <WinRateCard metrics={overview} />
        <div className="flex-1">
          <MetricsCards metrics={overview} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EquityCurve data={equityCurve} />
        <DrawdownChart data={drawdownData} maxDrawdownPct={selectedAccount?.max_total_drawdown_pct} />
      </div>

      <CalendarHeatmap data={calendarData} />

      {/* Performance Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceByGroup title="Performance by Instrument" data={performanceByInstrument} />
        <PerformanceByGroup title="Performance by Setup" data={performanceBySetup} />
        <PerformanceByGroup title="Performance by Day" data={performanceByDay} />
        <PerformanceByGroup title="Performance by Session" data={performanceBySession} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakTracker streaks={streaks} />
        <div /> {/* spacer */}
      </div>

      <MonthlyBreakdown data={monthlyBreakdown} />
    </div>
  )
}
