import { z } from 'zod'

export const accountSchema = z.object({
  firm_name: z.string().min(1, 'Firm name is required'),
  account_label: z.string().optional(),
  account_size: z.coerce.number().positive('Account size must be positive'),
  currency: z.string().default('USD'),
  phase: z.enum(['evaluation_phase1', 'evaluation_phase2', 'funded', 'payout']),
  status: z.enum(['active', 'breached', 'passed', 'payout', 'inactive']),
  max_daily_loss: z.coerce.number().nullable().optional(),
  max_daily_loss_pct: z.coerce.number().nullable().optional(),
  max_total_drawdown: z.coerce.number().nullable().optional(),
  max_total_drawdown_pct: z.coerce.number().nullable().optional(),
  profit_target: z.coerce.number().nullable().optional(),
  profit_target_pct: z.coerce.number().nullable().optional(),
  trailing_drawdown: z.boolean().default(false),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().nullable().optional(),
  starting_balance: z.coerce.number().positive(),
  notes: z.string().optional(),
})

export type AccountFormData = z.infer<typeof accountSchema>

export const tradeSchema = z.object({
  account_id: z.string().min(1, 'Select an account'),
  market: z.enum(['forex', 'futures', 'stocks', 'options', 'crypto']),
  instrument: z.string().min(1, 'Instrument is required'),
  direction: z.enum(['long', 'short']),
  status: z.enum(['open', 'closed', 'cancelled']).default('closed'),
  entry_price: z.coerce.number().positive('Entry price is required'),
  exit_price: z.coerce.number().nullable().optional(),
  stop_loss: z.coerce.number().nullable().optional(),
  take_profit: z.coerce.number().nullable().optional(),
  lot_size: z.coerce.number().nullable().optional(),
  contracts: z.coerce.number().int().nullable().optional(),
  shares: z.coerce.number().int().nullable().optional(),
  quantity: z.coerce.number().nullable().optional(),
  commission: z.coerce.number().default(0),
  swap: z.coerce.number().default(0),
  pnl: z.coerce.number().nullable().optional(),
  pnl_pips: z.coerce.number().nullable().optional(),
  pnl_ticks: z.coerce.number().nullable().optional(),
  pnl_percent: z.coerce.number().nullable().optional(),
  entry_date: z.string().min(1, 'Entry date is required'),
  exit_date: z.string().nullable().optional(),
  risk_amount: z.coerce.number().nullable().optional(),
  risk_percent: z.coerce.number().nullable().optional(),
  setup: z.string().nullable().optional(),
  notes: z.string().optional(),
  session: z.string().nullable().optional(),
  mistakes: z.string().optional(),
  tag_ids: z.array(z.string()).default([]),
})

export type TradeFormData = z.infer<typeof tradeSchema>

export const journalSchema = z.object({
  journal_date: z.string().min(1, 'Date is required'),
  pre_market_plan: z.string().optional(),
  post_market_review: z.string().optional(),
  mood: z.enum(['great', 'good', 'neutral', 'bad', 'terrible']).nullable().optional(),
  market_conditions: z.string().optional(),
  daily_goals: z.string().optional(),
  notes: z.string().optional(),
  lessons_learned: z.string().optional(),
})

export type JournalFormData = z.infer<typeof journalSchema>

export const payoutSchema = z.object({
  account_id: z.string().min(1, 'Select an account'),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  payout_date: z.string().min(1, 'Payout date is required'),
  status: z.enum(['pending', 'received', 'denied']).default('pending'),
  notes: z.string().optional(),
})

export type PayoutFormData = z.infer<typeof payoutSchema>
