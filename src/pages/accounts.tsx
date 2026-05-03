import { useNavigate } from 'react-router-dom'
import { AccountCard } from '@/components/accounts/account-card'
import { Button } from '@/components/ui/button'
import { useAccounts } from '@/hooks/use-accounts'
import { Plus } from 'lucide-react'

export function AccountsPage() {
  const navigate = useNavigate()
  const { accounts, loading } = useAccounts()

  if (loading) return <div className="text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Prop Firm Accounts</h1>
        <Button onClick={() => navigate('/accounts/new')} className="gap-2">
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">No accounts yet. Add your first prop firm account to get started.</p>
          <Button onClick={() => navigate('/accounts/new')}>
            <Plus className="h-4 w-4 mr-2" /> Add Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  )
}
