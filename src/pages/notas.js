import Swal from 'sweetalert2';
import { getNotas, updateNota } from '../lib/db.js';
import logoUrl from '../assets/logo.svg';

export async function renderNotas(root) {
  root.innerHTML = `
    <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase text-primary">Notas</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Lista de notas</h1>
          <p class="mt-2 text-sm text-slate-500">Pesquise notas por cliente, carro ou data.</p>
        </div>
        <a href="#home" class="btn-secondary">Voltar</a>
      </div>

      <section class="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div class="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <input id="search-notes" class="form-field" type="search" placeholder="Pesquisar por cliente, carro ou data" />
              <select id="filter-status" class="form-field">
                <option value="all">Todos os status</option>
                <option value="Orçamento">Orçamento</option>
                <option value="Em aberto">Em aberto</option>
                <option value="Concluído">Concluído</option>
                <option value="Pendente">Pendente</option>
                <option value="Cancelado">Cancelado</option>
              </select>
              <button id="search-button" class="btn-primary">Buscar</button>
            </div>

        <div id="notes-list" class="space-y-4"></div>
      </section>
    </div>
  `;

  root.querySelector('#search-button').addEventListener('click', () => loadNotes(root));
  root.querySelector('#filter-status').addEventListener('change', () => loadNotes(root));
  root.querySelector('#search-notes').addEventListener('keyup', (e) => { if (e.key === 'Enter') loadNotes(root); });
  await loadNotes(root);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getPaymentMethod(payment) {
  const text = String(payment || '');
  if (text.startsWith('Crédito')) return 'Credito';
  if (text === 'Débito') return 'Debito';
  return text;
}

function getCreditInstallments(payment) {
  const match = String(payment || '').match(/\((\d+)x|\b(\d+)\s*parcela/i);
  return Number(match?.[1] || match?.[2] || 1);
}

function renderNoteCard(note) {
  const statusClass = note.tipo === 'Concluído'
    ? 'bg-green-100 text-green-800'
    : note.tipo === 'Pendente'
    ? 'bg-rose-100 text-rose-800'
    : note.tipo === 'Orçamento'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-sky-100 text-sky-800';
  const actions = [];

  if (note.tipo === 'Orçamento') {
    actions.push(`<button data-open="${note.id}" class="btn-primary">Abrir serviço</button>`);
  }

  if (note.tipo === 'Em aberto') {
    actions.push(`<button data-complete="${note.id}" class="btn-primary">Concluir</button>`);
    actions.push(`<button data-pending="${note.id}" class="btn-secondary">Registrar pendência</button>`);
  }

  if (note.tipo === 'Pendente') {
    actions.push(`<button data-complete="${note.id}" class="btn-primary">Concluir</button>`);
  }
  if (note.tipo !== 'Cancelado') {
    actions.push(`<button data-cancel="${note.id}" class="btn-secondary">Cancelar</button>`);
  }

  return `
    <article class="card p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full px-3 py-1 text-xs font-semibold ${statusClass}">${note.tipo}</span>
            <span class="status-badge">${formatDate(note.created_at)}</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900">${note.cliente} — ${note.carro}</h2>
          <p class="text-sm text-slate-600">Pagamento: ${note.pagamento || '-'} · Guincho: ${note.guincho ? 'Sim' : 'Não'}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button data-print="${note.id}" class="btn-secondary">Imprimir</button>
          ${actions.join('')}
        </div>
      </div>
      <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm text-slate-500">Total</p>
          <p class="mt-2 text-lg font-semibold text-slate-900">${formatCurrency(note.valor_total || 0)}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm text-slate-500">Desconto</p>
          <p class="mt-2 text-lg font-semibold text-slate-900">${note.desconto_text || 'R$ 0,00'}</p>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm text-slate-500">Valor final</p>
          <p class="mt-2 text-lg font-semibold text-slate-900">${formatCurrency(note.valor_final || 0)}</p>
        </div>
      </div>
    </article>
  `;
}

function createPrintDocument(note) {
  const pieces = Array.isArray(note.pecas) ? note.pecas : [];
  const resolvedLogoUrl = new URL(logoUrl, window.location.href).href;
  return `
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Nota - ${note.cliente}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1, h2, h3 { margin: 0 0 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #CBD5E1; padding: 10px; text-align: left; }
          th { background: #F8FAFC; }
          .badge { display: inline-block; padding: 6px 12px; background: #E2E8F0; border-radius: 999px; margin-bottom: 12px; }
          header { display:flex; align-items:center; gap:16px; margin-bottom:20px }
          header img { height:48px }
          footer { margin-top:24px; border-top:1px solid #E6E6E6; padding-top:12px; font-size:12px; color:#6B7280 }
        </style>
      </head>
      <body>
        <header>
          <img src="${resolvedLogoUrl}" alt="Logo" />
          <div>
            <h1>Nota de serviço</h1>
            <div>${note.cliente} · ${note.carro}</div>
          </div>
        </header>
        <p><strong>Cliente:</strong> ${note.cliente}</p>
        <p><strong>Carro:</strong> ${note.carro}</p>
        <p><strong>Tipo:</strong> ${note.tipo}</p>
        <p><strong>Data:</strong> ${formatDate(note.created_at)}</p>
        <p><strong>Status:</strong> ${note.tipo}</p>
        <p><strong>Pagamento:</strong> ${note.pagamento || '-'}</p>
        <p><strong>Guincho:</strong> ${note.guincho ? 'Sim' : 'Não'}</p>
        <p><strong>Serviços:</strong></p>
        <p>${note.servicos || ''}</p>
        <p><strong>Valor serviços:</strong> ${formatCurrency(note.valor_servicos || 0)}</p>
        <p><strong>Valor guincho:</strong> ${formatCurrency(note.valor_guincho || 0)}</p>
        <h2>Peças utilizadas</h2>
        <table>
          <thead>
            <tr>
              <th>Peça</th>
              <th>Quantidade</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            ${pieces
              .map(
                (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
        <h3>Resumo</h3>
        <p><strong>Total:</strong> ${formatCurrency(note.valor_total || 0)}</p>
        <p><strong>Desconto:</strong> ${note.desconto_text || 'R$ 0,00'}</p>
        <p><strong>Valor final:</strong> ${formatCurrency(note.valor_final || 0)}</p>
        <p><strong>Observações:</strong> ${note.observacoes || '-'}</p>
        <footer>
          <div>Gerado pelo Sistema de Mecânica</div>
          <div>https://seu-sistema.local</div>
        </footer>
      </body>
    </html>
  `;
}

async function loadNotes(root) {
  const query = root.querySelector('#search-notes').value.trim();
  const notesList = root.querySelector('#notes-list');
  notesList.innerHTML = '<div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Carregando notas...</div>';

  const { data, error } = await getNotas(query);

  if (error) {
    notesList.innerHTML = `
      <div class="rounded-3xl border border-danger bg-red-50 p-6 text-danger">
        Não foi possível carregar as notas: ${error.message}
      </div>
    `;
    return;
  }

  const statusFilter = root.querySelector('#filter-status')?.value || 'all';
  const filtered = Array.isArray(data)
    ? data.filter((note) => {
        const lower = query.toLowerCase();
        const matchesQuery =
          note.cliente?.toLowerCase().includes(lower) ||
          note.carro?.toLowerCase().includes(lower) ||
          formatDate(note.created_at).includes(lower);
        const matchesStatus = statusFilter === 'all' ? true : note.tipo === statusFilter;
        return matchesQuery && matchesStatus;
      })
    : [];

  if (!filtered.length) {
    notesList.innerHTML = `
      <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
        Nenhuma nota encontrada para essa pesquisa.
      </div>
    `;
    return;
  }

  notesList.innerHTML = filtered.map(renderNoteCard).join('');

  notesList.querySelectorAll('[data-open]').forEach((button) => {
    button.addEventListener('click', async () => {
      const note = filtered.find((item) => item.id === button.dataset.open);
      if (!note) return;
      const payment = await askPaymentMethod(note.pagamento);
      if (payment === null) return;
      await changeNoteStatus(
        root,
        note.id,
        { tipo: 'Em aberto', data_inicio: new Date().toISOString(), pagamento: payment },
        'aberta'
      );
    });
  });

  notesList.querySelectorAll('[data-complete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const note = filtered.find((item) => item.id === button.dataset.complete);
      if (!note) return;
      const payment = await askPaymentMethod(note.pagamento);
      if (payment === null) return;
      await changeNoteStatus(root, note.id, { tipo: 'Concluído', data_conclusao: new Date().toISOString(), pagamento: payment }, 'concluída');
    });
  });

  notesList.querySelectorAll('[data-pending]').forEach((button) => {
    button.addEventListener('click', async () => {
      const note = filtered.find((item) => item.id === button.dataset.pending);
      if (!note) return;
      await changeNoteStatus(
        root,
        note.id,
        {
          tipo: 'Pendente',
          valor_devido: Number(note.valor_devido || note.valor_final || 0)
        },
        'movida para pendências'
      );
    });
  });

  notesList.querySelectorAll('[data-cancel]').forEach((button) => {
    button.addEventListener('click', async () => {
      const note = filtered.find((item) => item.id === button.dataset.cancel);
      if (!note) return;

      const { value: observation, isConfirmed } = await Swal.fire({
        title: 'Motivo do cancelamento',
        input: 'textarea',
        inputLabel: 'Observações (opcional)',
        inputPlaceholder: 'Descreva o motivo do cancelamento...',
        showCancelButton: true,
        confirmButtonText: 'Cancelar nota',
        cancelButtonText: 'Voltar'
      });

      if (!isConfirmed) return;

      const changes = {
        tipo: 'Cancelado',
        observacoes: `${note.observacoes || ''}\n[CANCELAMENTO] ${observation || ''}`,
        data_cancelamento: new Date().toISOString()
      };

      const { error } = await updateNota(note.id, changes);
      if (error) {
        await Swal.fire({ icon: 'error', title: 'Erro', text: error.message });
        return;
      }

      await Swal.fire({ icon: 'success', title: 'Nota cancelada', text: 'A nota foi marcada como cancelada.' });
      await loadNotes(root);
    });
  });

  notesList.querySelectorAll('[data-print]').forEach((button) => {
    button.addEventListener('click', () => {
      const noteId = button.dataset.print;
      const note = filtered.find((item) => item.id === noteId);
      if (!note) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        Swal.fire({
          icon: 'error',
          title: 'Falha ao abrir impressão',
          text: 'Permita pop-ups para imprimir a nota.'
        });
        return;
      }
      printWindow.document.write(createPrintDocument(note));
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    });
  });
}

