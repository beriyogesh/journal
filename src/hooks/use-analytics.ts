import { useMemo } from 'react'
import type { Trade } from '@/types/database'
import { format, parseISO, getDay } from 'date-fns'

export interface OverviewMetrics {
  totalTrades: number
  winRate: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  expectancy: number
  totalPnl: number
  bestTrade: number
  worstTrade: number
}

export interface EquityPoint {
  date: string
  balance: number
  pnl: number
}

export interface CalendarDay {
  date: string
  pnl: number
  trades: number
}

export interface GroupedPerformance {
  name: string
  trades: number
  winRate: number
  pnl: number
  avgPnl: number
}

export interface StreakData {
  currentWinStreak: number
  currentLossStreak: number
  maxWinStreak: number
  maxLossStreak: number
}

export function useAnalytics(trades: Trade[]) {
  const closedTrades = useMemo(
    () => trades.filter((t) => t.status === 'closed' && t.pnl !== null),
    [trades]
  )

  const overview = useMemo((): OverviewMetrics => {
    if (closedTrades.length === 0) {
      return { totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0, profitFactor: 0, expectancy: 0, totalPnl: 0, bestTrade: 0, worstTrade: 0 }
    }

    const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0)
    const losses = closedTrades.filter((t) => (t.pnl ?? 0) < 0)
    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
    const grossWin = wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl ?? 0), 0))

    return {
      totalTrades: closedTrades.length,
      winRate: (wins.length / closedTrades.length) * 100,
      avgWin: wins.length > 0 ? grossWin / wins.length : 0,
      avgLoss: losses.length > 0 ? grossLoss / losses.length : 0,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? Infinity : 0,
      expectancy: totalPnl / closedTrades.length,
      totalPnl,
      bestTrade: Math.max(...closedTrades.map((t) => t.pnl ?? 0)),
      worstTrade: Math.min(...closedTrades.map((t) => t.pnl ?? 0)),
    }
  }, [closedTrades])

  const equityCurve = useMemo((): EquityPoint[] => {
    const sorted = [...closedTrades].sort(
      (a, b) => new Date(a.exit_date ?? a.entry_date).getTime() - new Date(b.exit_date ?? b.entry_date).getTime()
    )
    let cumulative = 0
    return sorted.map((t) => {
      cumulative += t.pnl ?? 0
      return {
        date: format(parseISO(t.exit_date ?? t.entry_date), 'MMM dd'),
        balance: cumulative,
        pnl: t.pnl ?? 0,
      }
    })
  }, [closedTrades])

  const calendarData = useMemo((): CalendarDay[] => {
    const dayMap = new Map<string, { pnl: number; trades: number }>()

    closedTrades.forEach((t) => {
      const dateStr = format(parseISO(t.exit_date ?? t.entry_date), 'yyyy-MM-dd')
      const existing = dayMap.get(dateStr) ?? { pnl: 0, trades: 0 }
      dayMap.set(dateStr, {
        pnl: existing.pnl + (t.pnl ?? 0),
        trades: existing.trades + 1,
      })
    })

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }))
  }, [closedTrades])

  const performanceByInstrument = useMemo((): GroupedPerformance[] => {
    return groupBy(closedTrades, (t) => t.instrument)
  }, [closedTrades])

  const performanceBySetup = useMemo((): GroupedPerformance[] => {
    return groupBy(
      closedTrades.filter((t) => t.setup),
      (t) => t.setup ?? 'Unknown'
    )
  }, [closedTrades])

  const performanceByDay = useMemo((): GroupedPerformance[] => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return groupBy(closedTrades, (t) => dayNames[getDay(parseISO(t.entry_date))] ?? 'Unknown')
  }, [closedTrades])

  const performanceBySession = useMemo((): GroupedPerformance[] => {
    return groupBy(
      closedTrades.filter((t) => t.session),
      (t) => t.session ?? 'Unknown'
    )
  }, [closedTrades])

  const streaks = useMemo((): StreakData => {
    const sorted = [...closedTrades].sort(
      (a, b) => new Date(a.exit_date ?? a.entry_date).getTime() - new Date(b.exit_date ?? b.entry_date).getTime()
    )

    let currentWin = 0, currentLoss = 0, maxWin = 0, maxLoss = 0

    for (const t of sorted) {
      if ((t.pnl ?? 0) > 0) {
        currentWin++
        currentLoss = 0
        maxWin = Math.max(maxWin, currentWin)
      } else if ((t.pnl ?? 0) < 0) {
        currentLoss++
        currentWin = 0
        maxLoss = Math.max(maxLoss, currentLoss)
      }
    }

    return {
      currentWinStreak: currentWin,
      currentLossStreak: currentLoss,
      maxWinStreak: maxWin,
      maxLossStreak: maxLoss,
    }
  }, [closedTrades])

  const monthlyBreakdown = useMemo(() => {
    const monthMap = new Map<string, { trades: number; wins: number; pnl: number; fees: number }>()

    closedTrades.forEach((t) => {
      const month = format(parseISO(t.exit_date ?? t.entry_date), 'yyyy-MM')
      const existing = monthMap.get(month) ?? { trades: 0, wins: 0, pnl: 0, fees: 0 }
      monthMap.set(month, {
        trades: existing.trades + 1,
        wins: existing.wins + ((t.pnl ?? 0) > 0 ? 1 : 0),
        pnl: existing.pnl + (t.pnl ?? 0),
        fees: existing.fees + (t.commission + t.swap),
      })
    })

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({
        month: format(parseISO(`${month}-01`), 'MMM yyyy'),
        ...data,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      }))
  }, [closedTrades])

  const drawdownData = useMemo(() => {
    let peak = 0
    let cumulative = 0

    return [...closedTrades]
      .sort((a, b) => new Date(a.exit_date ?? a.entry_date).getTime() - new Date(b.exit_date ?? b.entry_date).getTime())
      .map((t) => {
        cumulative += t.pnl ?? 0
        peak = Math.max(peak, cumulative)
        const drawdown = peak > 0 ? ((peak - cumulative) / peak) * 100 : 0

        return {
          date: format(parseISO(t.exit_date ?? t.entry_date), 'MMM dd'),
          drawdown,
          cumulative,
        }
      })
  }, [closedTrades])

  return {
    overview,
    equityCurve,
    calendarData,
    performanceByInstrument,
    performanceBySetup,
    performanceByDay,
    performanceBySession,
    streaks,
    monthlyBreakdown,
    drawdownData,
  }
}

function groupBy(trades: Trade[], keyFn: (t: Trade) => string): GroupedPerformance[] {
  const groups = new Map<string, Trade[]>()

  for (const trade of trades) {
    const key = keyFn(trade)
    const existing = groups.get(key) ?? []
    existing.push(trade)
    groups.set(key, existing)
  }

  return Array.from(groups.entries())
    .map(([name, group]) => {
      const wins = group.filter((t) => (t.pnl ?? 0) > 0).length
      const pnl = group.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
      return {
        name,
        trades: group.length,
        winRate: (wins / group.length) * 100,
        pnl,
        avgPnl: pnl / group.length,
      }
    })
    .sort((a, b) => b.pnl - a.pnl)
}
