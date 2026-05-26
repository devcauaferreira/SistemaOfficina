import Swal from 'sweetalert2';
import { getPendencias, updateNota } from '../lib/db.js';

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
                <th class="border-b border-slate-200 px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody id="pending-table-body">
              <tr>
                <td colspan="5" class="px-4 py-6 text-center text-sm text-slate-500">Carregando pendências...</td>
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
        <td colspan="5" class="px-4 py-6 text-center text-sm text-danger">Erro ao carregar pendências: ${error.message}</td>
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
        <td colspan="5" class="px-4 py-6 text-center text-sm text-slate-500">Nenhuma pendência encontrada.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = pendencias
    .map(
      (item) => {
        const valorDevido = Number(item.valor_devido || item.valor_final || 0);

        return `
        <tr class="border-t border-slate-200">
          <td class="px-4 py-4 text-slate-700">${item.cliente}</td>
          <td class="px-4 py-4 text-slate-700">${item.carro}</td>
          <td class="px-4 py-4 font-semibold text-danger">${formatCurrency(valorDevido)}</td>
          <td class="px-4 py-4 text-slate-700">${item.servicos}</td>
          <td class="px-4 py-4">
            <button data-abate="${item.id}" class="btn-primary">Abater valor</button>
          </td>
        </tr>
      `;
      }
    )
    .join('');

  tableBody.querySelectorAll('[data-abate]').forEach((button) => {
    button.addEventListener('click', async () => {
      const pendencia = pendencias.find((item) => item.id === button.dataset.abate);
      if (!pendencia) return;
      await abaterPendencia(root, pendencia);
    });
  });
}

function buildAbatementHistory(item, amount, remaining) {
  const currentText = item.observacoes?.trim();
  const now = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const entry = `Abatimento em ${now}: ${formatCurrency(amount)}. Saldo restante: ${formatCurrency(remaining)}.`;

  return currentText ? `${currentText}\n${entry}` : entry;
}

async function abaterPendencia(root, item) {
  const valorDevido = Number(item.valor_devido || item.valor_final || 0);

  if (valorDevido <= 0) {
    await Swal.fire({
      icon: 'info',
      title: 'Pendência sem saldo',
      text: 'Esta pendência não possui valor em aberto para abater.'
    });
    return;
  }

  const { value: amount, isConfirmed } = await Swal.fire({
    title: 'Abater valor da pendência',
    text: `Saldo atual: ${formatCurrency(valorDevido)}`,
    input: 'number',
    inputAttributes: {
      min: '0.01',
      max: String(valorDevido),
      step: '0.01'
    },
    inputPlaceholder: 'Informe o valor pago',
    showCancelButton: true,
    confirmButtonText: 'Abater',
    cancelButtonText: 'Cancelar',
    preConfirm: (value) => {
      const numericValue = Number(value);

      if (!numericValue || numericValue <= 0) {
        Swal.showValidationMessage('Informe um valor maior que zero.');
        return false;
      }

      if (numericValue > valorDevido) {
        Swal.showValidationMessage('O valor abatido não pode ser maior que o saldo devido.');
        return false;
      }

      return numericValue;
    }
  });

  if (!isConfirmed) return;

  const remaining = Math.max(valorDevido - amount, 0);
  const changes = {
    valor_devido: remaining,
    observacoes: buildAbatementHistory(item, amount, remaining)
  };

  if (remaining === 0) {
    changes.tipo = 'Concluído';
    changes.data_conclusao = new Date().toISOString();
  }

  const { error } = await updateNota(item.id, changes);

  if (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Falha ao abater valor',
      text: error.message
    });
    return;
  }

  await Swal.fire({
    icon: 'success',
    title: remaining === 0 ? 'Pendência quitada' : 'Valor abatido',
    text: remaining === 0
      ? 'A pendência foi quitada e a nota foi marcada como concluída.'
      : `Saldo restante: ${formatCurrency(remaining)}`
  });

  await loadPendencias(root);
}
