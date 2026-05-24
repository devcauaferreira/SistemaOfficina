import { supabase } from './lib/supabase.js';
import { renderLogin } from './pages/login.js';
import { renderHome } from './pages/home.js';
import { renderNota } from './pages/nota.js';
import { renderNotas } from './pages/notas.js';
import { renderClientes } from './pages/clientes.js';
import { renderHistorico } from './pages/historico.js';
import { renderPendencias } from './pages/pendencias.js';
import { renderEstoque } from './pages/estoque.js';

const root = document.querySelector('#app');

export function initRouter() {
  window.addEventListener('hashchange', route);
  route();
}

async function getSessionUser() {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user ?? null;
  } catch (error) {
    return null;
  }
}

async function route() {
  try {
    if (!root) return;

    const hash = window.location.hash.replace('#', '');
    const user = await getSessionUser();
    const path = hash || (user ? 'home' : 'login');

    if (path !== 'login' && !user) {
      window.location.hash = 'login';
      root.innerHTML = '';
      renderLogin(root);
      return;
    }

    root.innerHTML = '';

    switch (path) {
      case 'login':
        renderLogin(root);
        break;
      case 'home':
        renderHome(root);
        break;
      case 'nota':
        renderNota(root);
        break;
      case 'notas':
        renderNotas(root);
        break;
      case 'clientes':
        renderClientes(root);
        break;
      case 'historico':
        renderHistorico(root);
        break;
      case 'pendencias':
        renderPendencias(root);
        break;
      case 'estoque':
        renderEstoque(root);
        break;
      default:
        window.location.hash = user ? 'home' : 'login';
    }
  } catch (error) {
    root.innerHTML = `
      <main class="mx-auto max-w-3xl px-4 py-10">
        <section class="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700">
          <h1 class="text-2xl font-bold">Erro ao carregar a página</h1>
          <p class="mt-3 text-sm">Recarregue a página. Se continuar acontecendo, verifique as configurações do Supabase.</p>
        </section>
      </main>
    `;
  }
}
