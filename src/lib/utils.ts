import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatPnl(value: number, currency = 'USD'): string {
  const formatted = formatCurrency(Math.abs(value), currency)
  return value >= 0 ? `+${formatted}` : `-${formatted}`
}

export function calculatePnl(trade: {
  market: string
  direction: string
  entry_price: number
  exit_price: number | null
  lot_size?: number | null
  contracts?: number | null
  shares?: number | null
  quantity?: number | null
  commission?: number | null
}): number | null {
  if (!trade.exit_price) return null
  const dir = trade.direction === 'long' ? 1 : -1
  const diff = (trade.exit_price - trade.entry_price) * dir
  const commission = trade.commission ?? 0

  switch (trade.market) {
    case 'forex':
      return diff * (trade.lot_size ?? 0) * 100000 - commission
    case 'stocks':
      return diff * (trade.shares ?? 0) - commission
    case 'crypto':
      return diff * (trade.quantity ?? 0) - commission
    case 'futures':
    case 'options':
    default:
      return null // user enters P&L manually for these
  }
}

export function getRiskRewardRatio(
  entry: number,
  stopLoss: number,
  takeProfit: number
): number | null {
  const risk = Math.abs(entry - stopLoss)
  if (risk === 0) return null
  return Math.abs(takeProfit - entry) / risk
}

export function getTradeResult(pnl: number | null): 'win' | 'loss' | 'breakeven' | 'pending' {
  if (pnl === null) return 'pending'
  if (pnl > 0) return 'win'
  if (pnl < 0) return 'loss'
  return 'breakeven'
}

export function getPnlColor(pnl: number | null): string {
  if (pnl === null) return 'text-muted-foreground'
  if (pnl > 0) return 'text-emerald-500'
  if (pnl < 0) return 'text-red-500'
  return 'text-muted-foreground'
}

export function getDrawdownPercent(
  currentBalance: number,
  peakBalance: number
): number {
  if (peakBalance === 0) return 0
  return ((peakBalance - currentBalance) / peakBalance) * 100
}
