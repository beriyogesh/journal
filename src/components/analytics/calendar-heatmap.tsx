import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'
import type { CalendarDay } from '@/hooks/use-analytics'

export function CalendarHeatmap({ data }: { data: CalendarDay[] }) {
  const today = new Date()
  const monthStart = startOfMonth(subMonths(today, 2))
  const monthEnd = endOfMonth(today)

  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDay>()
    data.forEach((d) => map.set(d.date, d))
    return map
  }, [data])

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getColor = (pnl: number | undefined) => {
    if (pnl === undefined) return 'bg-muted'
    if (pnl > 500) return 'bg-emerald-500'
    if (pnl > 100) return 'bg-emerald-400'
    if (pnl > 0) return 'bg-emerald-300'
    if (pnl === 0) return 'bg-muted'
    if (pnl > -100) return 'bg-red-300'
    if (pnl > -500) return 'bg-red-400'
    return 'bg-red-500'
  }

  const weeks: Date[][] = []
  let currentWeek: Date[] = []

  days.forEach((day) => {
    if (getDay(day) === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(day)
  })
  if (currentWeek.length > 0) weeks.push(currentWeek)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">P&L Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week.find((d) => getDay(d) === di)
                if (!day) return <div key={di} />

                const dateStr = format(day, 'yyyy-MM-dd')
                const calDay = dayMap.get(dateStr)

                return (
                  <div
                    key={di}
                    className={cn(
                      'aspect-square rounded-sm flex items-center justify-center text-xs relative group',
                      getColor(calDay?.pnl)
                    )}
                    title={calDay ? `${dateStr}: ${formatCurrency(calDay.pnl)} (${calDay.trades} trades)` : dateStr}
                  >
                    <span className="text-[10px] opacity-60">{format(day, 'd')}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground justify-center">
          <span>Loss</span>
          <div className="flex gap-0.5">
            {['bg-red-500', 'bg-red-400', 'bg-red-300', 'bg-muted', 'bg-emerald-300', 'bg-emerald-400', 'bg-emerald-500'].map(
              (c) => <div key={c} className={cn('w-3 h-3 rounded-sm', c)} />
            )}
          </div>
          <span>Profit</span>
        </div>
      </CardContent>
    </Card>
  )
}
