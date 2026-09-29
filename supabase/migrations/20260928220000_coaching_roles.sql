-- MoveHaus — papéis profissionais. ADD VALUE deve rodar FORA de transação
-- (rode estas linhas isoladas no SQL Editor, ou uma a uma).
alter type public.app_role add value if not exists 'professor';
alter type public.app_role add value if not exists 'nutricionista';
