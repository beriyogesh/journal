import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DailyJournal } from '@/types/database'
import type { JournalFormData } from '@/lib/validators'

export function useJournals() {
  const [journals, setJournals] = useState<DailyJournal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchJournals = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_journals')
      .select('*')
      .order('journal_date', { ascending: false })

    if (error) throw error
    setJournals(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  const upsertJournal = async (formData: JournalFormData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('daily_journals').upsert(
      {
        user_id: user.id,
        journal_date: formData.journal_date,
        pre_market_plan: formData.pre_market_plan || null,
        post_market_review: formData.post_market_review || null,
        mood: formData.mood ?? null,
        market_conditions: formData.market_conditions || null,
        daily_goals: formData.daily_goals || null,
        notes: formData.notes || null,
        lessons_learned: formData.lessons_learned || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,journal_date' }
    )

    if (error) throw error
    await fetchJournals()
  }

  const deleteJournal = async (id: string) => {
    const { error } = await supabase.from('daily_journals').delete().eq('id', id)
    if (error) throw error
    await fetchJournals()
  }

  return { journals, loading, fetchJournals, upsertJournal, deleteJournal }
}

export function useJournalByDate(date: string) {
  const [journal, setJournal] = useState<DailyJournal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!date) { setLoading(false); return }

    supabase
      .from('daily_journals')
      .select('*')
      .eq('journal_date', date)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error(error)
        setJournal(data)
        setLoading(false)
      })
  }, [date])

  return { journal, loading }
}
