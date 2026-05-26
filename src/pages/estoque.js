import Swal from 'sweetalert2';
import { createEstoqueItem, deleteEstoqueItem, getEstoqueItems, updateEstoqueItem } from '../lib/db.js';

const availableStockNames = [
  'Óleo de motor 5W30',
  'Óleo de motor 10W40',
  'Óleo de motor 15W40',
  'Filtro de óleo',
  'Filtro de ar',
  'Filtro de combustível',
  'Filtro de cabine/ar-condicionado',
  'Vela de ignição',
  'Cabo de vela',
  'Fluido de freio DOT3',
  'Fluido de freio DOT4',
  'Aditivo de radiador',
  'Água desmineralizada',
  'Fluido de direção hidráulica',
  'Limpador de para-brisa',
  'Pastilha de freio dianteira',
  'Sapata de freio traseira',
  'Disco de freio comum',
  'Cilindro de roda',
  'Flexível de freio',
  'Sensor de ABS',
  'Kit mola/trava de freio',
  'Bucha de bandeja',
  'Pivô',
  'Terminal de direção',
  'Axial',
  'Bieleta',
  'Coxim de amortecedor',
  'Rolamento de roda',
  'Amortecedor de alta saída',
  'Coifa de homocinética',
  'Graxa para rolamento',
  'Fusível variado',
  'Relé universal',
  'Lâmpada H1',
  'Lâmpada H4',
  'Lâmpada H7',
  'Lâmpada Pingo',
  'Lâmpada de ré',
  'Conector elétrico',
  'Terminal de bateria',
  'Chicote universal',
  'Interruptor universal',
  'Bateria',
  'Fita isolante',
  'Termo retrátil',
  'Mangueira universal',
  'Abraçadeira variada',
  'Válvula termostática',
  'Tampa de reservatório',
  'Sensor de temperatura',
  'Reservatório de expansão universal',
  'Correia dentada',
  'Correia poly-v',
  'Tensor',
  'Rolamento tensor',
  'Junta de tampa de válvula',
  'Retentor comum',
  'Silicone de alta temperatura',
  'Junta geral',
  'Válvula de pneu',
  'Contrapeso',
  'Kit reparo de pneu',
  'Macarrão para pneu',
  'Bico injetor',
  'Espigão',
  'Desengripante',
  'Limpa contato',
  'Descarbonizante',
  'Cola de junta',
  'Silicone spray',
  'Abraçadeira nylon',
  'Parafuso e porca variados',
  'Arruela',
  'Estopa/pano',
  'Luvas nitrílicas',
  'Spray limpa freio'
];

