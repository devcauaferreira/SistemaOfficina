import { login, supabase } from '../lib/supabase.js';
import Swal from 'sweetalert2';

export function renderLogin(root) {
  root.innerHTML = `
    <main class="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
      <section class="w-full rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
        <div class="mb-8 space-y-2 text-center">
          <p class="text-sm font-semibold uppercase text-primary">Acesso</p>
          <h1 class="text-3xl font-bold text-slate-900">Sistema de Oficina Mecânica</h1>
          <p class="text-sm text-slate-500">Faça login para acessar o sistema de gerenciamento.</p>
        </div>

        <form id="login-form" class="space-y-5">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700" for="email">E-mail</label>
            <input id="email" name="email" type="email" class="form-field" placeholder="seu@email.com" required />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700" for="password">Senha</label>
            <input id="password" name="password" type="password" class="form-field" placeholder="••••••••" required />
          </div>

          <button type="submit" class="btn-primary w-full">Entrar</button>
        </form>
      </section>
    </main>
  `;

  const form = root.querySelector('#login-form');
  form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value.trim();

  if (!email || !password) {
    await Swal.fire({
      icon: 'warning',
      title: 'Preencha todos os campos',
      text: 'Informe e-mail e senha para continuar.'
    });
    return;
  }

  if (!supabase) {
    await Swal.fire({
      icon: 'error',
      title: 'Supabase não configurado',
      text: 'Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
    });
    return;
  }

  try {
    const { error } = await login(email, password);

    if (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Falha no login',
        text: error.message
      });
      return;
    }

    window.location.hash = 'home';
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Erro inesperado',
      text: 'Tente novamente em alguns instantes.'
    });
  }
}
