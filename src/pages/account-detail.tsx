import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AccountForm } from '@/components/accounts/account-form'
import { TradeTable } from '@/components/trades/trade-table'
import { DrawdownMonitor } from '@/components/risk/drawdown-monitor'
import { useAccount, useAccounts } from '@/hooks/use-accounts'
import { useTrades } from '@/hooks/use-trades'
import { usePayouts } from '@/hooks/use-payouts'
import { formatCurrency } from '@/lib/utils'
import { Edit, Trash2, Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { AccountFormData } from '@/lib/validators'

export function AccountDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { account, loading } = useAccount(id)
  const { updateAccount, deleteAccount } = useAccounts()
  const { trades } = useTrades({ accountId: id })
  const { payouts, createPayout, totalPayouts } = usePayouts(id)
  const [editing, setEditing] = useState(false)
  const [showPayoutForm, setShowPayoutForm] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayTrades = trades.filter((t) => t.entry_date.startsWith(today))

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (!account) return <div className="text-muted-foreground">Account not found</div>

  const handleUpdate = async (data: AccountFormData) => {
    await updateAccount(account.id, data)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this account and all associated trades?')) {
      await deleteAccount(account.id)
      navigate('/accounts')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{account.firm_name}</h1>
          {account.account_label && (
            <p className="text-muted-foreground">{account.account_label}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1">
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DrawdownMonitor account={account} todayTrades={todayTrades} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Size</span>
              <span>{formatCurrency(account.account_size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting Balance</span>
              <span>{formatCurrency(account.starting_balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Balance</span>
              <span className="font-semibold">{formatCurrency(account.current_balance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Payouts</span>
              <span className="text-emerald-500 font-semibold">{formatCurrency(totalPayouts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span>{format(parseISO(account.start_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trailing Drawdown</span>
              <Badge variant={account.trailing_drawdown ? 'warning' : 'secondary'}>
                {account.trailing_drawdown ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Payouts</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowPayoutForm(true)} className="gap-1">
            <Plus className="h-4 w-4" /> Add Payout
          </Button>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No payouts yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{format(parseISO(p.payout_date), 'MMM d, yyyy')}</td>
                    <td className="py-2 text-emerald-500 font-medium">{formatCurrency(p.amount)}</td>
                    <td className="py-2">
                      <Badge variant={p.status === 'received' ? 'success' : p.status === 'denied' ? 'destructive' : 'outline'}>
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Trades for this account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trades ({trades.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeTable trades={trades} />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-3xl" onClose={() => setEditing(false)}>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <AccountForm account={account} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </DialogContent>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog open={showPayoutForm} onOpenChange={setShowPayoutForm}>
        <DialogContent onClose={() => setShowPayoutForm(false)}>
          <DialogHeader>
            <DialogTitle>Add Payout</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = new FormData(e.currentTarget)
              await createPayout({
                account_id: account.id,
                amount: parseFloat(form.get('amount') as string),
                currency: account.currency,
                payout_date: form.get('payout_date') as string,
                status: form.get('status') as 'pending' | 'received' | 'denied',
                notes: (form.get('notes') as string) || undefined,
              })
              setShowPayoutForm(false)
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <input name="amount" type="number" step="0.01" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input name="payout_date" type="date" required defaultValue={today} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select name="status" defaultValue="received" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                <option value="pending">Pending</option>
                <option value="received">Received</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <input name="notes" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowPayoutForm(false)}>Cancel</Button>
              <Button type="submit">Save Payout</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
