import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { TradeScreenshot, ScreenshotType } from '@/types/database'

export function useScreenshots(tradeId?: string) {
  const [screenshots, setScreenshots] = useState<TradeScreenshot[]>([])
  const [loading, setLoading] = useState(false)

  const fetchScreenshots = useCallback(async () => {
    if (!tradeId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('trade_screenshots')
      .select('*')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: true })

    if (error) throw error
    setScreenshots(data ?? [])
    setLoading(false)
  }, [tradeId])

  useEffect(() => {
    fetchScreenshots()
  }, [fetchScreenshots])

  const uploadScreenshot = async (
    tradeId: string,
    file: File,
    type: ScreenshotType = 'other',
    caption?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const timestamp = Date.now()
    const storagePath = `${user.id}/${tradeId}/${timestamp}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('trade-screenshots')
      .upload(storagePath, file)

    if (uploadError) throw uploadError

    const { error: dbError } = await supabase.from('trade_screenshots').insert({
      user_id: user.id,
      trade_id: tradeId,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      screenshot_type: type,
      caption: caption || null,
    })

    if (dbError) throw dbError
    await fetchScreenshots()
  }

  const deleteScreenshot = async (id: string, storagePath: string) => {
    await supabase.storage.from('trade-screenshots').remove([storagePath])
    const { error } = await supabase.from('trade_screenshots').delete().eq('id', id)
    if (error) throw error
    await fetchScreenshots()
  }

  const getSignedUrl = async (storagePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(storagePath, 3600) // 1 hour

    if (error) throw error
    return data.signedUrl
  }

  return { screenshots, loading, uploadScreenshot, deleteScreenshot, getSignedUrl }
}
