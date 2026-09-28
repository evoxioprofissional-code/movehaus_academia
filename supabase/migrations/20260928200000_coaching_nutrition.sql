-- =====================================================================
-- MoveHaus Acompanhamento — Sub-fase E: nutrição
-- Plano alimentar (refeições + itens), adesão do aluno, receitas.
-- Admin/nutri monta; aluno vê o próprio e marca refeições feitas.
-- =====================================================================

create table if not exists public.meal_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null default 'Plano alimentar',
  notes      text not null default '',
  active     boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists meal_plans_user_idx on public.meal_plans (user_id);

create table if not exists public.meals (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.meal_plans (id) on delete cascade,
  name       text not null default 'Refeição',
  time_label text not null default '',
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists meals_plan_idx on public.meals (plan_id, position);

create table if not exists public.meal_items (
  id            uuid primary key default gen_random_uuid(),
  meal_id       uuid not null references public.meals (id) on delete cascade,
  food          text not null,
  quantity      text not null default '',
  substitutions text not null default '',
  notes         text not null default '',
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists meal_items_meal_idx on public.meal_items (meal_id, position);

create table if not exists public.meal_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  meal_id    uuid not null references public.meals (id) on delete cascade,
  day        date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, meal_id, day)
);

create table if not exists public.recipes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  ingredients text not null default '',
  steps       text not null default '',
  active      boolean not null default true,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists meal_plans_set_updated_at on public.meal_plans;
create trigger meal_plans_set_updated_at before update on public.meal_plans
  for each row execute function public.set_updated_at();
drop trigger if exists recipes_set_updated_at on public.recipes;
create trigger recipes_set_updated_at before update on public.recipes
  for each row execute function public.set_updated_at();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.meal_plans enable row level security;
alter table public.meals      enable row level security;
alter table public.meal_items enable row level security;
alter table public.meal_logs  enable row level security;
alter table public.recipes    enable row level security;

drop policy if exists meal_plans_select on public.meal_plans;
create policy meal_plans_select on public.meal_plans
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists meal_plans_admin_write on public.meal_plans;
create policy meal_plans_admin_write on public.meal_plans
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists meals_select on public.meals;
create policy meals_select on public.meals
  for select using (
    public.is_admin() or exists (
      select 1 from public.meal_plans p where p.id = plan_id and p.user_id = auth.uid()
    )
  );
drop policy if exists meals_admin_write on public.meals;
create policy meals_admin_write on public.meals
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists meal_items_select on public.meal_items;
create policy meal_items_select on public.meal_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.meals m
      join public.meal_plans p on p.id = m.plan_id
      where m.id = meal_id and p.user_id = auth.uid()
    )
  );
drop policy if exists meal_items_admin_write on public.meal_items;
create policy meal_items_admin_write on public.meal_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists meal_logs_owner on public.meal_logs;
create policy meal_logs_owner on public.meal_logs
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- receitas: assinantes ativos leem; admin gerencia
drop policy if exists recipes_select on public.recipes;
create policy recipes_select on public.recipes
  for select using ((active and public.has_coaching_access()) or public.is_admin());
drop policy if exists recipes_admin_write on public.recipes;
create policy recipes_admin_write on public.recipes
  for all using (public.is_admin()) with check (public.is_admin());
