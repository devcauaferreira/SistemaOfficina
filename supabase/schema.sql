-- =========================================================
-- Sistema de Mecânica - Schema completo corrigido Supabase
-- Pode executar mais de uma vez sem erro de trigger/policies
-- =========================================================

-- Extensão necessária
create extension if not exists "pgcrypto";

-- =========================================================
-- Função de timestamp automático
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- =========================================================
-- Tabela: clientes
-- =========================================================
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  marca text not null,
  veiculo text not null,
  cor text not null default '',
  placa text not null,
  cpf text,
  cep text,
  rua text,
  numero text,
  bairro text,
  cidade text,
  estado text,
  complemento text,
  local text,
  descricao text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse antiga
alter table public.clientes add column if not exists nome text;
alter table public.clientes add column if not exists telefone text;
alter table public.clientes add column if not exists marca text;
alter table public.clientes add column if not exists veiculo text;
alter table public.clientes add column if not exists cor text default '';
alter table public.clientes add column if not exists placa text;
alter table public.clientes add column if not exists cpf text;
alter table public.clientes add column if not exists cep text;
alter table public.clientes add column if not exists rua text;
alter table public.clientes add column if not exists numero text;
alter table public.clientes add column if not exists bairro text;
alter table public.clientes add column if not exists cidade text;
alter table public.clientes add column if not exists estado text;
alter table public.clientes add column if not exists complemento text;
alter table public.clientes add column if not exists local text;
alter table public.clientes add column if not exists descricao text;
alter table public.clientes add column if not exists created_by uuid default auth.uid();
alter table public.clientes add column if not exists created_at timestamptz not null default now();
alter table public.clientes add column if not exists updated_at timestamptz not null default now();

update public.clientes set cor = '' where cor is null;

alter table public.clientes alter column cor set default '';
alter table public.clientes alter column cor set not null;

-- Normalizar CPFs vazios, inválidos e repetidos antes do índice único
update public.clientes
set cpf = null
where cpf is not null
  and (
    regexp_replace(cpf, '\D', '', 'g') = ''
    or length(regexp_replace(cpf, '\D', '', 'g')) <> 11
    or regexp_replace(cpf, '\D', '', 'g') in (
      '00000000000',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999'
    )
  );

with clientes_cpf_repetido as (
  select
    id,
    row_number() over (
      partition by regexp_replace(cpf, '\D', '', 'g')
      order by created_at asc, id asc
    ) as ordem
  from public.clientes
  where cpf is not null
    and regexp_replace(cpf, '\D', '', 'g') <> ''
)
update public.clientes c
set cpf = null
from clientes_cpf_repetido r
where c.id = r.id
  and r.ordem > 1;

-- Impedir CPF repetido, ignorando pontos e traços
create unique index if not exists clientes_cpf_unico_idx
on public.clientes ((regexp_replace(cpf, '\D', '', 'g')))
where cpf is not null and regexp_replace(cpf, '\D', '', 'g') <> '';

-- Trigger clientes
drop trigger if exists set_timestamp_clientes on public.clientes;

create trigger set_timestamp_clientes
before update on public.clientes
for each row
execute function public.set_updated_at();


-- =========================================================
-- Tabela: enderecos
-- =========================================================
create table if not exists public.enderecos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  cep text,
  rua text,
  numero text,
  bairro text,
  cidade text,
  estado text,
  complemento text,
  endereco_completo text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse antiga
alter table public.enderecos add column if not exists cliente_id uuid references public.clientes(id) on delete cascade;
alter table public.enderecos add column if not exists cep text;
alter table public.enderecos add column if not exists rua text;
alter table public.enderecos add column if not exists numero text;
alter table public.enderecos add column if not exists bairro text;
alter table public.enderecos add column if not exists cidade text;
alter table public.enderecos add column if not exists estado text;
alter table public.enderecos add column if not exists complemento text;
alter table public.enderecos add column if not exists endereco_completo text;
alter table public.enderecos add column if not exists created_by uuid default auth.uid();
alter table public.enderecos add column if not exists created_at timestamptz not null default now();
alter table public.enderecos add column if not exists updated_at timestamptz not null default now();

-- Trigger endereços
drop trigger if exists set_timestamp_enderecos on public.enderecos;

create trigger set_timestamp_enderecos
before update on public.enderecos
for each row
execute function public.set_updated_at();


