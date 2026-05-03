import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { FirmPreset } from '@/types/firm-preset'
import { PROP_FIRMS } from '@/lib/constants'

export interface FirmPresetFormData {
  name: string
  max_daily_loss_pct: number | null
  max_total_drawdown_pct: number | null
  profit_target_pct: number | null
  trailing_drawdown: boolean
  notes?: string
}

export function useFirmPresets() {
  const [presets, setPresets] = useState<FirmPreset[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPresets = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('firm_presets')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    setPresets(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPresets()
  }, [fetchPresets])

  const createPreset = async (formData: FirmPresetFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('firm_presets').insert({
      user_id: user.id,
      name: formData.name,
      max_daily_loss_pct: formData.max_daily_loss_pct,
      max_total_drawdown_pct: formData.max_total_drawdown_pct,
      profit_target_pct: formData.profit_target_pct,
      trailing_drawdown: formData.trailing_drawdown,
      notes: formData.notes || null,
    })

    if (error) throw error
    await fetchPresets()
  }

  const updatePreset = async (id: string, formData: Partial<FirmPresetFormData>) => {
    const { error } = await supabase
      .from('firm_presets')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    await fetchPresets()
  }

  const deletePreset = async (id: string) => {
    const { error } = await supabase.from('firm_presets').delete().eq('id', id)
    if (error) throw error
    await fetchPresets()
  }

  const seedDefaults = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const inserts = PROP_FIRMS.map((f) => ({
      user_id: user.id,
      name: f.name,
      max_daily_loss_pct: f.defaultMaxDailyLossPct,
      max_total_drawdown_pct: f.defaultMaxDrawdownPct,
      profit_target_pct: f.defaultProfitTargetPct,
      trailing_drawdown: false,
    }))

    const { error } = await supabase.from('firm_presets').upsert(inserts, { onConflict: 'user_id,name' })
    if (error) throw error
    await fetchPresets()
  }

  return { presets, loading, fetchPresets, createPreset, updatePreset, deletePreset, seedDefaults }
}
