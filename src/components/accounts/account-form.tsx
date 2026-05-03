import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema, type AccountFormData } from '@/lib/validators'
import { ACCOUNT_PHASES, ACCOUNT_STATUSES } from '@/lib/constants'
import { useFirmPresets } from '@/hooks/use-firm-presets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { PropAccount } from '@/types/database'

interface AccountFormProps {
  account?: PropAccount | null
  onSubmit: (data: AccountFormData) => Promise<void>
  onCancel: () => void
}

export function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const { presets } = useFirmPresets()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: account
      ? {
          firm_name: account.firm_name,
          account_label: account.account_label ?? '',
          account_size: account.account_size,
          currency: account.currency,
          phase: account.phase,
          status: account.status,
          max_daily_loss: account.max_daily_loss,
          max_daily_loss_pct: account.max_daily_loss_pct,
          max_total_drawdown: account.max_total_drawdown,
          max_total_drawdown_pct: account.max_total_drawdown_pct,
          profit_target: account.profit_target,
          profit_target_pct: account.profit_target_pct,
          trailing_drawdown: account.trailing_drawdown,
          start_date: account.start_date,
          end_date: account.end_date,
          starting_balance: account.starting_balance,
          notes: account.notes ?? '',
        }
      : {
          currency: 'USD',
          phase: 'evaluation_phase1',
          status: 'active',
          trailing_drawdown: false,
          start_date: new Date().toISOString().split('T')[0],
        },
  })

  const firmName = watch('firm_name')
  const accountSize = watch('account_size')

  const handleFirmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setValue('firm_name', value)

    const preset = presets.find((p) => p.name === value)
    if (preset && accountSize) {
      if (preset.max_daily_loss_pct != null) {
        setValue('max_daily_loss_pct', preset.max_daily_loss_pct)
        setValue('max_daily_loss', (accountSize * preset.max_daily_loss_pct) / 100)
      }
      if (preset.max_total_drawdown_pct != null) {
        setValue('max_total_drawdown_pct', preset.max_total_drawdown_pct)
        setValue('max_total_drawdown', (accountSize * preset.max_total_drawdown_pct) / 100)
      }
      if (preset.profit_target_pct != null) {
        setValue('profit_target_pct', preset.profit_target_pct)
        setValue('profit_target', (accountSize * preset.profit_target_pct) / 100)
      }
      setValue('trailing_drawdown', preset.trailing_drawdown)
    }
  }

  const firmOptions = [
    ...presets.map((p) => ({ value: p.name, label: p.name })),
    { value: 'Other', label: 'Other' },
  ]

  const isOther = firmName === 'Other'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prop Firm</Label>
          <Select
            options={firmOptions}
            placeholder="Select firm"
            value={firmName}
            onChange={handleFirmChange}
          />
          {isOther && (
            <Input {...register('firm_name')} placeholder="Enter firm name" className="mt-2" />
          )}
          {errors.firm_name && <p className="text-sm text-red-500">{errors.firm_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Account Label (optional)</Label>
          <Input {...register('account_label')} placeholder="e.g. FTMO 100k #2" />
        </div>

        <div className="space-y-2">
          <Label>Account Size</Label>
          <Input type="number" step="0.01" {...register('account_size')} placeholder="100000" />
          {errors.account_size && <p className="text-sm text-red-500">{errors.account_size.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Starting Balance</Label>
          <Input type="number" step="0.01" {...register('starting_balance')} placeholder="100000" />
        </div>

        <div className="space-y-2">
          <Label>Phase</Label>
          <Select options={[...ACCOUNT_PHASES]} {...register('phase')} />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select options={[...ACCOUNT_STATUSES]} {...register('status')} />
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
            ]}
            {...register('currency')}
          />
        </div>

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" {...register('start_date')} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Risk Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Max Daily Loss (%)</Label>
            <Input type="number" step="0.01" {...register('max_daily_loss_pct')} />
          </div>
          <div className="space-y-2">
            <Label>Max Daily Loss ($)</Label>
            <Input type="number" step="0.01" {...register('max_daily_loss')} />
          </div>
          <div className="space-y-2">
            <Label>Max Total Drawdown (%)</Label>
            <Input type="number" step="0.01" {...register('max_total_drawdown_pct')} />
          </div>
          <div className="space-y-2">
            <Label>Max Total Drawdown ($)</Label>
            <Input type="number" step="0.01" {...register('max_total_drawdown')} />
          </div>
          <div className="space-y-2">
            <Label>Profit Target (%)</Label>
            <Input type="number" step="0.01" {...register('profit_target_pct')} />
          </div>
          <div className="space-y-2">
            <Label>Profit Target ($)</Label>
            <Input type="number" step="0.01" {...register('profit_target')} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input type="checkbox" id="trailing" {...register('trailing_drawdown')} className="rounded" />
          <Label htmlFor="trailing">Trailing Drawdown</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea {...register('notes')} placeholder="Any additional notes..." rows={3} />
      </div>

      <div className="flex gap-