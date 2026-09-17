# Supabase — MoveHaus

Migrations versionadas em `supabase/migrations/` (ordem por nome/data).

## Como aplicar as migrations

Escolha uma opção:

### A) SQL Editor (mais simples, sem instalar nada)
1. Abra o painel do projeto → **SQL Editor**.
2. Cole o conteúdo de cada arquivo de `supabase/migrations/` **na ordem** e execute.

### B) Supabase CLI
```bash
supabase link --project-ref twwheefndelbacqzpgto
supabase db push
```
(Requer a senha do banco do projeto.)

## Autenticação (configuração no painel)
- **Authentication → Providers → Email**: habilite e-mail/senha.
- Para desenvolvimento, é possível desativar "Confirm email" (senão o cadastro
  exige confirmação por e-mail antes do primeiro login).
- **Authentication → URL Configuration → Redirect URLs**: adicione
  `http://localhost:3000/auth/callback` (e a URL de produção quando houver).

## Promover o primeiro administrador
O cadastro cria sempre `customer`. Para tornar alguém admin, rode no SQL Editor:

```sql
update public.user_roles
set role = 'admin'
where user_id = (select id from auth.users where email = 'SEU_EMAIL_AQUI');
```

## Gerar os tipos TypeScript (opcional, após aplicar)
```bash
supabase gen types typescript --project-id twwheefndelbacqzpgto --schema public > src/types/database.ts
```
Enquanto isso, `src/types/database.ts` é mantido à mão e corresponde às migrations.
