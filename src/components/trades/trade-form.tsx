import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tradeSchema, type TradeFormData } from '@/lib/validators'
import { MARKET_TYPES, TRADE_DIRECTIONS, TRADING_SESSIONS, DEFAULT_SETUPS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { PropAccount, Trade } from '@/types/database'

interface TradeFormProps {
  accounts: PropAccount[]
  trade?: Trade | null
  onSubmit: (data: TradeFormData) => Promise<void>
  onCancel: () => void
}

export function TradeForm({ accounts, trade, onSubmit, onCancel }: TradeFormProps) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: trade
      ? {
          account_id: trade.account_id,
          market: trade.market,
          instrument: trade.instrument,
          direction: trade.direction,
          status: trade.status,
          entry_price: trade.entry_price,
          exit_price: trade.exit_price,
          stop_loss: trade.stop_loss,
          take_profit: trade.take_profit,
          lot_size: trade.lot_size,
          contracts: trade.contracts,
          shares: trade.shares,
          quantity: trade.quantity,
          commission: trade.commission,
          swap: trade.swap,
          pnl: trade.pnl,
          pnl_pips: trade.pnl_pips,
          pnl_ticks: trade.pnl_ticks,
          pnl_percent: trade.pnl_percent,
          entry_date: trade.entry_date.slice(0, 16),
          exit_date: trade.exit_date?.slice(0, 16) ?? '',
          risk_amount: trade.risk_amount,
          risk_percent: trade.risk_percent,
          setup: trade.setup,
          notes: trade.notes ?? '',
          session: trade.session,
          mistakes: trade.mistakes ?? '',
          tag_ids: trade.tag_ids,
        }
      : {
          status: 'closed',
          commission: 0,
          swap: 0,
          tag_ids: [],
          entry_date: new Date().toISOString().slice(0, 16),
        },
  })

  const market = watch('market')

  const sizeLabel = {
    forex: 'Lot Size',
    futures: 'Contracts',
    stocks: 'Shares',
    options: 'Contracts',
    crypto: 'Quantity',
  }

  const sizeField = {
    forex: 'lot_size' as const,
    futures: 'contracts' as const,
    stocks: 'shares' as const,
    options: 'contracts' as const,
    crypto: 'quantity' as const,
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Account & Market */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Account *</Label>
          <Select
            options={accounts.filter((a) => a.status === 'active').map((a) => ({
              value: a.id,
              label: `${a.firm_name}${a.account_label ? ` - ${a.account_label}` : ''}`
            }))}
            placeholder="Select account"
            {...register('account_id')}
          />
          {errors.account_id && <p className="text-sm text-red-500">{errors.account_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Market *</Label>
          <Select options={[...MARKET_TYPES]} {...register('market')} />
        </div>

        <div className="space-y-2">
          <Label>Instrument *</Label>
          <Input {...register('instrument')} placeholder="e.g. EUR/USD, ES, AAPL" />
          {errors.instrument && <p className="text-sm text-red-500">{errors.instrument.message}</p>}
        </div>
      </div>

      {/* Direction & Sizing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Direction *</Label>
          <Select options={[...TRADE_DIRECTIONS]} {...register('direction')} />
        </div>

        {market && (
          <div className="space-y-2">
            <Label>{sizeLabel[market]}</Label>
            <Input
              type="number"
              step={market === 'forex' ? '0.01' : market === 'crypto' ? '0.00000001' : '1'}
              {...register(sizeField[market])}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Session</Label>
          <Select
            options={[{ value: '', label: 'None' }, ...TRADING_SESSIONS]}
            {...register('session')}
          />
        </div>
      </div>

      {/* Prices */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Entry Price *</Label>
          <Input type="number" step="any" {...register('entry_price')} />
          {errors.entry_price && <p className="text-sm text-red-500">{errors.entry_price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Exit Price</Label>
          <Input type="number" step="any" {...register('exit_price')} />
        </div>

        <div className="space-y-2">
          <Label>Stop Loss</Label>
          <Input type="number" step="any" {...register('stop_loss')} />
        </div>

        <div className="space-y-2">
          <Label>Take Profit</Label>
          <Input type="number" step="any" {...register('take_profit')} />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Entry Date/Time *</Label>
          <Input type="datetime-local" {...register('entry_date')} />
        </div>

        <div className="space-y-2">
          <Label>Exit Date/Time</Label>
          <Input type="datetime-local" {...register('exit_date')} />
        </div>
      </div>

      {/* P&L & Fees */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>P&L ($)</Label>
          <Input type="number" step="0.01" {...register('pnl')} placeholder="Realized P&L" />
        </div>

        {market === 'forex' && (
          <div className="space-y-2">
            <Label>P&L (Pips)</Label>
            <Input type="number" step="0.1" {...register('pnl_pips')} />
          </div>
        )}

        {market === 'futures' && (
          <div className="space-y-2">
            <Label>P&L (Ticks)</Label>
            <Input type="number" step="0.1" {...register('pnl_ticks')} />
          </div>
        )}

        <div className="space-y-2">
          <Label>Commission</Label>
          <Input type="number" step="0.01" {...register('commission')} />
        </div>

        <div className="space-y-2">
          <Label>Swap</Label>
          <Input type="number" step="0.01" {...register('swap')} />
        </div>
      </div>

      {/* Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Risk Amount ($)</Label>
          <Input type="number" step="0.01" {...register('risk_amount')} />
        </div>

        <div className="space-y-2">
          <Label>Risk %</Label>
          <Input type="number" step="0.01" {...register('risk_percent')} />
        </div>
      </div>

      {/* Setup & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Setup/Strategy</Label>
          <Select
            options={[
              { value: '', label: 'None' },
              ...DEFAULT_SETUPS.map((s) => ({ value: s, label: s })),
            ]}
            {...register('setup')}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            options={[
              { value: 'closed', label: 'Closed' },
              { value: 'open', label: 'Open' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            {...register('status')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Trade Notes</Label>
        <Textarea {...register('notes')} placeholder="What was your reasoning?" rows={3} />
      </div>

      <div className="space-y-2">
        <Label>Mistakes / Lessons</Label>
        <Textarea {...register('mistakes')} placeholder="What would you do differently?" rows={2} />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : trade ? 'Update Trade' : 'Log Trade'}
        </Button>
      </div>
    </form>
  )
}
