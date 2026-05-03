import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { MARKET_TYPES, TRADE_DIRECTIONS } from '@/lib/constants'
import type { PropAccount } from '@/types/database'

interface TradeFiltersProps {
  accounts: PropAccount[]
  filters: {
    accountId: string
    market: string
    instrument: string
    direction: string
    dateFrom: string
    dateTo: string
  }
  onFilterChange: (key: string, value: string) => void
}

export function TradeFilters({ accounts, filters, onFilterChange }: TradeFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        options={[{ value: '', label: 'All Accounts' }, ...accounts.map((a) => ({
          value: a.id,
          label: `${a.firm_name}${a.account_label ? ` - ${a.account_label}` : ''}`
        }))]}
        value={filters.accountId}
        onChange={(e) => onFilterChange('accountId', e.target.value)}
        className="w-48"
      />
      <Select
        options={[{ value: '', label: 'All Markets' }, ...MARKET_TYPES]}
        value={filters.market}
        onChange={(e) => onFilterChange('market', e.target.value)}
        className="w-36"
      />
      <Select
        options={[{ value: '', label: 'All Directions' }, ...TRADE_DIRECTIONS]}
        value={filters.direction}
        onChange={(e) => onFilterChange('direction', e.target.value)}
        className="w-36"
      />
      <Input
        placeholder="Search instrument..."
        value={filters.instrument}
        onChange={(e) => onFilterChange('instrument', e.target.value)}
        className="w-40"
      />
      <Input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => onFilterChange('dateFrom', e.target.value)}
        className="w-36"
      />
      <Input
        type="date"
        value={filters.dateTo}
        onChange={(e) => onFilterChange('dateTo', e.target.value)}
        className="w-36"
      />
    </div>
  )
}
