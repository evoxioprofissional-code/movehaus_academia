-- =====================================================================
-- MoveHaus Acompanhamento — Sub-fase B: treino do aluno
-- Plano semanal -> dias -> exercícios; sessões (modo treino) e logs de carga.
-- RLS: aluno vê/gera o próprio; admin gerencia tudo.
-- =====================================================================

create table if not exists public.workout_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null default 'Plano de treino',
  active     boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workout_plans_user_idx on public.workout_plans (user_id);

create table if not exists public.workout_days (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.workout_plans (id) on delete cascade,
  weekday    smallint,                 -- 1=seg .. 7=dom (null = sem dia fixo)
  name       text not null default 'Treino',
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists workout_days_plan_idx on public.workout_days (plan_id, position);

create table if not exists public.workout_exercises (
  id           uuid primary key default gen_random_uuid(),
  day_id       uuid not null references public.workout_days (id) on delete cascade,
  name         text not null,
  sets         int not null default 3,
  reps         text not null default '10-12',
  target_load  text not null default '',
  rest_seconds int not null default 60,
  video_url    text,
  notes        text not null default '',
  position     int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists workout_exercises_day_idx on public.workout_exercises (day_id, position);

create table if not exists public.workout_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  day_id      uuid references public.workout_days (id) on delete set null,
  day_name    text not null default '',
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  feeling     text,                    -- 'leve' | 'adequado' | 'pesado'
  discomfort  text not null default '',
  notes       text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists workout_sessions_user_idx on public.workout_sessions (user_id, started_at desc);

create table if not exists public.exercise_logs (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id   uuid references public.workout_exercises (id) on delete set null,
  exercise_name text not null default '',
  set_number    int not null,
  reps_done     int,
  load_used     numeric(10,2),
  created_at    timestamptz not null default now()
);
create index if not exists exercise_logs_session_idx on public.exercise_logs (session_id);
create index if not exists exercise_logs_exercise_idx on public.exercise_logs (exercise_id, created_at desc);

drop trigger if exists workout_plans_set_updated_at on public.workout_plans;
create trigger workout_plans_set_updated_at before update on public.workout_plans
  for each row execute function public.set_updated_at();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.workout_plans     enable row level security;
alter table public.workout_days      enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.exercise_logs     enable row level security;

-- planos: dono lê o próprio; admin tudo
drop policy if exists workout_plans_select on public.workout_plans;
create policy workout_plans_select on public.workout_plans
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists workout_plans_admin_write on public.workout_plans;
create policy workout_plans_admin_write on public.workout_plans
  for all using (public.is_admin()) with check (public.is_admin());

-- dias: via dono do plano; admin tudo
drop policy if exists workout_days_select on public.workout_days;
create policy workout_days_select on public.workout_days
  for select using (
    public.is_admin() or exists (
      select 1 from public.workout_plans p
      where p.id = plan_id and p.user_id = auth.uid()
    )
  );
drop policy if exists workout_days_admin_write on public.workout_days;
create policy workout_days_admin_write on public.workout_days
  for all using (public.is_admin()) with check (public.is_admin());

-- exercícios: via dono do dia/plano; admin tudo
drop policy if exists workout_exercises_select on public.workout_exercises;
create policy workout_exercises_select on public.workout_exercises
  for select using (
    public.is_admin() or exists (
      select 1 from public.workout_days d
      join public.workout_plans p on p.id = d.plan_id
      where d.id = day_id and p.user_id = auth.uid()
    )
  );
drop policy if exists workout_exercises_admin_write on public.workout_exercises;
create policy workout_exercises_admin_write on public.workout_exercises
  for all using (public.is_admin()) with check (public.is_admin());

-- sessões: o próprio aluno cria/lê; admin lê
drop policy if exists workout_sessions_rw on public.workout_sessions;
create policy workout_sessions_rw on public.workout_sessions
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- logs: via dono da sessão; admin lê
drop policy if exists exercise_logs_rw on public.exercise_logs;
create policy exercise_logs_rw on public.exercise_logs
  for all using (
    public.is_admin() or exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
