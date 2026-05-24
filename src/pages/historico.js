import Swal from 'sweetalert2';
import { getClientes, getNotas } from '../lib/db.js';

export function renderHistorico(root) {
  root.innerHTML = `
    <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase text-primary">Histórico de clientes</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Pesquise o histórico</h1>
          <p class="mt-2 text-sm text-slate-500">Busque por cliente, carro ou data e consulte serviços anteriores.</p>
        </div>
        <a href="#home" class="btn-secondary">Voltar</a>
      </div>

      <section class="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div class="mb-6 grid gap-4 sm:grid-cols-2">
          <input id="search-history" class="form-field" type="search" placeholder="Pesquisar por nome ou veículo" />
          <button id="search-button" class="btn-primary">Buscar</button>
        </div>

        <div id="clients-list" class="space-y-4"></div>
        <div id="client-history" class="mt-8"></div>
      </section>
    </div>
  `;

  root.querySelector('#search-button').addEventListener('click', () => loadClients(root));
  loadClients(root);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

async function loadClients(root) {
  const query = root.querySelector('#search-history').value.trim();
  const clientsList = root.querySelector('#clients-list');
  clientsList.innerHTML = `<div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Carregando clientes...</div>`;

  const { data, error } = await getClientes(query);
  if (error) {
    clientsList.innerHTML = `
      <div class="rounded-3xl border border-danger bg-red-50 p-6 text-danger">
        Não foi possível carregar o histórico: ${error.message}
      </div>
    `;
    return;
  }

  if (!data || data.length === 0) {
    clientsList.innerHTML = `
      <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
        Nenhum cliente encontrado. Cadastre clientes para ver o histórico.
      </div>
    `;
    root.querySelector('#client-history').innerHTML = '';
    return;
  }

  clientsList.innerHTML = data
    .map(
      (client) => `
        <article class="card p-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-bold text-slate-900">${client.nome}</h2>
              <p class="text-sm text-slate-600">${client.telefone} · ${client.veiculo} · ${client.placa}</p>
            </div>
            <button data-client="${client.id}" class="btn-secondary">Ver histórico</button>
          </div>
        </article>
      `
    )
    .join('');

  clientsList.querySelectorAll('[data-client]').forEach((button) => {
    button.addEventListener('click', async () => {
      const clientId = button.dataset.client;
      const client = data.find((item) => String(item.id) === clientId);
      if (client) {
        await showClientHistory(client, root);
      }
    });
  });
}

async function showClientHistory(client, root) {
  const historyContainer = root.querySelector('#client-history');
  historyContainer.innerHTML = `<div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Carregando histórico do cliente...</div>`;

  const { data, error } = await getNotas(client.nome);
  if (error) {
    historyContainer.innerHTML = `
      <div class="rounded-3xl border border-danger bg-red-50 p-6 text-danger">
        Não foi possível carregar as notas do cliente: ${error.message}
      </div>
    `;
    return;
  }

  historyContainer.innerHTML = `
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-xl font-bold text-slate-900">Histórico de ${client.nome}</h3>
      <p class="mt-2 text-sm text-slate-500">Veículo: ${client.veiculo} · Placa: ${client.placa} · Telefone: ${client.telefone}</p>
    </div>
  `;

  const notes = Array.isArray(data) ? data : [];
  if (!notes.length) {
    historyContainer.innerHTML += `
      <div class="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
        Não há notas registradas para este cliente.
      </div>
    `;
    return;
  }

  historyContainer.innerHTML += notes
    .map(
      (note) => `
        <article class="card mt-4 p-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-sm text-slate-500">${formatDate(note.created_at)} · ${note.tipo}</p>
              <h4 class="mt-2 text-lg font-semibold text-slate-900">${note.carro}</h4>
              <p class="text-sm text-slate-600">Pagamento: ${note.pagamento || '-'} · Guincho: ${note.guincho ? 'Sim' : 'Não'}</p>
            </div>
            <span class="status-badge">Valor final: R$ ${Number(note.valor_final || 0).toFixed(2)}</span>
          </div>
        </article>
      `
    )
    .join('');
}
