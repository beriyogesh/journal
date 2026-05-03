import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { GroupedPerformance, OverviewMetrics, StreakData } from '@/hooks/use-analytics'

export function WinRateCard({ metrics }: { metrics: OverviewMetrics }) {
  const data = [
    { name: 'Wins', value: metrics.winRate },
    { name: 'Losses', value: 100 - metrics.winRate },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Win Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} innerRadius={25} outerRadius={35} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill="#10b981" />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">{metrics.totalTrades} trades</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricsCards({ metrics }: { metrics: OverviewMetrics }) {
  const items = [
    { label: 'Total P&L', value: formatCurrency(metrics.totalPnl), color: metrics.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500' },
    { label: 'Profit Factor', value: metrics.profitFactor === Infinity ? 'N/A' : metrics.profitFactor.toFixed(2), color: metrics.profitFactor >= 1 ? 'text-emerald-500' : 'text-red-500' },
    { label: 'Avg Win', value: formatCurrency(metrics.avgWin), color: 'text-emerald-500' },
    { label: 'Avg Loss', value: formatCurrency(metrics.avgLoss), color: 'text-red-500' },
    { label: 'Expectancy', value: formatCurrency(metrics.expectancy), color: metrics.expectancy >= 0 ? 'text-emerald-500' : 'text-red-500' },
    { label: 'Best Trade', value: formatCurrency(metrics.bestTrade), color: 'text-emerald-500' },
    { label: 'Worst Trade', value: formatCurrency(metrics.worstTrade), color: 'text-red-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function PerformanceByGroup({ title, data }: { title: string; data: GroupedPerformance[] }) {
  if (data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              formatter={(value) => [formatCurrency(Number(value)), 'P&L']}
            />
            <Bar dataKey="pnl">
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function StreakTracker({ streaks }: { streaks: StreakData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Streaks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Win Streak</p>
            <p className="text-xl font-bold text-emerald-500">{streaks.currentWinStreak}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max Win Streak</p>
            <p className="text-xl font-bold text-emerald-500">{streaks.maxWinStreak}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Loss Streak</p>
            <p className="text-xl font-bold text-red-500">{streaks.currentLossStreak}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max Loss Streak</p>
            <p className="text-xl font-bold text-red-500">{streaks.maxLossStreak}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MonthlyBreakdown({ data }: { data: { month: string; trades: number; winRate: number; pnl: number; fees: number }[] }) {
  if (data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">Month</th>
                <th className="pb-2 pr-4">Trades</th>
                <th className="pb-2 pr-4">Win Rate</th>
                <th className="pb-2 pr-4">Gross P&L</th>
                <th className="pb-2 pr-4">Fees</th>
                <th className="pb-2">Net P&L</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.month} className="border-b">
                  <td className="py-2 pr-4 font-medium">{row.month}</td>
                  <td className="py-2 pr-4">{row.trades}</td>
                  <td className="py-2 pr-4">{row.winRate.toFixed(1)}%</td>
                  <td className={`py-2 pr-4 ${row.pnl + row.fees >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatCurrency(row.pnl + row.fees)}
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">{formatCurrency(row.fees)}</td>
                  <td className={`py-2 font-semibold ${row.pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatCurrency(row.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