export async function renderEstoque(root) {
  root.innerHTML = `
    <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-8 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase text-primary">Estoque</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Itens em estoque</h1>
          <p class="mt-2 text-sm text-slate-500">Gerencie peças, quantidades e preços diretamente no estoque.</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a href="#home" class="btn-secondary">Voltar</a>
          <button id="add-stock-item" class="btn-primary">Adicionar item</button>
          <button id="register-entry" class="btn-secondary">Registrar entrada</button>
        </div>
      </div>

      <section class="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input id="search-stock" class="form-field" type="search" placeholder="Pesquisar estoque por nome" />
          <div class="flex items-center gap-3">
            <p class="text-sm text-slate-500">Total de itens:</p>
            <span id="stock-count" class="status-badge">0</span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="bg-slate-100 text-left text-slate-600">
                <th class="border-b border-slate-200 px-4 py-3">Peça</th>
                <th class="border-b border-slate-200 px-4 py-3">Quantidade</th>
                <th class="border-b border-slate-200 px-4 py-3">Preço</th>
                <th class="border-b border-slate-200 px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody id="stock-table-body">
              <tr>
                <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-500">Carregando estoque...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">Histórico de entradas</h3>
          <button id="clear-entries" class="text-sm text-danger">Limpar histórico</button>
        </div>
        <div id="entries-list" class="space-y-2 text-sm text-slate-700">Carregando histórico...</div>
      </section>
    </div>
  `;

  root.querySelector('#add-stock-item').addEventListener('click', () => showItemModal(root));
  root.querySelector('#register-entry').addEventListener('click', () => showEntryModal(root));
  root.querySelector('#clear-entries').addEventListener('click', () => {
    Swal.fire({
      title: 'Limpar histórico de entradas?',
      text: 'Isso removerá o histórico localmente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, limpar',
      cancelButtonText: 'Cancelar'
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.removeItem('estoqueEntradas');
        loadEntries(root);
      }
    });
  });
  root.querySelector('#search-stock').addEventListener('input', () => loadEstoque(root));
  await loadEstoque(root);
  loadEntries(root);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function showItemModal(root, item = null) {
  const isEdit = Boolean(item);
  const result = await Swal.fire({
    title: isEdit ? 'Editar item de estoque' : 'Adicionar item de estoque',
    html: `
      <input id="swal-name" list="stock-names" class="swal2-input" placeholder="Nome da peça" value="${item?.nome || ''}" />
      <datalist id="stock-names">
        ${availableStockNames.map((name) => `<option value="${name}"></option>`).join('')}
      </datalist>
      <input id="swal-quantity" type="number" min="0" class="swal2-input" placeholder="Quantidade" value="${item?.quantidade ?? 0}" />
      <input id="swal-price" type="number" min="0" step="0.01" class="swal2-input" placeholder="Preço unitário" value="${item?.preco ?? 0}" />
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: isEdit ? 'Salvar' : 'Adicionar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const nome = document.getElementById('swal-name').value.trim();
      const quantidade = Number(document.getElementById('swal-quantity').value);
      const preco = Number(document.getElementById('swal-price').value);

      if (!nome) {
        Swal.showValidationMessage('O nome da peça é obrigatório.');
        return;
      }
      if (Number.isNaN(quantidade) || quantidade < 0) {
        Swal.showValidationMessage('Informe uma quantidade válida.');
        return;
      }
      if (Number.isNaN(preco) || preco < 0) {
        Swal.showValidationMessage('Informe um preço válido.');
        return;
      }

      return { nome, quantidade, preco };
    }
  });

  if (!result.isConfirmed || !result.value) return;

  const data = result.value;
  let response;

  if (isEdit) {
    response = await updateEstoqueItem(item.id, data);
  } else {
    response = await createEstoqueItem(data);
  }

  if (response.error) {
    await Swal.fire({
      icon: 'error',
      title: 'Erro no estoque',
      text: response.error.message
    });
    return;
  }

  await Swal.fire({
    icon: 'success',
    title: isEdit ? 'Atualizado' : 'Adicionado',
    text: `O item foi ${isEdit ? 'atualizado' : 'adicionado'} com sucesso.`
  });

  await loadEstoque(root);
}

async function loadEstoque(root) {
  const { data, error } = await getEstoqueItems();
  const tableBody = root.querySelector('#stock-table-body');
  const countBadge = root.querySelector('#stock-count');
  const query = root.querySelector('#search-stock').value.trim().toLowerCase();

  if (error) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-sm text-danger">Erro ao carregar estoque: ${error.message}</td>
      </tr>
    `;
    countBadge.textContent = '0';
    return;
  }

  const items = Array.isArray(data) ? data : [];
  const filtered = items.filter((item) => item.nome.toLowerCase().includes(query));

  countBadge.textContent = `${filtered.length}`;

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-500">Nenhum item encontrado.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered
    .map(
      (item) => `
        <tr class="border-t border-slate-200">
          <td class="px-4 py-4 text-slate-700">${item.nome}</td>
          <td class="px-4 py-4 text-slate-700">${item.quantidade}</td>
          <td class="px-4 py-4 text-slate-700">${formatCurrency(item.preco)}</td>
          <td class="px-4 py-4 text-slate-700 space-x-2">
            <button data-edit="${item.id}" class="text-sm font-semibold text-primary hover:text-primary/80">Editar</button>
            <button data-delete="${item.id}" class="text-sm font-semibold text-danger hover:text-danger/80">Excluir</button>
          </td>
        </tr>
      `
    )
    .join('');

  tableBody.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const itemId = button.dataset.edit;
      const item = filtered.find((entry) => entry.id === itemId);
      if (!item) return;
      showItemModal(root, item);
    });
  });

  tableBody.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      const itemId = button.dataset.delete;
      const item = filtered.find((entry) => entry.id === itemId);
      if (!item) return;

      const confirmation = await Swal.fire({
        icon: 'warning',
        title: 'Excluir item?',
        text: `Deseja remover ${item.nome} do estoque?`,
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
      });

      if (!confirmation.isConfirmed) return;

      const { error } = await deleteEstoqueItem(itemId);
      if (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Erro ao excluir',
          text: error.message
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Excluído',
        text: 'O item foi removido do estoque.'
      });

      await loadEstoque(root);
    });
  });
}

