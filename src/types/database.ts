export type AccountPhase = 'evaluation_phase1' | 'evaluation_phase2' | 'funded' | 'payout'
export type AccountStatus = 'active' | 'breached' | 'passed' | 'payout' | 'inactive'
export type MarketType = 'forex' | 'futures' | 'stocks' | 'options' | 'crypto'
export type TradeDirection = 'long' | 'short'
export type TradeStatus = 'open' | 'closed' | 'cancelled'
export type ScreenshotType = 'before' | 'after' | 'other'
export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
export type PayoutStatus = 'pending' | 'received' | 'denied'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  default_currency: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface PropAccount {
  id: string
  user_id: string
  firm_name: string
  account_label: string | null
  account_size: number
  currency: string
  phase: AccountPhase
  status: AccountStatus
  max_daily_loss: number | null
  max_daily_loss_pct: number | null
  max_total_drawdown: number | null
  max_total_drawdown_pct: number | null
  profit_target: number | null
  profit_target_pct: number | null
  trailing_drawdown: boolean
  start_date: string
  end_date: string | null
  starting_balance: number
  current_balance: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  user_id: string
  account_id: string
  market: MarketType
  instrument: string
  direction: TradeDirection
  status: TradeStatus
  entry_price: number
  exit_price: number | null
  stop_loss: number | null
  take_profit: number | null
  lot_size: number | null
  contracts: number | null
  shares: number | null
  quantity: number | null
  commission: number
  swap: number
  pnl: number | null
  pnl_pips: number | null
  pnl_ticks: number | null
  pnl_percent: number | null
  entry_date: string
  exit_date: string | null
  duration_minutes: number | null
  risk_amount: number | null
  risk_reward_ratio: number | null
  risk_percent: number | null
  setup: string | null
  notes: string | null
  session: string | null
  mistakes: string | null
  tag_ids: string[]
  created_at: string
  updated_at: string
}

export interface TradeTag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface TradeScreenshot {
  id: string
  user_id: string
  trade_id: string
  storage_path: string
  file_name: string
  file_size: number | null
  screenshot_type: ScreenshotType
  caption: string | null
  created_at: string
}

export interface DailyJournal {
  id: string
  user_id: string
  journal_date: string
  pre_market_plan: string | null
  post_market_review: string | null
  mood: MoodType | null
  market_conditions: string | null
  daily_goals: string | null
  notes: string | null
  lessons_learned: string | null
  created_at: string
  updated_at: string
}

export interface Payout {
  id: string
  user_id: string
  account_id: string
  amount: number
  currency: string
  payout_date: string
  status: PayoutStatus
  notes: string | null
  created_at: string
}

// Supabase Database type for typed client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      prop_accounts: {
        Row: PropAccount
        Insert: Omit<PropAccount, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PropAccount, 'id' | 'user_id' | 'created_at'>>
      }
      trades: {
        Row: Trade
        Insert: Omit<Trade, 'id' | 'created_at' | 'updated_at' | 'duration_minutes' | 'risk_reward_ratio'>
        Update: Partial<Omit<Trade, 'id' | 'user_id' | 'created_at'>>
      }
      trade_tags: {
        Row: TradeTag
        Insert: Omit<TradeTag, 'id' | 'created_at'>
        Update: Partial<Omit<TradeTag, 'id' | 'user_id' | 'created_at'>>
      }
      trade_screenshots: {
        Row: TradeScreenshot
        Insert: Omit<TradeScreenshot, 'id' | 'created_at'>
        Update: Partial<Omit<TradeScreenshot, 'id' | 'user_id' | 'created_at'>>
      }
      daily_journals: {
        Row: DailyJournal
        Insert: Omit<DailyJournal, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DailyJournal, 'id' | 'user_id' | 'created_at'>>
      }
      payouts: {
        Row: Payout
        Insert: Omit<Payout, 'id' | 'created_at'>
        Update: Partial<Omit<Payout, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
