import { logout } from '../lib/supabase.js';

export function renderHome(root) {
  root.innerHTML = `
    <div class="mx-auto max-w-6xl px-4 py-8">
      <header class="mb-8 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase text-primary">Painel inicial</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Bem-vindo ao sistema da oficina</h1>
          <p class="mt-2 text-sm text-slate-500">Use os atalhos abaixo para navegar entre notas, clientes e pendências.</p>
        </div>
        <button id="logout-button" class="btn-secondary w-full md:w-auto">Sair</button>
      </header>

      <section class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <a href="#nota" class="card flex h-full flex-col justify-between gap-4 p-6 hover:border-primary hover:shadow-md">
          <div>
            <p class="text-sm font-semibold uppercase text-primary">Registrar</p>
            <h2 class="mt-3 text-xl font-bold text-slate-900">Novo orçamento</h2>
          </div>
          <span class="status-badge">Registrar novo orçamento</span>
        </a>

        <a href="#notas" class="card flex h-full flex-col justify-between gap-4 p-6 hover:border-primary hover:shadow-md">
          <div>
            <p class="text-sm font-semibold uppercase text-primary">Notas</p>
            <h2 class="mt-3 text-xl font-bold text-slate-900">Ver notas</h2>
          </div>
          <span class="status-badge">Consultar notas</span>
        </a>

        <a href="#clientes" class="card flex h-full flex-col justify-between gap-4 p-6 hover:border-primary hover:shadow-md">
          <div>
            <p class="text-sm font-semibold uppercase text-primary">Cliente</p>
            <h2 class="mt-3 text-xl font-bold text-slate-900">Cadastrar cliente</h2>
          </div>
          <span class="status-badge">Novo cliente</span>
        </a>

        <a href="#estoque" class="card flex h-full flex-col justify-between gap-4 p-6 hover:border-primary hover:shadow-md">
          <div>
            <p class="text-sm font-semibold uppercase text-primary">Estoque</p>
            <h2 class="mt-3 text-xl font-bold text-slate-900">Controle de peças</h2>
          </div>
          <span class="status-badge">Ver estoque</span>
        </a>

        <a href="#historico" class="card flex h-full flex-col justify-between gap-4 p-6 hover:border-primary hover:shadow-md">
          <div>
            <p class="text-sm font-semibold uppercase text-primary">Histórico</p>
            <h2 class="mt-3 text-xl font-bold text-slate-900">Clientes</h2>
          </div>
          <span class="status-badge">Histórico de clientes</span>
        </a>

        <a href="#pendencias" class="card flex h-full flex-col justify-between gap-4 p-6 hover:border-primary hover:shadow-md">
          <div>
            <p class="text-sm font-semibold uppercase text-primary">Pendências</p>
            <h2 class="mt-3 text-xl font-bold text-slate-900">Clientes com dívidas</h2>
          </div>
          <span class="status-badge">Ver pendências</span>
        </a>

        <div class="card p-6">
          <p class="text-sm font-semibold uppercase text-primary">Status</p>
          <h2 class="mt-3 text-xl font-bold text-slate-900">Controle rápido</h2>
          <p class="mt-2 text-sm text-slate-500">A navegação principal já está pronta. Use este painel para iniciar cada fluxo do sistema.</p>
        </div>
      </section>
    </div>
  `;

  root.querySelector('#logout-button').addEventListener('click', async () => {
    await logout();
    window.location.hash = 'login';
  });
}