function getEntries() {
  try {
    const raw = localStorage.getItem('estoqueEntradas');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveEntry(entry) {
  const entries = getEntries();
  entries.unshift(entry);
  localStorage.setItem('estoqueEntradas', JSON.stringify(entries.slice(0, 200)));
}

function loadEntries(root) {
  const list = root.querySelector('#entries-list');
  const entries = getEntries();
  if (!entries.length) {
    list.textContent = 'Nenhuma entrada registrada.';
    return;
  }

  list.innerHTML = entries
    .map((e) => `<div class="border-b py-2"><strong>${e.nome}</strong> · ${e.quantidade} unidades · ${formatCurrency(e.preco)} · ${e.fornecedor || '-'} · ${new Date(e.data).toLocaleString()}</div>`)
    .join('');
}

async function showEntryModal(root) {
  const { data } = await getEstoqueItems();
  const names = Array.isArray(data) ? data.map((i) => i.nome) : [];

  const result = await Swal.fire({
    title: 'Registrar entrada',
    html: `
      <input id="swal-entry-name" list="stock-names" class="swal2-input" placeholder="Nome da peça" />
      <datalist id="stock-names">${names.map((n) => `<option value="${n}"></option>`).join('')}</datalist>
      <input id="swal-entry-quantity" type="number" min="1" class="swal2-input" placeholder="Quantidade" />
      <input id="swal-entry-price" type="number" min="0" step="0.01" class="swal2-input" placeholder="Preço unitário" />
      <input id="swal-entry-supplier" type="text" class="swal2-input" placeholder="Fornecedor (opcional)" />
      <input id="swal-entry-date" type="datetime-local" class="swal2-input" value="${new Date().toISOString().slice(0,16)}" />
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Registrar',
    preConfirm: () => {
      const nome = document.getElementById('swal-entry-name').value.trim();
      const quantidade = Number(document.getElementById('swal-entry-quantity').value);
      const preco = Number(document.getElementById('swal-entry-price').value);
      const fornecedor = document.getElementById('swal-entry-supplier').value.trim();
      const dataVal = document.getElementById('swal-entry-date').value;

      if (!nome) {
        Swal.showValidationMessage('Nome da peça é obrigatório');
        return;
      }
      if (Number.isNaN(quantidade) || quantidade <= 0) {
        Swal.showValidationMessage('Quantidade inválida');
        return;
      }
      if (Number.isNaN(preco) || preco < 0) {
        Swal.showValidationMessage('Preço inválido');
        return;
      }

      return { nome, quantidade, preco, fornecedor, data: dataVal || new Date().toISOString() };
    }
  });

  if (!result.isConfirmed || !result.value) return;

  const entry = result.value;

  // tentar localizar item existente
  const { data: items } = await getEstoqueItems();
  const existing = Array.isArray(items) ? items.find((it) => it.nome === entry.nome) : null;

  if (existing) {
    const newQty = Number(existing.quantidade || 0) + Number(entry.quantidade);
    await updateEstoqueItem(existing.id, { quantidade: newQty, preco: entry.preco });
  } else {
    await createEstoqueItem({ nome: entry.nome, quantidade: entry.quantidade, preco: entry.preco });
  }

  saveEntry(entry);
  await Swal.fire({ icon: 'success', title: 'Entrada registrada' });
  await loadEstoque(root);
  loadEntries(root);
}
