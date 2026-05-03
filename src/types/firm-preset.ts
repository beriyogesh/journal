export interface FirmPreset {
  id: string
  user_id: string
  name: string
  max_daily_loss_pct: number | null
  max_total_drawdown_pct: number | null
  profit_target_pct: number | null
  trailing_drawdown: boolean
  notes: string | null
  created_at: string
  updated_at: string
}
