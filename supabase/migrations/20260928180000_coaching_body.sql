-- =====================================================================
-- MoveHaus Acompanhamento — Sub-fase D: corpo
-- Peso/medidas, check-in semanal, hidratação e fotos antes-e-depois.
-- Tudo PRIVADO: o aluno vê/gera o próprio; admin apenas lê (coaching).
-- Fotos em bucket privado 'progress' (URLs assinadas geradas no servidor).
-- =====================================================================

create table if not exists public.body_metrics (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  measured_on date not null default current_date,
  weight      numeric(6,2),
  waist       numeric(6,2),
  hip         numeric(6,2),
  arm         numeric(6,2),
  chest       numeric(6,2),
  thigh       numeric(6,2),
  body_fat    numeric(5,2),
  notes       text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists body_metrics_user_idx on public.body_metrics (user_id, measured_on desc);

create table if not exists public.checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  week_start  date not null default current_date,
  energy      smallint,        -- 1..5
  sleep       smallint,
  nutrition   smallint,
  disposition smallint,
  pain        text not null default '',
  difficulty  text not null default '',
  notes       text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists checkins_user_idx on public.checkins (user_id, created_at desc);

create table if not exists public.hydration_logs (
  user_id    uuid not null references auth.users (id) on delete cascade,
  day        date not null default current_date,
  total_ml   integer not null default 0,
  goal_ml    integer not null default 2000,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table if not exists public.progress_photos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  taken_on     date not null default current_date,
  note         text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists progress_photos_user_idx on public.progress_photos (user_id, taken_on desc);

-- =====================================================================
-- RLS: dono faz tudo no próprio; admin apenas lê.
-- =====================================================================
alter table public.body_metrics    enable row level security;
alter table public.checkins        enable row level security;
alter table public.hydration_logs  enable row level security;
alter table public.progress_photos enable row level security;

drop policy if exists body_metrics_owner on public.body_metrics;
create policy body_metrics_owner on public.body_metrics
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists body_metrics_admin_read on public.body_metrics;
create policy body_metrics_admin_read on public.body_metrics
  for select using (public.is_admin());

drop policy if exists checkins_owner on public.checkins;
create policy checkins_owner on public.checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists checkins_admin_read on public.checkins;
create policy checkins_admin_read on public.checkins
  for select using (public.is_admin());

drop policy if exists hydration_owner on public.hydration_logs;
create policy hydration_owner on public.hydration_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists hydration_admin_read on public.hydration_logs;
create policy hydration_admin_read on public.hydration_logs
  for select using (public.is_admin());

-- fotos: SÓ o dono (nem admin lê por padrão — privacidade forte na Sub-fase D)
drop policy if exists progress_photos_owner on public.progress_photos;
create policy progress_photos_owner on public.progress_photos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Storage: bucket privado de fotos de evolução ----------
insert into storage.buckets (id, name, public)
values ('progress', 'progress', false)
on conflict (id) do nothing;