-- =========================================================
-- Tabela: notas
-- =========================================================
create table if not exists public.notas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  cliente text not null,
  carro text not null,
  tipo text not null default 'Em aberto',
  servicos text not null,
  valor_servicos numeric(12,2) not null default 0,
  pecas jsonb not null default '[]'::jsonb,
  pagamento text not null,
  guincho boolean not null default false,
  valor_guincho numeric(12,2) not null default 0,
  desconto numeric(12,2) not null default 0,
  desconto_text text,
  valor_total numeric(12,2) not null default 0,
  valor_final numeric(12,2) not null default 0,
  valor_devido numeric(12,2) not null default 0,
  data_inicio timestamptz not null default now(),
  data_conclusao timestamptz,
  data_orcamento timestamptz,
  observacoes text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse antiga
alter table public.notas add column if not exists cliente_id uuid references public.clientes(id) on delete set null;
alter table public.notas add column if not exists cliente text;
alter table public.notas add column if not exists carro text;
alter table public.notas add column if not exists tipo text default 'Em aberto';
alter table public.notas add column if not exists servicos text;
alter table public.notas add column if not exists valor_servicos numeric(12,2) not null default 0;
alter table public.notas add column if not exists pecas jsonb not null default '[]'::jsonb;
alter table public.notas add column if not exists pagamento text;
alter table public.notas add column if not exists guincho boolean not null default false;
alter table public.notas add column if not exists valor_guincho numeric(12,2) not null default 0;
alter table public.notas add column if not exists desconto numeric(12,2) not null default 0;
alter table public.notas add column if not exists desconto_text text;
alter table public.notas add column if not exists valor_total numeric(12,2) not null default 0;
alter table public.notas add column if not exists valor_final numeric(12,2) not null default 0;
alter table public.notas add column if not exists valor_devido numeric(12,2) not null default 0;
alter table public.notas add column if not exists data_inicio timestamptz not null default now();
alter table public.notas add column if not exists data_conclusao timestamptz;
alter table public.notas add column if not exists data_orcamento timestamptz;
alter table public.notas add column if not exists observacoes text;
alter table public.notas add column if not exists created_by uuid default auth.uid();
alter table public.notas add column if not exists created_at timestamptz not null default now();
alter table public.notas add column if not exists updated_at timestamptz not null default now();

update public.notas set tipo = 'Em aberto' where tipo is null;
update public.notas set valor_servicos = 0 where valor_servicos is null;
update public.notas set pecas = '[]'::jsonb where pecas is null;
update public.notas set guincho = false where guincho is null;
update public.notas set valor_guincho = 0 where valor_guincho is null;
update public.notas set desconto = 0 where desconto is null;
update public.notas set valor_total = 0 where valor_total is null;
update public.notas set valor_final = 0 where valor_final is null;
update public.notas set valor_devido = 0 where valor_devido is null;
update public.notas set data_inicio = now() where data_inicio is null;

alter table public.notas alter column tipo set default 'Em aberto';
alter table public.notas alter column tipo set not null;
alter table public.notas alter column valor_servicos set default 0;
alter table public.notas alter column valor_servicos set not null;
alter table public.notas alter column pecas set default '[]'::jsonb;
alter table public.notas alter column pecas set not null;
alter table public.notas alter column guincho set default false;
alter table public.notas alter column guincho set not null;
alter table public.notas alter column valor_guincho set default 0;
alter table public.notas alter column valor_guincho set not null;
alter table public.notas alter column desconto set default 0;
alter table public.notas alter column desconto set not null;
alter table public.notas alter column valor_total set default 0;
alter table public.notas alter column valor_total set not null;
alter table public.notas alter column valor_final set default 0;
alter table public.notas alter column valor_final set not null;
alter table public.notas alter column valor_devido set default 0;
alter table public.notas alter column valor_devido set not null;
alter table public.notas alter column data_inicio set default now();
alter table public.notas alter column data_inicio set not null;

-- Trigger notas
drop trigger if exists set_timestamp_notas on public.notas;

create trigger set_timestamp_notas
before update on public.notas
for each row
execute function public.set_updated_at();


