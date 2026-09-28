-- =====================================================================
-- MoveHaus Acompanhamento — Sub-fase C: engajamento
-- Pontos, conquistas, metas e recompensas. Escritas sensíveis (pontos,
-- conquistas, resgates) são feitas pelo servidor via service role;
-- o cliente só lê o próprio. Metas/recompensas: admin gerencia.
-- =====================================================================

create table if not exists public.points_ledger (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  points     integer not null,               -- negativo em resgates
  reason     text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists points_ledger_user_idx on public.points_ledger (user_id, created_at desc);

create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  type        text not null default 'custom', -- 'frequency_week' | 'total_workouts' | 'custom'
  target      numeric(10,2) not null default 1,
  period      text,                           -- 'week' | 'all' | null
  status      text not null default 'active', -- 'active' | 'achieved'
  created_by  uuid references public.profiles (id) on delete set null,
  achieved_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists goals_user_idx on public.goals (user_id, status);

create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  code        text not null,
  title       text not null,
  achieved_at timestamptz not null default now(),
  unique (user_id, code)
);

create table if not exists public.rewards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  cost_points integer not null default 0,
  type        text not null default 'other',  -- discount|coupon|product|content|other
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  reward_id    uuid references public.rewards (id) on delete set null,
  reward_title text not null default '',
  points_spent integer not null default 0,
  status       text not null default 'pending', -- pending|approved|rejected
  created_at   timestamptz not null default now(),
  decided_at   timestamptz
);
create index if not exists reward_redemptions_user_idx on public.reward_redemptions (user_id, created_at desc);

drop trigger if exists rewards_set_updated_at on public.rewards;
create trigger rewards_set_updated_at before update on public.rewards
  for each row execute function public.set_updated_at();

-- Saldo de pontos (para exibição/checagem).
create or replace function public.points_balance(uid uuid default auth.uid())
returns integer language sql security definer set search_path = public stable as $$
  select coalesce(sum(points), 0)::int from public.points_ledger where user_id = uid;
$$;

-- =====================================================================
-- RLS  (escritas sensíveis via service role; cliente só lê o próprio)
-- =====================================================================
alter table public.points_ledger      enable row level security;
alter table public.goals              enable row level security;
alter table public.achievements       enable row level security;
alter table public.rewards            enable row level security;
alter table public.reward_redemptions enable row level security;

drop policy if exists points_ledger_select on public.points_ledger;
create policy points_ledger_select on public.points_ledger
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists goals_select on public.goals;
create policy goals_select on public.goals
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists goals_admin_write on public.goals;
create policy goals_admin_write on public.goals
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists achievements_select on public.achievements;
create policy achievements_select on public.achievements
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists rewards_select on public.rewards;
create policy rewards_select on public.rewards
  for select using (active or public.is_admin());
drop policy if exists rewards_admin_write on public.rewards;
create policy rewards_admin_write on public.rewards
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists reward_redemptions_select on public.reward_redemptions;
create policy reward_redemptions_select on public.reward_redemptions
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists reward_redemptions_admin_write on public.reward_redemptions;
create policy reward_redemptions_admin_write on public.reward_redemptions
  for all using (public.is_admin()) with check (public.is_admin());
