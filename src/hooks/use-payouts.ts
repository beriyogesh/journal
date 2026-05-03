import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Payout } from '@/types/database'
import type { PayoutFormData } from '@/lib/validators'

export function usePayouts(accountId?: string) {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayouts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('payouts')
      .select('*')
      .order('payout_date', { ascending: false })

    if (accountId) query = query.eq('account_id', accountId)

    const { data, error } = await query
    if (error) throw error
    setPayouts(data ?? [])
    setLoading(false)
  }, [accountId])

  useEffect(() => {
    fetchPayouts()
  }, [fetchPayouts])

  const createPayout = async (formData: PayoutFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('payouts').insert({
      user_id: user.id,
      account_id: formData.account_id,
      amount: formData.amount,
      currency: formData.currency,
      payout_date: formData.payout_date,
      status: formData.status,
      notes: formData.notes || null,
    })

    if (error) throw error
    await fetchPayouts()
  }

  const deletePayout = async (id: string) => {
    const { error } = await supabase.from('payouts').delete().eq('id', id)
    if (error) throw error
    await fetchPayouts()
  }

  const totalPayouts = payouts
    .filter((p) => p.status === 'received')
    .reduce((sum, p) => sum + p.amount, 0)

  return { payouts, loading, fetchPayouts, createPayout, deletePayout, totalPayouts }
}
