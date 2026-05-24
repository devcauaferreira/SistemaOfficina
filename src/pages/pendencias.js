import { getPendencias } from '../lib/db.js';

export async function renderPendencias(root) {
  root.innerHTML = `
    <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase text-primary">Clientes com pendências</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Pendências em aberto</h1>
          <p class="mt-2 text-sm text-slate-500">Veja clientes com valores em aberto e serviços relacionados à dívida.</p>
        </div>
        <a href="#home" class="btn-secondary">Voltar</a>
      </div>

      <section class="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div class="mb-6 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-slate-900">Acompanhe as pendências</p>
            <p class="text-sm text-slate-500">O relatório será exibido assim que houver débitos registrados.</p>
          </div>
          <span id="pending-count" class="status-badge">Carregando...</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="bg-slate-100 text-left text-slate-600">
                <th class="border-b border-slate-200 px-4 py-3">Cliente</th>
                <th class="border-b border-slate-200 px-4 py-3">Carro</th>
                <th class="border-b border-slate-200 px-4 py-3">Valor devido</th>
                <th class="border-b border-slate-200 px-4 py-3">Serviço</th>
              </tr>
            </thead>
            <tbody id="pending-table-body">
              <tr>
                <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-500">Carregando pendências...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  await loadPendencias(root);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function loadPendencias(root) {
  const { data, error } = await getPendencias();
  const tableBody = root.querySelector('#pending-table-body');
  const countBadge = root.querySelector('#pending-count');

  if (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-sm text-danger">Erro ao carregar pendências: ${error.message}</td>
      </tr>
    `;
    countBadge.textContent = 'Erro';
    return;
  }

  const pendencias = Array.isArray(data) ? data : [];
  countBadge.textContent = `${pendencias.length} pendência(s)`;

  if (!pendencias.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-500">Nenhuma pendência encontrada.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = pendencias
    .map(
      (item) => `
        <tr class="border-t border-slate-200">
          <td class="px-4 py-4 text-slate-700">${item.cliente}</td>
          <td class="px-4 py-4 text-slate-700">${item.carro}</td>
          <td class="px-4 py-4 text-danger">${formatCurrency(item.valor_final || 0)}</td>
          <td class="px-4 py-4 text-slate-700">${item.servicos}</td>
        </tr>
      `
    )
    .join('');
}
