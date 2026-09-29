-- =====================================================================
-- MoveHaus — imagens da página inicial editáveis pelo admin.
-- Cada "slot" da home (hero, galeria, oferta, sobre) guarda o caminho da
-- imagem no bucket público 'catalog'. Leitura pública; escrita só admin.
-- =====================================================================

create table if not exists public.home_media (
  key          text primary key,
  storage_path text not null,
  updated_at   timestamptz not null default now()
);

alter table public.home_media enable row level security;

drop policy if exists home_media_public_read on public.home_media;
create policy home_media_public_read on public.home_media
  for select using (true);

drop policy if exists home_media_admin_write on public.home_media;
create policy home_media_admin_write on public.home_media
  for all using (public.is_admin()) with check (public.is_admin());
