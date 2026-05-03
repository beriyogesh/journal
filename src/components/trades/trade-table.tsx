import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { formatCurrency, getPnlColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { Trade } from '@/types/database'

interface TradeTableProps {
  trades: Trade[]
  compact?: boolean
}

export function TradeTable({ trades, compact }: TradeTableProps) {
  const navigate = useNavigate()

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No trades yet. Start logging your trades!
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 pr-4">Date</th>
            <th className="pb-3 pr-4">Instrument</th>
            <th className="pb-3 pr-4">Direction</th>
            {!compact && <th className="pb-3 pr-4">Entry</th>}
            {!compact && <th className="pb-3 pr-4">Exit</th>}
            <th className="pb-3 pr-4">P&L</th>
            {!compact && <th className="pb-3 pr-4">R:R</th>}
            {!compact && <th className="pb-3 pr-4">Setup</th>}
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr
              key={trade.id}
              className="border-b cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/trades/${trade.id}`)}
            >
              <td className="py-3 pr-4">
                {format(parseISO(trade.entry_date), compact ? 'MMM dd' : 'MMM dd, yyyy HH:mm')}
              </td>
              <td className="py-3 pr-4 font-medium">{trade.instrument}</td>
              <td className="py-3 pr-4">
                <Badge variant={trade.direction === 'long' ? 'success' : 'destructive'} className="gap-1">
                  {trade.direction === 'long' ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {trade.direction.toUpperCase()}
                </Badge>
              </td>
              {!compact && <td className="py-3 pr-4">{trade.entry_price}</td>}
              {!compact && <td className="py-3 pr-4">{trade.exit_price ?? '-'}</td>}
              <td className={`py-3 pr-4 font-semibold ${getPnlColor(trade.pnl)}`}>
                {trade.pnl !== null ? formatCurrency(trade.pnl) : '-'}
              </td>
              {!compact && (
                <td className="py-3 pr-4">
                  {trade.risk_reward_ratio ? `1:${trade.risk_reward_ratio.toFixed(1)}` : '-'}
                </td>
              )}
              {!compact && (
                <td className="py-3 pr-4">
                  {trade.setup && <Badge variant="outline">{trade.setup}</Badge>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
