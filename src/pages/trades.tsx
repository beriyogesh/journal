import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TradeTable } from '@/components/trades/trade-table'
import { TradeFilters } from '@/components/trades/trade-filters'
import { useAccounts } from '@/hooks/use-accounts'
import { useTrades } from '@/hooks/use-trades'
import { Plus } from 'lucide-react'

export function TradesPage() {
  const navigate = useNavigate()
  const { accounts } = useAccounts()
  const [filters, setFilters] = useState({
    accountId: '',
    market: '',
    instrument: '',
    direction: '',
    dateFrom: '',
    dateTo: '',
  })

  const { trades, loading } = useTrades({
    accountId: filters.accountId || undefined,
    market: filters.market || undefined,
    instrument: filters.instrument || undefined,
    direction: filters.direction || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trades</h1>
        <Button onClick={() => navigate('/trades/new')} className="gap-2">
          <Plus className="h-4 w-4" /> Log Trade
        </Button>
      </div>

      <TradeFilters accounts={accounts} filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <TradeTable trades={trades} />
      )}
    </div>
  )
}
