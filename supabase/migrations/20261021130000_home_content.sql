-- Textos da página inicial editáveis pelo admin (key -> value). Leitura pública;
-- escrita só admin. A home usa o valor do banco com fallback para o texto padrão.
create table if not exists public.home_content (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);
alter table public.home_content enable row level security;

drop policy if exists home_content_public_read on public.home_content;
create policy home_content_public_read on public.home_content for select using (true);

drop policy if exists home_content_admin_write on public.home_content;
create policy home_content_admin_write on public.home_content
  for all using (public.is_admin()) with check (public.is_admin());