async function changeNoteStatus(root, id, changes, label) {
  const confirmation = await Swal.fire({
    title: `Confirmar alteração?`,
    text: `Deseja realmente marcar esta nota como ${label}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sim',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmation.isConfirmed) return;

  const { error } = await updateNota(id, changes);
  if (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Falha ao atualizar nota',
      text: error.message
    });
    return;
  }

  await Swal.fire({
    icon: 'success',
    title: 'Nota atualizada',
    text: `A nota foi ${label} com sucesso.`
  });

  await loadNotes(root);
}

async function askPaymentMethod(existingPayment) {
  const paymentOptions = {
    Dinheiro: 'Dinheiro',
    Debito: 'Débito',
    Credito: 'Crédito',
    Pix: 'Pix',
    Cheque: 'Cheque'
  };
  const existingMethod = getPaymentMethod(existingPayment);
  const existingInstallments = getCreditInstallments(existingPayment);

  const { value, isConfirmed } = await Swal.fire({
    title: 'Forma de pagamento',
    html: `
      <div class="space-y-4 text-left">
        <label class="block text-sm font-medium text-slate-700" for="swal-payment-method">Forma de pagamento</label>
        <select id="swal-payment-method" class="swal2-select" style="display:block;width:100%;margin:0;">
          <option value="">Selecione a forma de pagamento</option>
          ${Object.entries(paymentOptions)
            .map(([value, label]) => `<option value="${value}" ${value === existingMethod ? 'selected' : ''}>${label}</option>`)
            .join('')}
        </select>
        <div id="swal-installments-field" style="display:none;">
          <label class="block text-sm font-medium text-slate-700" for="swal-credit-installments">Quantidade de parcelas</label>
          <input id="swal-credit-installments" class="swal2-input" type="number" min="1" max="24" step="1" value="${existingInstallments}" style="width:100%;margin:0;" />
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      const paymentField = Swal.getPopup().querySelector('#swal-payment-method');
      const installmentsField = Swal.getPopup().querySelector('#swal-installments-field');
      const toggleInstallments = () => {
        installmentsField.style.display = paymentField.value === 'Credito' ? 'block' : 'none';
      };

      paymentField.addEventListener('change', toggleInstallments);
      toggleInstallments();
    },
    preConfirm: () => {
      const popup = Swal.getPopup();
      const payment = popup.querySelector('#swal-payment-method').value;
      const installments = Number(popup.querySelector('#swal-credit-installments').value);

      if (!payment) {
        Swal.showValidationMessage('Escolha uma forma de pagamento.');
        return false;
      }

      if (payment === 'Credito') {
        if (!Number.isInteger(installments) || installments < 1 || installments > 24) {
          Swal.showValidationMessage('Informe uma quantidade de parcelas entre 1 e 24.');
          return false;
        }

        return installments === 1 ? 'Crédito (1 parcela)' : `Crédito (${installments}x)`;
      }

      return paymentOptions[payment];
    }
  });

  if (!isConfirmed) return null;
  return value;
}
