-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  default_currency text not null default 'USD',
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PROP ACCOUNTS
-- ============================================================
create type account_phase as enum (
  'evaluation_phase1', 'evaluation_phase2', 'funded', 'payout'
);
create type account_status as enum (
  'active', 'breached', 'passed', 'payout', 'inactive'
);

create table public.prop_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  firm_name text not null,
  account_label text,
  account_size numeric(15,2) not null,
  currency text not null default 'USD',
  phase account_phase not null default 'evaluation_phase1',
  status account_status not null default 'active',
  max_daily_loss numeric(15,2),
  max_daily_loss_pct numeric(5,2),
  max_total_drawdown numeric(15,2),
  max_total_drawdown_pct numeric(5,2),
  profit_target numeric(15,2),
  profit_target_pct numeric(5,2),
  trailing_drawdown boolean not null default false,
  start_date date not null default current_date,
  end_date date,
  starting_balance numeric(15,2) not null,
  current_balance numeric(15,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prop_accounts_user on public.prop_accounts(user_id);
alter table public.prop_accounts enable row level security;
create policy "Users manage own accounts" on public.prop_accounts for all using (auth.uid() = user_id);

-- ============================================================
-- TRADE TAGS
-- ============================================================
create table public.trade_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.trade_tags enable row level security;
create policy "Users manage own tags" on public.trade_tags for all using (auth.uid() = user_id);

-- ============================================================
-- TRADES
-- ============================================================
create type market_type as enum ('forex', 'futures', 'stocks', 'options', 'crypto');
create type trade_direction as enum ('long', 'short');
create type trade_status as enum ('open', 'closed', 'cancelled');

create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.prop_accounts(id) on delete cascade,
  market market_type not null,
  instrument text not null,
  direction trade_direction not null,
  status trade_status not null default 'closed',
  entry_price numeric(18,8) not null,
  exit_price numeric(18,8),
  stop_loss numeric(18,8),
  take_profit numeric(18,8),
  lot_size numeric(12,4),
  contracts integer,
  shares integer,
  quantity numeric(18,8),
  commission numeric(10,2) not null default 0,
  swap numeric(10,2) not null default 0,
  pnl numeric(15,2),
  pnl_pips numeric(10,2),
  pnl_ticks numeric(10,2),
  pnl_percent numeric(8,4),
  entry_date timestamptz not null,
  exit_date timestamptz,
  duration_minutes integer,
  risk_amount numeric(15,2),
  risk_reward_ratio numeric(6,2),
  risk_percent numeric(5,2),
  setup text,
  notes text,
  session text,
  mistakes text,
  tag_ids uuid[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_trades_user on public.trades(user_id);
create index idx_trades_account on public.trades(account_id);
create index idx_trades_entry_date on public.trades(entry_date);
create index idx_trades_instrument on public.trades(instrument);
create index idx_trades_market on public.trades(market);

alter table public.trades enable row level security;
create policy "Users manage own trades" on public.trades for all using (auth.uid() = user_id);

-- ============================================================
-- TRADE SCREENSHOTS
-- ============================================================
create type screenshot_type as enum ('before', 'after', 'other');

create table public.trade_screenshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  trade_id uuid not null references public.trades(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size integer,
  screenshot_type screenshot_type not null default 'other',
  caption text,
  created_at timestamptz not null default now()
);

create index idx_screenshots_trade on public.trade_screenshots(trade_id);
alter table public.trade_screenshots enable row level security;
create policy "Users manage own screenshots" on public.trade_screenshots for all using (auth.uid() = user_id);

-- ============================================================
-- DAILY JOURNALS
-- ============================================================
create type mood_type as enum ('great', 'good', 'neutral', 'bad', 'terrible');

create table public.daily_journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  journal_date date not null,
  pre_market_plan text,
  post_market_review text,
  mood mood_type,
  market_conditions text,
  daily_goals text,
  notes text,
  lessons_learned text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, journal_date)
);

create index idx_journals_user_date on public.daily_journals(user_id, journal_date);
alter table public.daily_journals enable row level security;
create policy "Users manage own journals" on public.daily_journals for all using (auth.uid() = user_id);

-- ============================================================
-- PAYOUTS
-- ============================================================
create type payout_status as enum ('pending', 'received', 'denied');

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  account_id uuid not null references public.prop_accounts(id) on delete cascade,
  amount numeric(15,2) not null,
  currency text not null default 'USD',
  payout_date date not null,
  status payout_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create index idx_payouts_account on public.payouts(account_id);
alter table public.payouts enable row level security;
create policy "Users manage own payouts" on public.payouts for all using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('trade-screenshots', 'trade-screenshots', false);

create policy "Users upload own screenshots"
  on storage.objects for insert
  with check (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users read own screenshots"
  on storage.objects for select
  using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own screenshots"
  on storage.objects for delete
  using (bucket_id = 'trade-screenshots' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- TRIGGER: Auto-update account balance when trades change
-- ============================================================
create or replace function public.update_account_balance()
returns trigger as $$
declare
  target_account_id uuid;
begin
  target_account_id := coalesce(new.account_id, old.account_id);
  update public.prop_accounts
  set current_balance = starting_balance + coalesce(
    (select sum(pnl) from public.trades where account_id = target_account_id and status = 'closed'),
    0
  ),
  updated_at = now()
  where id = target_account_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_trade_change
  after insert or update or delete on public.trades
  for each row execute function public.update_account_balance();

-- ============================================================
-- TRIGGER: Auto-calculate trade duration and R:R
-- ============================================================
create or replace function public.calculate_trade_fields()
returns trigger as $$
begin
  if new.entry_date is not null and new.exit_date is not null then
    new.duration_minutes := extract(epoch from (new.exit_date - new.entry_date)) / 60;
  end if;

  if new.stop_loss is not null and new.take_profit is not null
     and new.entry_price is not null and new.stop_loss != new.entry_price then
    new.risk_reward_ratio := abs(new.take_profit - new.entry_price)
                           / abs(new.entry_price - new.stop_loss);
  end if;

  return new;
end;
$$ language plpgsql;

create trigger before_trade_upsert
  before insert or update on public.trades
  for each row execute function public.calculate_trade_fields();
