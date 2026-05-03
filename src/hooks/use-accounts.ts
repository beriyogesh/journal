import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PropAccount } from '@/types/database'
import type { AccountFormData } from '@/lib/validators'

export function useAccounts() {
  const [accounts, setAccounts] = useState<PropAccount[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('prop_accounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setAccounts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const createAccount = async (formData: AccountFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('prop_accounts').insert({
      user_id: user.id,
      firm_name: formData.firm_name,
      account_label: formData.account_label || null,
      account_size: formData.account_size,
      currency: formData.currency,
      phase: formData.phase,
      status: formData.status,
      max_daily_loss: formData.max_daily_loss ?? null,
      max_daily_loss_pct: formData.max_daily_loss_pct ?? null,
      max_total_drawdown: formData.max_total_drawdown ?? null,
      max_total_drawdown_pct: formData.max_total_drawdown_pct ?? null,
      profit_target: formData.profit_target ?? null,
      profit_target_pct: formData.profit_target_pct ?? null,
      trailing_drawdown: formData.trailing_drawdown,
      start_date: formData.start_date,
      end_date: formData.end_date ?? null,
      starting_balance: formData.starting_balance,
      current_balance: formData.starting_balance,
      notes: formData.notes || null,
    })

    if (error) throw error
    await fetchAccounts()
  }

  const updateAccount = async (id: string, formData: Partial<AccountFormData>) => {
    const { error } = await supabase
      .from('prop_accounts')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    await fetchAccounts()
  }

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from('prop_accounts').delete().eq('id', id)
    if (error) throw error
    await fetchAccounts()
  }

  return { accounts, loading, fetchAccounts, createAccount, updateAccount, deleteAccount }
}

export function useAccount(id: string | undefined) {
  const [account, setAccount] = useState<PropAccount | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }

    supabase
      .from('prop_accounts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error)
        setAccount(data)
        setLoading(false)
      })
  }, [id])

  return { account, loading }
}
