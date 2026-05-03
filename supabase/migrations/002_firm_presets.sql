-- ============================================================
-- FIRM PRESETS (user-managed master list)
-- ============================================================
create table public.firm_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  max_daily_loss_pct numeric(5,2),
  max_total_drawdown_pct numeric(5,2),
  profit_target_pct numeric(5,2),
  trailing_drawdown boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.firm_presets enable row level security;
create policy "Users manage own firm presets" on public.firm_presets for all using (auth.uid() = user_id);
