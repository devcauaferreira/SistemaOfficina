import { supabase } from './supabase.js';

export const tables = {
  clientes: 'clientes',
  notas: 'notas',
  estoque: 'estoque'
};

function missingSupabaseError() {
  return { data: null, error: { message: 'Supabase não configurado. Crie um arquivo .env com as variáveis de ambiente.' } };
}

export async function createCliente(record) {
  if (!supabase) return missingSupabaseError();
  return supabase.from(tables.clientes).insert([record]);
}

export async function createNota(record) {
  if (!supabase) return missingSupabaseError();
  return supabase.from(tables.notas).insert([record]);
}

export async function updateNota(id, changes) {
  if (!supabase) return missingSupabaseError();
  return supabase.from(tables.notas).update(changes).eq('id', id);
}

export async function getNotas(query) {
  if (!supabase) return missingSupabaseError();
  const builder = supabase
    .from(tables.notas)
    .select('*')
    .order('created_at', { ascending: false });

  return builder;
}

export async function getClientes(query) {
  if (!supabase) return missingSupabaseError();
  let builder = supabase
    .from(tables.clientes)
    .select('*')
    .order('created_at', { ascending: false });

  if (query && query.trim().length > 0) {
    const value = `%${query.trim()}%`;
    builder = builder.or(`nome.ilike.${value},veiculo.ilike.${value},placa.ilike.${value}`);
  }

  return builder;
}

export async function getPendencias() {
  if (!supabase) return missingSupabaseError();
  return supabase
    .from(tables.notas)
    .select('*')
    .eq('tipo', 'Pendente')
    .order('created_at', { ascending: false });
}

export async function getEstoqueItems() {
  if (!supabase) return missingSupabaseError();
  return supabase
    .from(tables.estoque)
    .select('*')
    .order('nome', { ascending: true })
    .order('preco', { ascending: false });
}

export async function getEstoqueItemByNome(nome) {
  if (!supabase) return missingSupabaseError();
  if (!nome?.trim()) return { data: null, error: null };

  return supabase
    .from(tables.estoque)
    .select('*')
    .ilike('nome', `%${nome.trim()}%`)
    .order('preco', { ascending: false })
    .limit(10);
}

export async function createEstoqueItem(record) {
  if (!supabase) return missingSupabaseError();
  return supabase.from(tables.estoque).insert([record]);
}

export async function updateEstoqueItem(id, changes) {
  if (!supabase) return missingSupabaseError();
  return supabase.from(tables.estoque).update(changes).eq('id', id);
}

export async function deleteEstoqueItem(id) {
  if (!supabase) return missingSupabaseError();
  return supabase.from(tables.estoque).delete().eq('id', id);
}

export async function updateEstoqueQuantity(id, quantidade) {
  if (!supabase) return missingSupabaseError();
  return supabase.from(tables.estoque).update({ quantidade }).eq('id', id);
}
