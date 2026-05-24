import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_KEY ?? '';
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = supabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function login(email, senha) {
  if (!supabase) {
    return {
      data: null,
      error: { message: 'Supabase não configurado. Confira as variáveis de ambiente.' }
    };
  }

  return supabase.auth.signInWithPassword({ email, password: senha });
}

export async function logout() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

export async function getUsuarioAtual() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;

  return data.user ?? null;
}

export async function verificarAutenticacao() {
  const usuario = await getUsuarioAtual();

  if (!usuario && window.location.hash !== '#login') {
    window.location.hash = 'login';
  }

  return usuario;
}
