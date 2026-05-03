import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Trade } from '@/types/database'
import type { TradeFormData } from '@/lib/validators'

interface TradeFilters {
  accountId?: string
  market?: string
  instrument?: string
  direction?: string
  dateFrom?: string
  dateTo?: string
  setup?: string
}

export function useTrades(filters?: TradeFilters) {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('trades')
      .select('*')
      .order('entry_date', { ascending: false })

    if (filters?.accountId) query = query.eq('account_id', filters.accountId)
    if (filters?.market) query = query.eq('market', filters.market)
    if (filters?.direction) query = query.eq('direction', filters.direction)
    if (filters?.instrument) query = query.ilike('instrument', `%${filters.instrument}%`)
    if (filters?.dateFrom) query = query.gte('entry_date', filters.dateFrom)
    if (filters?.dateTo) query = query.lte('entry_date', filters.dateTo)
    if (filters?.setup) query = query.eq('setup', filters.setup)

    const { data, error } = await query
    if (error) throw error
    setTrades(data ?? [])
    setLoading(false)
  }, [filters?.accountId, filters?.market, filters?.instrument, filters?.direction, filters?.dateFrom, filters?.dateTo, filters?.setup])

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  const createTrade = async (formData: TradeFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase.from('trades').insert({
      user_id: user.id,
      account_id: formData.account_id,
      market: formData.market,
      instrument: formData.instrument.toUpperCase(),
      direction: formData.direction,
      status: formData.status,
      entry_price: formData.entry_price,
      exit_price: formData.exit_price ?? null,
      stop_loss: formData.stop_loss ?? null,
      take_profit: formData.take_profit ?? null,
      lot_size: formData.lot_size ?? null,
      contracts: formData.contracts ?? null,
      shares: formData.shares ?? null,
      quantity: formData.quantity ?? null,
      commission: formData.commission,
      swap: formData.swap,
      pnl: formData.pnl ?? null,
      pnl_pips: formData.pnl_pips ?? null,
      pnl_ticks: formData.pnl_ticks ?? null,
      pnl_percent: formData.pnl_percent ?? null,
      entry_date: formData.entry_date,
      exit_date: formData.exit_date ?? null,
      risk_amount: formData.risk_amount ?? null,
      risk_percent: formData.risk_percent ?? null,
      setup: formData.setup ?? null,
      notes: formData.notes || null,
      session: formData.session ?? null,
      mistakes: formData.mistakes || null,
      tag_ids: formData.tag_ids,
    }).select().single()

    if (error) throw error
    await fetchTrades()
    return data
  }

  const updateTrade = async (id: string, formData: Partial<TradeFormData>) => {
    const { error } = await supabase
      .from('trades')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    await fetchTrades()
  }

  const deleteTrade = async (id: string) => {
    const { error } = await supabase.from('trades').delete().eq('id', id)
    if (error) throw error
    await fetchTrades()
  }

  return { trades, loading, fetchTrades, createTrade, updateTrade, deleteTrade }
}
