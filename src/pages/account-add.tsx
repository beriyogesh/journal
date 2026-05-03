import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccountForm } from '@/components/accounts/account-form'
import { useAccounts } from '@/hooks/use-accounts'
import type { AccountFormData } from '@/lib/validators'

export function AccountAddPage() {
  const navigate = useNavigate()
  const { createAccount } = useAccounts()

  const handleSubmit = async (data: AccountFormData) => {
    await createAccount(data)
    navigate('/accounts')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Prop Firm Account</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm onSubmit={handleSubmit} onCancel={() => navigate('/accounts')} />
        </CardContent>
      </Card>
    </div>
  )
}
