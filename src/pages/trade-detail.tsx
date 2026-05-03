import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TradeForm } from '@/components/trades/trade-form'
import { ScreenshotUpload } from '@/components/trades/screenshot-upload'
import { useAccounts } from '@/hooks/use-accounts'
import { useTrades } from '@/hooks/use-trades'
import { formatCurrency, getPnlColor } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { Edit, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { Trade } from '@/types/database'
import type { TradeFormData } from '@/lib/validators'

export function TradeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { accounts } = useAccounts()
  const { trades, updateTrade, deleteTrade } = useTrades()
  const [editing, setEditing] = useState(false)
  const [trade, setTrade] = useState<Trade | null>(null)

  useEffect(() => {
    const found = trades.find((t) => t.id === id)
    if (found) setTrade(found)
  }, [trades, id])

  if (!trade) return <div className="text-muted-foreground">Loading...</div>

  const account = accounts.find((a) => a.id === trade.account_id)

  const handleUpdate = async (data: TradeFormData) => {
    await updateTrade(trade.id, data)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this trade?')) {
      await deleteTrade(trade.id)
      navigate('/trades')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{trade.instrument}</h1>
          <Badge variant={trade.direction === 'long' ? 'success' : 'destructive'} className="gap-1">
            {trade.direction === 'long' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trade.direction.toUpperCase()}
          </Badge>
          {trade.setup && <Badge variant="outline">{trade.setup}</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1">
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trade Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Account" value={account ? `${account.firm_name}${account.account_label ? ` - ${account.account_label}` : ''}` : '-'} />
            <Row label="Market" value={trade.market.toUpperCase()} />
            <Row label="Entry Price" value={trade.entry_price.toString()} />
            <Row label="Exit Price" value={trade.exit_price?.toString() ?? '-'} />
            <Row label="Stop Loss" value={trade.stop_loss?.toString() ?? '-'} />
            <Row label="Take Profit" value={trade.take_profit?.toString() ?? '-'} />
            {trade.lot_size && <Row label="Lot Size" value={trade.lot_size.toString()} />}
            {trade.contracts && <Row label="Contracts" value={trade.contracts.toString()} />}
            {trade.shares && <Row label="Shares" value={trade.shares.toString()} />}
            {trade.quantity && <Row label="Quantity" value={trade.quantity.toString()} />}
            <Row label="Session" value={trade.session ?? '-'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">P&L & Risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">P&L</span>
              <span className={`font-bold text-lg ${getPnlColor(trade.pnl)}`}>
                {trade.pnl !== null ? formatCurrency(trade.pnl) : '-'}
              </span>
            </div>
            {trade.pnl_pips !== null && <Row label="Pips" value={trade.pnl_pips.toString()} />}
            {trade.pnl_ticks !== null && <Row label="Ticks" value={trade.pnl_ticks.toString()} />}
            <Row label="Commission" value={formatCurrency(trade.commission)} />
            <Row label="Swap" value={formatCurrency(trade.swap)} />
            <Row label="Risk Amount" value={trade.risk_amount ? formatCurrency(trade.risk_amount) : '-'} />
            <Row label="Risk %" value={trade.risk_percent ? `${trade.risk_percent}%` : '-'} />
            <Row label="R:R Ratio" value={trade.risk_reward_ratio ? `1:${trade.risk_reward_ratio.toFixed(1)}` : '-'} />
            <Row label="Duration" value={trade.duration_minutes ? `${trade.duration_minutes} min` : '-'} />
          </CardContent>
        </Card>
      </div>

      {/* Timing */}
      <Card>
        <CardContent className="p-4 flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Entry: </span>
            <span>{format(parseISO(trade.entry_date), 'MMM d, yyyy HH:mm')}</span>
          </div>
          {trade.exit_date && (
            <div>
              <span className="text-muted-foreground">Exit: </span>
              <span>{format(parseISO(trade.exit_date), 'MMM d, yyyy HH:mm')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {(trade.notes || trade.mistakes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trade.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Trade Notes</p>
                <p className="text-sm whitespace-pre-wrap">{trade.notes}</p>
              </div>
            )}
            {trade.mistakes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Mistakes / Lessons</p>
                <p className="text-sm whitespace-pre-wrap">{trade.mistakes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Screenshots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Screenshots</CardTitle>
        </CardHeader>
        <CardContent>
          <ScreenshotUpload tradeId={trade.id} />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-4xl" onClose={() => setEditing(false)}>
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
          </DialogHeader>
          <TradeForm accounts={accounts} trade={trade} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
