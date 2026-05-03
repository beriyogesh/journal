import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatPnl } from '@/lib/utils'
import type { PropAccount } from '@/types/database'

const statusVariant: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  active: 'success',
  breached: 'destructive',
  passed: 'default',
  payout: 'warning',
  inactive: 'secondary',
}

const phaseLabel: Record<string, string> = {
  evaluation_phase1: 'Phase 1',
  evaluation_phase2: 'Phase 2',
  funded: 'Funded',
  payout: 'Payout',
}

export function AccountCard({ account }: { account: PropAccount }) {
  const navigate = useNavigate()
  const pnl = account.current_balance - account.starting_balance
  const pnlPercent = (pnl / account.starting_balance) * 100

  const profitProgress = account.profit_target
    ? Math.max(0, (pnl / account.profit_target) * 100)
    : 0

  const drawdownUsed = account.max_total_drawdown
    ? Math.max(0, (Math.abs(Math.min(0, pnl)) / account.max_total_drawdown) * 100)
    : 0

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => navigate(`/accounts/${account.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{account.firm_name}</CardTitle>
          <Badge variant={statusVariant[account.status] ?? 'secondary'}>
            {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{phaseLabel[account.phase] ?? account.phase}</span>
          {account.account_label && (
            <>
              <span>-</span>
              <span>{account.account_label}</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-baseline">
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-lg font-bold">{formatCurrency(account.current_balance, account.currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">P&L</p>
            <p className={`text-lg font-bold ${pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {formatPnl(pnl, account.currency)}
            </p>
          </div>
        </div>

        {account.profit_target && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Profit Target</span>
              <span>{pnlPercent.toFixed(1)}% / {account.profit_target_pct ?? 0}%</span>
            </div>
            <Progress
              value={profitProgress}
              indicatorClassName={profitProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}
            />
          </div>
        )}

        {account.max_total_drawdown && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Drawdown Used</span>
              <span>{drawdownUsed.toFixed(1)}%</span>
            </div>
            <Progress
              value={drawdownUsed}
              indicatorClassName={
                drawdownUsed >= 80 ? 'bg-red-500' : drawdownUsed >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }
            />
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Size: {formatCurrency(account.account_size, account.currency)}
        </div>
      </CardContent>
    </Card>
  )
}
