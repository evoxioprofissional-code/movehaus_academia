-- =====================================================================
-- MoveHaus Acompanhamento — Sub-fase A: fundação e acesso
-- coaching_access: quem tem direito à área do aluno. Agora liberado
-- manualmente pelo admin; na Fase 5 a assinatura passa a gravar aqui.
-- =====================================================================

create table if not exists public.coaching_access (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  active     boolean not null default true,
  source     text not null default 'manual',      -- 'manual' | 'subscription'
  granted_by uuid references public.profiles (id) on delete set null,
  starts_at  timestamptz not null default now(),
  expires_at timestamptz,                          -- null = sem expiração
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.coaching_access is
  'Direito de acesso à área de Acompanhamento. Fonte da verdade do gate.';

drop trigger if exists coaching_access_set_updated_at on public.coaching_access;
create trigger coaching_access_set_updated_at
  before update on public.coaching_access
  for each row execute function public.set_updated_at();

-- Verificação de acesso no servidor (usada no app e em futuras RLS da área).
create or replace function public.has_coaching_access(uid uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.coaching_access ca
    where ca.user_id = uid
      and ca.active
      and (ca.expires_at is null or ca.expires_at > now())
  );
$$;

comment on function public.has_coaching_access(uuid) is
  'True se o usuário tem acesso válido à área de Acompanhamento.';

-- RLS: o aluno lê o próprio acesso; admin gerencia tudo.
alter table public.coaching_access enable row level security;

drop policy if exists coaching_access_select on public.coaching_access;
create policy coaching_access_select on public.coaching_access
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists coaching_access_admin_write on public.coaching_access;
create policy coaching_access_admin_write on public.coaching_access
  for all using (public.is_admin()) with check (public.is_admin());
