import { supabase } from './lib/supabase.js';
import { renderLogin } from './pages/login.js';
import { renderHome } from './pages/home.js';
import { renderEmpresa } from './pages/empresa.js';
import { renderNota } from './pages/nota.js';
import { renderNotas } from './pages/notas.js';
import { renderClientes } from './pages/clientes.js';
import { renderHistorico, renderHistoricoCliente } from './pages/historico.js';
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
    const [routeName, queryString = ''] = hash.split('?');
    const params = new URLSearchParams(queryString);
    const user = await getSessionUser();
    const path = routeName || (user ? 'home' : 'login');

    if (path !== 'login' && !user) {
      window.location.hash = 'login';
      root.innerHTML = '';
      renderLogin(root);
      return;
    }

    // If on login route, render full-screen login without sidebar
    if (path === 'login') {
      root.innerHTML = '';
      renderLogin(root);
      return;
    }

    // layout: sidebar + main content
    root.innerHTML = `
      <div class="flex min-h-screen">
        <aside id="sidebar" class="hidden md:block w-64"></aside>
        <main id="main-content" class="flex-1"></main>
      </div>
    `;

    // render sidebar (lazy import to keep bundle small)
    try {
      const { renderSidebar } = await import('./components/sidebar.js');
      renderSidebar(document.getElementById('sidebar'));
    } catch (err) {
      // ignore sidebar errors
    }

    const main = document.getElementById('main-content');

    switch (path) {
      case 'login':
        renderLogin(main);
        break;
      case 'home':
        renderHome(main);
        break;
      case 'empresa':
        renderEmpresa(main);
        break;
      case 'nota':
        renderNota(main);
        break;
      case 'notas':
        renderNotas(main);
        break;
      case 'clientes':
        renderClientes(main);
        break;
      case 'historico':
        renderHistorico(main);
        break;
      case 'historico-cliente':
        renderHistoricoCliente(main, params.get('id'));
        break;
      case 'pendencias':
        renderPendencias(main);
        break;
      case 'estoque':
        renderEstoque(main);
        break;
      default:
        window.location.hash = user ? 'home' : 'login';
    }

    if (window.lucide) window.lucide.replace();
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
