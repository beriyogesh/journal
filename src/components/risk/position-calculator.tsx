import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { MARKET_TYPES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'

export function PositionCalculator() {
  const [balance, setBalance] = useState('')
  const [riskPercent, setRiskPercent] = useState('1')
  const [stopLossDistance, setStopLossDistance] = useState('')
  const [market, setMarket] = useState('forex')

  const riskAmount = balance && riskPercent
    ? parseFloat(balance) * (parseFloat(riskPercent) / 100)
    : 0

  const calculateSize = () => {
    if (!stopLossDistance || !riskAmount) return null
    const sl = parseFloat(stopLossDistance)
    if (sl === 0) return null

    switch (market) {
      case 'forex':
        // Assuming standard lot (100,000 units), SL in pips
        return { value: (riskAmount / (sl * 10)).toFixed(2), unit: 'lots' }
      case 'futures':
        // SL in ticks, assume $12.50/tick for ES
        return { value: Math.floor(riskAmount / (sl * 12.5)).toString(), unit: 'contracts' }
      case 'stocks':
        // SL in dollars per share
        return { value: Math.floor(riskAmount / sl).toString(), unit: 'shares' }
      case 'crypto':
        // SL in price difference
        return { value: (riskAmount / sl).toFixed(4), unit: 'units' }
      default:
        return null
    }
  }

  const result = calculateSize()
  const slLabel = {
    forex: 'Stop Loss (pips)',
    futures: 'Stop Loss (ticks)',
    stocks: 'Stop Loss ($/share)',
    options: 'Stop Loss ($)',
    crypto: 'Stop Loss (price diff)',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Position Size Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Account Balance</Label>
            <Input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="100000"
            />
          </div>

          <div className="space-y-2">
            <Label>Risk per Trade (%)</Label>
            <Input
              type="number"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              placeholder="1"
            />
          </div>

          <div className="space-y-2">
            <Label>Market</Label>
            <Select
              options={[...MARKET_TYPES]}
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{slLabel[market as keyof typeof slLabel]}</Label>
            <Input
              type="number"
              step="any"
              value={stopLossDistance}
              onChange={(e) => setStopLossDistance(e.target.value)}
              placeholder="20"
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Risk Amount:</span>
            <span className="font-semibold text-amber-500">{formatCurrency(riskAmount)}</span>
          </div>
          {result && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Position Size:</span>
              <span className="font-bold text-lg">{result.value} {result.unit}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