-- =========================================================
-- Tabela: estoque
-- =========================================================
create table if not exists public.estoque (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  quantidade integer not null default 0,
  preco numeric(12,2) not null default 0,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garantir colunas caso a tabela já existisse antiga
alter table public.estoque add column if not exists nome text;
alter table public.estoque add column if not exists quantidade integer not null default 0;
alter table public.estoque add column if not exists preco numeric(12,2) not null default 0;
alter table public.estoque add column if not exists created_by uuid default auth.uid();
alter table public.estoque add column if not exists created_at timestamptz not null default now();
alter table public.estoque add column if not exists updated_at timestamptz not null default now();

update public.estoque set quantidade = 0 where quantidade is null;
update public.estoque set preco = 0 where preco is null;

alter table public.estoque alter column quantidade set default 0;
alter table public.estoque alter column quantidade set not null;
alter table public.estoque alter column preco set default 0;
alter table public.estoque alter column preco set not null;

-- Trigger estoque
drop trigger if exists set_timestamp_estoque on public.estoque;

create trigger set_timestamp_estoque
before update on public.estoque
for each row
execute function public.set_updated_at();


-- =========================================================
-- Estoque inicial sem duplicar itens
-- =========================================================
with itens(nome, quantidade, preco) as (
  values
    ('Óleo de motor 5W30', 20, 42.90),
    ('Óleo de motor 10W40', 20, 36.90),
    ('Óleo de motor 15W40', 20, 32.90),
    ('Filtro de óleo', 30, 28.90),
    ('Filtro de ar', 25, 39.90),
    ('Filtro de combustível', 20, 34.90),
    ('Filtro de cabine/ar-condicionado', 20, 44.90),
    ('Vela de ignição', 40, 29.90),
    ('Cabo de vela', 40, 45.90),
    ('Fluido de freio DOT3', 15, 24.90),
    ('Fluido de freio DOT4', 15, 34.90),
    ('Aditivo de radiador', 15, 35.90),
    ('Água desmineralizada', 30, 8.90),
    ('Fluido de direção hidráulica', 15, 29.90),
    ('Limpador de para-brisa', 50, 14.90),
    ('Pastilha de freio dianteira', 40, 119.90),
    ('Sapata de freio traseira', 40, 109.90),
    ('Disco de freio comum', 30, 149.90),
    ('Cilindro de roda', 20, 59.90),
    ('Flexível de freio', 25, 39.90),
    ('Sensor de ABS', 20, 129.90),
    ('Kit mola/trava de freio', 15, 24.90),
    ('Bucha de bandeja', 25, 49.90),
    ('Pivô', 30, 69.90),
    ('Terminal de direção', 30, 79.90),
    ('Axial', 25, 64.90),
    ('Bieleta', 25, 54.90),
    ('Coxim de amortecedor', 20, 89.90),
    ('Rolamento de roda', 30, 119.90),
    ('Amortecedor de alta saída', 20, 289.90),
    ('Coifa de homocinética', 25, 39.90),
    ('Graxa para rolamento', 20, 19.90),
    ('Fusível variado', 60, 2.50),
    ('Relé universal', 30, 24.90),
    ('Lâmpada H1', 30, 24.90),
    ('Lâmpada H4', 30, 29.90),
    ('Lâmpada H7', 30, 34.90),
    ('Lâmpada Pingo', 25, 9.90),
    ('Lâmpada de ré', 25, 12.90),
    ('Conector elétrico', 50, 6.90),
    ('Terminal de bateria', 40, 18.90),
    ('Chicote universal', 20, 59.90),
    ('Interruptor universal', 35, 24.90),
    ('Bateria', 10, 459.90),
    ('Fita isolante', 50, 7.90),
    ('Termo retrátil', 50, 1.50),
    ('Mangueira universal', 30, 24.90),
    ('Abraçadeira variada', 100, 1.20),
    ('Válvula termostática', 20, 89.90),
    ('Tampa de reservatório', 20, 24.90),
    ('Sensor de temperatura', 15, 49.90),
    ('Reservatório de expansão universal', 15, 69.90),
    ('Correia dentada', 20, 119.90),
    ('Correia poly-v', 20, 79.90),
    ('Tensor', 20, 99.90),
    ('Rolamento tensor', 20, 59.90),
    ('Junta de tampa de válvula', 25, 39.90),
    ('Retentor comum', 25, 14.90),
    ('Silicone de alta temperatura', 25, 29.90),
    ('Junta geral', 25, 89.90),
    ('Válvula de pneu', 50, 4.90),
    ('Contrapeso', 25, 2.90),
    ('Kit reparo de pneu', 20, 39.90),
    ('Macarrão para pneu', 40, 1.90),
    ('Bico injetor', 15, 149.90),
    ('Espigão', 30, 5.90),
    ('Desengripante', 40, 19.90),
    ('Limpa contato', 35, 24.90),
    ('Descarbonizante', 30, 39.90),
    ('Cola de junta', 20, 14.90),
    ('Silicone spray', 35, 24.90),
    ('Abraçadeira nylon', 100, 0.80),
    ('Parafuso e porca variados', 100, 1.50),
    ('Arruela', 100, 0.50),
    ('Estopa/pano', 50, 6.90),
    ('Luvas nitrílicas', 40, 2.90),
    ('Spray limpa freio', 30, 34.90)
),
atualizados as (
  update public.estoque e
  set
    quantidade = greatest(coalesce(e.quantidade, 0), i.quantidade),
    preco = i.preco
  from itens i
  where lower(trim(e.nome)) = lower(trim(i.nome))
    and (coalesce(e.preco, 0) = 0 or e.preco <> i.preco)
  returning e.nome
)
insert into public.estoque (nome, quantidade, preco)
select i.nome, i.quantidade, i.preco
from itens i
where not exists (
  select 1
  from public.estoque e
  where lower(trim(e.nome)) = lower(trim(i.nome))
);


-- =========================================================
-- Habilitar RLS
-- =========================================================
alter table public.clientes enable row level security;
alter table public.enderecos enable row level security;
alter table public.notas enable row level security;
alter table public.estoque enable row level security;


-- =========================================================
-- Políticas RLS - clientes
-- =========================================================
drop policy if exists "Clientes autenticados" on public.clientes;
drop policy if exists "Inserir clientes autenticados" on public.clientes;
drop policy if exists "Atualizar clientes autenticados" on public.clientes;
drop policy if exists "Excluir clientes autenticados" on public.clientes;

create policy "Clientes autenticados" on public.clientes
  for select
  using (auth.role() = 'authenticated');

create policy "Inserir clientes autenticados" on public.clientes
  for insert
  with check (auth.role() = 'authenticated');

create policy "Atualizar clientes autenticados" on public.clientes
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Excluir clientes autenticados" on public.clientes
  for delete
  using (auth.role() = 'authenticated');


-- =========================================================
-- Políticas RLS - endereços
-- =========================================================
drop policy if exists "Enderecos autenticados" on public.enderecos;
drop policy if exists "Inserir enderecos autenticados" on public.enderecos;
drop policy if exists "Atualizar enderecos autenticados" on public.enderecos;
drop policy if exists "Excluir enderecos autenticados" on public.enderecos;

create policy "Enderecos autenticados" on public.enderecos
  for select
  using (auth.role() = 'authenticated');

create policy "Inserir enderecos autenticados" on public.enderecos
  for insert
  with check (auth.role() = 'authenticated');

create policy "Atualizar enderecos autenticados" on public.enderecos
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Excluir enderecos autenticados" on public.enderecos
  for delete
  using (auth.role() = 'authenticated');


-- =========================================================
-- Políticas RLS - notas
-- =========================================================
drop policy if exists "Notas autenticadas" on public.notas;
drop policy if exists "Inserir notas autenticadas" on public.notas;
drop policy if exists "Atualizar notas autenticadas" on public.notas;
drop policy if exists "Excluir notas autenticadas" on public.notas;

create policy "Notas autenticadas" on public.notas
  for select
  using (auth.role() = 'authenticated');

create policy "Inserir notas autenticadas" on public.notas
  for insert
  with check (auth.role() = 'authenticated');

create policy "Atualizar notas autenticadas" on public.notas
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Excluir notas autenticadas" on public.notas
  for delete
  using (auth.role() = 'authenticated');


-- =========================================================
-- Políticas RLS - estoque
-- =========================================================
drop policy if exists "Estoque autenticado" on public.estoque;
drop policy if exists "Inserir estoque autenticado" on public.estoque;
drop policy if exists "Atualizar estoque autenticado" on public.estoque;
drop policy if exists "Excluir estoque autenticado" on public.estoque;

create policy "Estoque autenticado" on public.estoque
  for select
  using (auth.role() = 'authenticated');

create policy "Inserir estoque autenticado" on public.estoque
  for insert
  with check (auth.role() = 'authenticated');

create policy "Atualizar estoque autenticado" on public.estoque
  for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Excluir estoque autenticado" on public.estoque
  for delete
  using (auth.role() = 'authenticated');


-- =========================================================
-- Permissões
-- =========================================================
grant usage on schema public to authenticated;

grant select, insert, update, delete on public.clientes to authenticated;
grant select, insert, update, delete on public.enderecos to authenticated;
grant select, insert, update, delete on public.notas to authenticated;
grant select, insert, update, delete on public.estoque to authenticated;
