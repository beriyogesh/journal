import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { PropAccount, Trade } from '@/types/database'

interface DrawdownMonitorProps {
  account: PropAccount
  todayTrades: Trade[]
}

export function DrawdownMonitor({ account, todayTrades }: DrawdownMonitorProps) {
  const todayPnl = todayTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const totalPnl = account.current_balance - account.starting_balance

  const dailyLossUsed = account.max_daily_loss
    ? (Math.abs(Math.min(0, todayPnl)) / account.max_daily_loss) * 100
    : 0

  const totalDrawdownUsed = account.max_total_drawdown
    ? (Math.abs(Math.min(0, totalPnl)) / account.max_total_drawdown) * 100
    : 0

  const profitProgress = account.profit_target
    ? Math.max(0, (totalPnl / account.profit_target) * 100)
    : 0

  const isDailyWarning = dailyLossUsed >= 75
  const isTotalWarning = totalDrawdownUsed >= 75

  return (
    <Card className={isDailyWarning || isTotalWarning ? 'border-red-500/50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {account.firm_name}
            {account.account_label && ` - ${account.account_label}`}
          </CardTitle>
          {(isDailyWarning || isTotalWarning) && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Warning
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {account.max_daily_loss && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Daily Loss</span>
              <span className={todayPnl < 0 ? 'text-red-500 font-medium' : ''}>
                {formatCurrency(Math.abs(Math.min(0, todayPnl)))} / {formatCurrency(account.max_daily_loss)}
              </span>
            </div>
            <Progress
              value={dailyLossUsed}
              indicatorClassName={
                dailyLossUsed >= 90 ? 'bg-red-500' : dailyLossUsed >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }
            />
          </div>
        )}

        {account.max_total_drawdown && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Drawdown</span>
              <span className={totalPnl < 0 ? 'text-red-500 font-medium' : ''}>
                {formatCurrency(Math.abs(Math.min(0, totalPnl)))} / {formatCurrency(account.max_total_drawdown)}
              </span>
            </div>
            <Progress
              value={totalDrawdownUsed}
              indicatorClassName={
                totalDrawdownUsed >= 90 ? 'bg-red-500' : totalDrawdownUsed >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }
            />
          </div>
        )}

        {account.profit_target && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profit Target</span>
              <span className={totalPnl > 0 ? 'text-emerald-500 font-medium' : ''}>
                {formatCurrency(Math.max(0, totalPnl))} / {formatCurrency(account.profit_target)}
              </span>
            </div>
            <Progress
              value={profitProgress}
              indicatorClassName={profitProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}
            />
          </div>
        )}

        <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
          <span>Today: {formatCurrency(todayPnl)}</span>
          <span>Balance: {formatCurrency(account.current_balance)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
