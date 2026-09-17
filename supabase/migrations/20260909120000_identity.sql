-- =====================================================================
-- MoveHaus — Fase 3: Identidade, papéis e RLS
-- Perfis (1:1 com auth.users), papéis (admin/customer), is_admin(),
-- criação automática de perfil no cadastro e políticas RLS.
--
-- Segurança: o papel NUNCA vem do navegador. O cadastro sempre cria
-- 'customer'; promover a 'admin' é feito manualmente no banco (ver
-- supabase/README.md).
-- =====================================================================

-- ---------- Enum de papéis ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'customer');
  end if;
end $$;

-- ---------- Perfis ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  whatsapp   text,
  email      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil do cliente (1:1 com auth.users).';

-- ---------- Papéis ----------
create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       public.app_role not null default 'customer',
  created_at timestamptz not null default now()
);

comment on table public.user_roles is 'Papel de cada usuário. Fonte de verdade do acesso admin.';

-- ---------- is_admin(): SECURITY DEFINER evita recursão nas policies ----------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is 'True se o usuário autenticado tem papel admin. Usada nas policies.';

-- ---------- updated_at automático ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- Cria perfil + papel 'customer' ao registrar ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, whatsapp, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'whatsapp',
    new.email
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')          -- papel sempre 'customer' no cadastro
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- RLS
-- =====================================================================
alter table public.profiles   enable row level security;
alter table public.user_roles enable row level security;

-- profiles: o dono lê/edita o próprio; admin lê/edita todos
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- user_roles: o dono lê o próprio papel; só admin escreve
drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists user_roles_admin_write on public.user_roles;
create policy user_roles_admin_write on public.user_roles
  for all using (public.is_admin()) with check (public.is_admin());
