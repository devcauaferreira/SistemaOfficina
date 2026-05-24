# Supabase SQL

Este arquivo contém os comandos SQL para criar o banco de dados do Sistema de Mecânica.

## Como usar

1. Abra o projeto no Supabase.
2. Vá para `SQL editor`.
3. Cole o conteúdo de `schema.sql` ou importe o arquivo.
4. Execute para criar as tabelas, triggers, políticas RLS e permissões.

## O que está incluído

- `clientes`
- `notas`
- `estoque`
- RLS habilitado em todas as tabelas
- políticas para usuários `authenticated`
- `created_at` / `updated_at` automáticos
- `created_by` com `auth.uid()` para auditoria
