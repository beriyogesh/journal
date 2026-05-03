import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TradeForm } from '@/components/trades/trade-form'
import { useAccounts } from '@/hooks/use-accounts'
import { useTrades } from '@/hooks/use-trades'
import type { TradeFormData } from '@/lib/validators'

export function TradeAddPage() {
  const navigate = useNavigate()
  const { accounts } = useAccounts()
  const { createTrade } = useTrades()

  const handleSubmit = async (data: TradeFormData) => {
    const trade = await createTrade(data) as any
    if (trade?.id) {
      navigate(`/trades/${trade.id}`)
    } else {
      navigate('/trades')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Log Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeForm accounts={accounts} onSubmit={handleSubmit} onCancel={() => navigate('/trades')} />
        </CardContent>
      </Card>
    </div>
  )
}
