export const PROP_FIRMS = [
  { name: 'FTMO', defaultMaxDailyLossPct: 5, defaultMaxDrawdownPct: 10, defaultProfitTargetPct: 10 },
  { name: 'MyFundedFX', defaultMaxDailyLossPct: 5, defaultMaxDrawdownPct: 8, defaultProfitTargetPct: 8 },
  { name: 'TopStep', defaultMaxDailyLossPct: 4.5, defaultMaxDrawdownPct: 6, defaultProfitTargetPct: 6 },
  { name: 'Funded Trading Plus', defaultMaxDailyLossPct: 4, defaultMaxDrawdownPct: 6, defaultProfitTargetPct: 10 },
  { name: 'The5ers', defaultMaxDailyLossPct: 3, defaultMaxDrawdownPct: 6, defaultProfitTargetPct: 6 },
  { name: 'True Forex Funds', defaultMaxDailyLossPct: 5, defaultMaxDrawdownPct: 10, defaultProfitTargetPct: 8 },
  { name: 'Alpha Capital Group', defaultMaxDailyLossPct: 5, defaultMaxDrawdownPct: 10, defaultProfitTargetPct: 8 },
  { name: 'E8 Funding', defaultMaxDailyLossPct: 5, defaultMaxDrawdownPct: 8, defaultProfitTargetPct: 8 },
  { name: 'Apex Trader Funding', defaultMaxDailyLossPct: 0, defaultMaxDrawdownPct: 6, defaultProfitTargetPct: 8 },
  { name: 'Bulenox', defaultMaxDailyLossPct: 0, defaultMaxDrawdownPct: 5, defaultProfitTargetPct: 8 },
] as const

export const MARKET_TYPES = [
  { value: 'forex', label: 'Forex' },
  { value: 'futures', label: 'Futures' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'options', label: 'Options' },
  { value: 'crypto', label: 'Crypto' },
] as const

export const ACCOUNT_PHASES = [
  { value: 'evaluation_phase1', label: 'Phase 1 (Evaluation)' },
  { value: 'evaluation_phase2', label: 'Phase 2 (Verification)' },
  { value: 'funded', label: 'Funded' },
  { value: 'payout', label: 'Payout' },
] as const

export const ACCOUNT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'breached', label: 'Breached' },
  { value: 'passed', label: 'Passed' },
  { value: 'payout', label: 'Payout' },
  { value: 'inactive', label: 'Inactive' },
] as const

export const TRADE_DIRECTIONS = [
  { value: 'long', label: 'Long' },
  { value: 'short', label: 'Short' },
] as const

export const TRADING_SESSIONS = [
  { value: 'asian', label: 'Asian' },
  { value: 'london', label: 'London' },
  { value: 'new_york', label: 'New York' },
  { value: 'overlap', label: 'London/NY Overlap' },
] as const

export const MOODS = [
  { value: 'great', label: 'Great', emoji: '🟢' },
  { value: 'good', label: 'Good', emoji: '🟡' },
  { value: 'neutral', label: 'Neutral', emoji: '⚪' },
  { value: 'bad', label: 'Bad', emoji: '🟠' },
  { value: 'terrible', label: 'Terrible', emoji: '🔴' },
] as const

export const DEFAULT_SETUPS = [
  'Breakout',
  'Pullback',
  'Reversal',
  'Trend Following',
  'Range Trade',
  'Scalp',
  'News Trade',
  'Support/Resistance',
  'Fibonacci',
  'Moving Average',
  'Order Block',
  'Fair Value Gap',
  'Liquidity Sweep',
] as const

export const ACCOUNT_SIZES = [
  5000, 10000, 25000, 50000, 100000, 150000, 200000, 300000, 400000, 500000,
] as const
