import Swal from 'sweetalert2';
import { createNota, getEstoqueItemByNome, getEstoqueItems, updateEstoqueQuantity, getClientes } from '../lib/db.js';
import { buildOrcamentoPrintHtml } from '../lib/print.js';

const MAX_DISCOUNT_PERCENT = 50; // limite padrão de desconto

let pieces = [];
let inventory = [];
let clientes = [];

async function loadClientes(root) {
  const { data, error } = await getClientes('');
  if (error) {
    clientes = [];
    return;
  }
  clientes = data || [];
  clientes.sort((a, b) => (String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR')));
  const clientesList = root.querySelector('#cliente-list');
  if (clientesList) {
    clientesList.innerHTML = clientes.map((c) => `<option value="${c.nome}"></option>`).join('');
  }
}

function loadVehicles(root, clienteName) {
  const cliente = clientes.find((c) => c.nome === clienteName);
  const carroList = root.querySelector('#carro-list');
  
  if (!cliente || !carroList) return;
  
  // Mostrar o veículo do cliente
  carroList.innerHTML = `<option value="${cliente.veiculo}"></option>`;
  root.querySelector('#carro').value = cliente.veiculo;
}

export function renderNota(root) {
  pieces = [];
  inventory = [];
  root.innerHTML = `
    <div class="page-shell">
      <div class="mx-auto max-w-7xl px-4 py-8">
        <div class="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Novo orçamento</p>
            <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Registrar orçamento</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-500">Monte o orçamento com leitura rápida, preços claros e acesso fácil às peças. A tela foi organizada para reduzir ruído visual e acelerar o preenchimento.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a href="#home" class="btn-secondary">Voltar</a>
            <button id="clear-button" class="btn-secondary">Limpar</button>
          </div>
        </div>

        <form id="nota-form" class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <div class="space-y-6">
            <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Dados principais</p>
                  <h2 class="mt-1 text-xl font-bold text-slate-900">Cliente e veículo</h2>
                </div>
                <span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Orçamento</span>
              </div>

              <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <div class="xl:col-span-1">
                  <label class="mb-2 block text-sm font-medium text-slate-700">Nome do cliente</label>
                  <input id="cliente" class="form-field" type="text" required list="cliente-list" placeholder="Selecione um cliente" />
                  <datalist id="cliente-list"></datalist>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Carro</label>
                  <input id="carro" class="form-field" type="text" required list="carro-list" placeholder="Informe o veículo" />
                  <datalist id="carro-list"></datalist>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Mecânico</label>
                  <input id="mecanico" class="form-field" type="text" placeholder="Nome do mecânico responsável" />
                </div>
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Serviço</p>
                  <h2 class="mt-1 text-xl font-bold text-slate-900">Trabalho executado</h2>
                </div>
                <div class="rounded-2xl bg-amber-50 px-4 py-2 text-right">
                  <p class="text-xs font-medium uppercase tracking-[0.12em] text-amber-700">Tipo de registro</p>
                  <p class="mt-1 text-sm font-semibold text-amber-900">Orçamento</p>
                </div>
              </div>

              <div class="grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.6fr)]">
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Serviços realizados</label>
                  <textarea id="servicos" class="form-field min-h-[150px]" placeholder="Descreva os serviços executados" required></textarea>
                </div>
                <div class="space-y-5">
                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Valor dos serviços</label>
                    <input id="valor-servicos" class="form-field" type="number" min="0" step="0.01" placeholder="0,00" value="0" />
                  </div>
                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Teve guincho?</label>
                    <select id="guincho" class="form-field" required>
                      <option value="">Selecione</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div id="guincho-value-field" class="hidden">
                    <label class="mb-2 block text-sm font-medium text-slate-700">Valor do guincho</label>
                    <input id="valor-guincho" class="form-field" type="number" min="0" step="0.01" placeholder="0,00" value="0" />
                  </div>
                </div>
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Peças</p>
                  <h2 class="mt-1 text-xl font-bold text-slate-900">Peças utilizadas</h2>
                  <p class="mt-1 text-sm text-slate-500">Adicione a peça, a quantidade e o preço para compor o orçamento.</p>
                </div>
                <div class="flex flex-wrap gap-3">
                  <button id="refresh-stock" type="button" class="btn-secondary">Atualizar estoque</button>
                  <button id="add-piece" type="button" class="btn-primary">Adicionar peça</button>
                </div>
              </div>

              <div class="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_180px_180px]">
                <input id="piece-name" class="form-field" type="text" placeholder="Nome da peça" list="piece-list" />
                <input id="piece-quantity" class="form-field" type="number" min="1" placeholder="Quantidade" />
                <input id="piece-price" class="form-field" type="number" min="0" step="0.01" placeholder="Preço vindo do estoque" />
              </div>
              <datalist id="piece-list"></datalist>

              <div id="pieces-list" class="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <table class="w-full border-collapse text-sm">
                  <thead>
                    <tr class="bg-slate-100 text-left text-slate-600">
                      <th class="border-b border-slate-200 px-4 py-3">Peça</th>
                      <th class="border-b border-slate-200 px-4 py-3">Quantidade</th>
                      <th class="border-b border-slate-200 px-4 py-3">Preço</th>
                      <th class="border-b border-slate-200 px-4 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody id="pieces-table" class="bg-white">
                    <tr>
                      <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-500">Nenhuma peça adicionada ainda.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="mb-5">
                <p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Complementos</p>
                <h2 class="mt-1 text-xl font-bold text-slate-900">Desconto e observações</h2>
              </div>

              <div class="grid gap-5 lg:grid-cols-2">
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Desconto</label>
                  <input id="desconto" class="form-field" type="text" placeholder="Ex: 10% ou 50" />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-slate-700">Informações adicionais</label>
                  <textarea id="descricao" class="form-field min-h-[120px]" placeholder="Observações, anotações ou instruções especiais"></textarea>
                </div>
              </div>
            </section>
          </div>

          <aside class="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section class="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Resumo rápido</p>
                  <h2 class="mt-2 text-2xl font-bold">Acompanhamento do orçamento</h2>
                </div>
                <div class="flex h-16 min-w-16 flex-col items-center justify-center rounded-2xl bg-white/10 px-4 text-center">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-slate-300">Peças</p>
                  <p id="pieces-count" class="mt-1 text-lg font-semibold text-white leading-none">0</p>
                </div>
              </div>

              <div class="mt-6 grid gap-3">
                <div class="rounded-2xl bg-white/8 px-4 py-3">
                  <p class="text-sm text-slate-300">Total peças</p>
                  <p id="total-valor" class="mt-1 text-2xl font-bold text-white">R$ 0,00</p>
                </div>
                <div class="rounded-2xl bg-white/8 px-4 py-3">
                  <p class="text-sm text-slate-300">Desconto</p>
                  <p id="discount-value" class="mt-1 text-2xl font-bold text-white">R$ 0,00</p>
                </div>
                <div class="rounded-2xl bg-primary/20 px-4 py-3 ring-1 ring-inset ring-primary/30">
                  <p class="text-sm text-slate-200">Valor final</p>
                  <p id="final-value" class="mt-1 text-3xl font-bold text-white">R$ 0,00</p>
                </div>
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex flex-col gap-3 sm:flex-row">
                <button id="submit-button" type="submit" class="btn-primary w-full sm:w-auto sm:flex-1">Salvar orçamento</button>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </div>
  `;

  root.querySelector('#add-piece').addEventListener('click', () => addPiece(root));
  root.querySelector('#refresh-stock').addEventListener('click', () => refreshInventory(root));
  root.querySelector('#clear-button').addEventListener('click', () => clearForm(root));
  root.querySelector('#nota-form').addEventListener('submit', (event) => submitForm(event, root));
  root.querySelector('#desconto').addEventListener('input', () => updateTotals(root));
  // limitar desconto máximo em 50% por padrão
  const MAX_DISCOUNT_PERCENT = 50;
  root.querySelector('#valor-servicos').addEventListener('input', () => updateTotals(root));
  root.querySelector('#piece-name').addEventListener('input', async () => await fillPiecePriceFromStock(root));
  root.querySelector('#piece-name').addEventListener('change', async () => await fillPiecePriceFromStock(root));
  root.querySelector('#guincho').addEventListener('change', () => {
    toggleGuinchoField(root);
    updateTotals(root);
  });
  root.querySelector('#valor-guincho').addEventListener('input', () => updateTotals(root));
  root.querySelector('#cliente').addEventListener('change', () => loadVehicles(root, root.querySelector('#cliente').value));
  loadInventory(root);
  loadClientes(root);
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getStockItem(name) {
  return getBestStockItem(inventory.filter((item) => normalizeText(item.nome) === normalizeText(name)));
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function getBestStockItem(items) {
  if (!items.length) return null;

  return [...items].sort((first, second) => {
    const secondPrice = Number(second.preco || 0);
    const firstPrice = Number(first.preco || 0);
    const secondQuantity = Number(second.quantidade || 0);
    const firstQuantity = Number(first.quantidade || 0);

    if (secondPrice !== firstPrice) return secondPrice - firstPrice;
    return secondQuantity - firstQuantity;
  })[0];
}

async function getFreshStockItem(name) {
  const { data, error } = await getEstoqueItemByNome(name);

  if (error) {
    throw error;
  }

  const items = Array.isArray(data) ? data : [];
  const exactItems = items.filter((item) => normalizeText(item.nome) === normalizeText(name));
  const stockItem = getBestStockItem(exactItems) || getBestStockItem(items);

  if (!stockItem) return null;

  const index = inventory.findIndex((item) => item.id === stockItem.id);
  if (index >= 0) {
    inventory[index] = stockItem;
  } else {
    inventory.push(stockItem);
  }

  return stockItem;
}

async function fillPiecePriceFromStock(root) {
  const name = root.querySelector('#piece-name').value.trim();
  const priceField = root.querySelector('#piece-price');

  if (!name) {
    priceField.value = '';
    return;
  }

  let stockItem = getStockItem(name);
  if (!stockItem) {
    try {
      stockItem = await getFreshStockItem(name);
    } catch (error) {
      console.error('Erro ao buscar item do estoque:', error?.message || error);
      return;
    }
  }

  if (!stockItem) return;

  priceField.value = Number(stockItem.preco || 0).toFixed(2);
}

function parseDiscount(value, total) {
  const text = value.trim();
  if (!text) {
    return { amount: 0, label: 'R$ 0,00' };
  }

  if (text.endsWith('%')) {
    const percent = Number(text.slice(0, -1).replace(',', '.'));
    if (Number.isNaN(percent) || percent < 0) return null;
    if (percent > MAX_DISCOUNT_PERCENT) return null; // inválido por exceder limite
    return { amount: (total * percent) / 100, label: `${percent.toFixed(2)}%` };
  }

  const fixed = Number(text.replace(',', '.'));
  if (Number.isNaN(fixed) || fixed < 0) return null;
  return { amount: fixed, label: `R$ ${fixed.toFixed(2)}` };
}

function updatePiecesTable(root) {
  const table = root.querySelector('#pieces-table');
  const piecesCount = root.querySelector('#pieces-count');

  if (piecesCount) {
    piecesCount.textContent = `${pieces.length}`;
  }

  if (pieces.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-6 text-center text-sm text-slate-500">Nenhuma peça adicionada ainda.</td>
      </tr>
    `;
    updateTotals(root);
    return;
  }

  table.innerHTML = pieces
    .map(
      (item, index) => `
        <tr class="border-t border-slate-200">
          <td class="px-4 py-3 text-slate-700">${item.name}</td>
          <td class="px-4 py-3 text-slate-700">${item.quantity}</td>
          <td class="px-4 py-3 text-slate-700">${formatCurrency(item.price)}</td>
          <td class="px-4 py-3 text-slate-700">
            <button data-remove="${index}" class="text-sm font-semibold text-danger hover:text-danger/80">Remover</button>
          </td>
        </tr>
      `
    )
    .join('');

  table.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const index = Number(event.target.dataset.remove);
      pieces.splice(index, 1);
      updatePiecesTable(root);
    });
  });

  updateTotals(root);
}

function toggleGuinchoField(root) {
  const value = root.querySelector('#guincho').value;
  const field = root.querySelector('#guincho-value-field');
  if (value === 'Sim') {
    field.classList.remove('hidden');
  } else {
    field.classList.add('hidden');
    root.querySelector('#valor-guincho').value = '0';
  }
}

function updateTotals(root) {
  const serviceValue = Number(root.querySelector('#valor-servicos').value) || 0;
  const guinchoValue = root.querySelector('#guincho').value === 'Sim' ? Number(root.querySelector('#valor-guincho').value) || 0 : 0;
  const partsTotal = pieces.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const total = partsTotal + serviceValue + guinchoValue;
  const discountText = root.querySelector('#desconto').value.trim();
  const discountInfo = parseDiscount(discountText, total);

  if (!discountInfo) {
    root.querySelector('#discount-value').textContent = 'Desconto inválido';
    root.querySelector('#total-valor').textContent = formatCurrency(partsTotal);
    root.querySelector('#final-value').textContent = formatCurrency(total);
    return;
  }

  const final = Math.max(total - discountInfo.amount, 0);
  root.querySelector('#total-valor').textContent = formatCurrency(partsTotal);
  root.querySelector('#discount-value').textContent = discountInfo.label;
  root.querySelector('#final-value').textContent = formatCurrency(final);
}

async function loadInventory(root) {
  const pieceList = root.querySelector('#piece-list');
  const { data, error } = await getEstoqueItems();

  if (error) {
    inventory = [];
    if (pieceList) pieceList.innerHTML = '';
    console.error('Erro ao carregar inventário do Supabase:', error.message);
    return;
  }

  inventory = data || [];
  if (pieceList) {
    pieceList.innerHTML = inventory.map((item) => `<option value="${item.nome}"></option>`).join('');
  }
  await fillPiecePriceFromStock(root);
}

async function refreshInventory(root) {
  await loadInventory(root);

  await Swal.fire({
    icon: 'success',
    title: 'Estoque atualizado',
    text: 'Os preços foram carregados novamente do Supabase.'
  });
}

async function addPiece(root) {
  const name = root.querySelector('#piece-name').value.trim();
  const quantity = Number(root.querySelector('#piece-quantity').value);
  let price = Number(root.querySelector('#piece-price').value);
  let stockItem = getStockItem(name);

  if (!name || quantity <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Dados inválidos',
      text: 'Preencha nome e quantidade corretamente.'
    });
    return;
  }

  try {
    const freshStockItem = await getFreshStockItem(name);
    if (freshStockItem) {
      stockItem = freshStockItem;
      price = Number(freshStockItem.preco || 0);
      root.querySelector('#piece-price').value = price.toFixed(2);
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro ao buscar preço',
      text: error.message || 'Não foi possível consultar o preço da peça no Supabase.'
    });
    return;
  }

  if (!root.querySelector('#piece-price').value.trim()) {
    if (stockItem) {
      price = Number(stockItem.preco || 0);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Preço obrigatório',
        text: 'Essa peça não está cadastrada no estoque. Informe o preço unitário para continuar.'
      });
      return;
    }
  }

  if (stockItem && price <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Preço não encontrado',
      text: 'Essa peça está no estoque, mas o preço dela está zerado no Supabase.'
    });
    return;
  }

  if (stockItem && quantity > stockItem.quantidade) {
    Swal.fire({
      icon: 'warning',
      title: 'Estoque insuficiente',
      text: `A quantidade disponível de ${stockItem.nome} é ${stockItem.quantidade}.`
    });
    return;
  }

  pieces.push({
    name,
    quantity,
    price,
    estoque_id: stockItem?.id ?? null
  });

  root.querySelector('#piece-name').value = '';
  root.querySelector('#piece-quantity').value = '';
  root.querySelector('#piece-price').value = '';
  updatePiecesTable(root);
}

function clearForm(root) {
  Swal.fire({
    title: 'Limpar formulário?',
    text: 'Todos os dados serão removidos.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sim, limpar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      root.querySelector('#nota-form').reset();
      pieces = [];
      updatePiecesTable(root);
      toggleGuinchoField(root);
      updateTotals(root);
    }
  });
}

async function submitForm(event, root) {
  event.preventDefault();

  const cliente = root.querySelector('#cliente').value.trim();
  const carro = root.querySelector('#carro').value.trim();
  const servicos = root.querySelector('#servicos').value.trim();
  const valorServicos = Number(root.querySelector('#valor-servicos').value) || 0;
  const guinchoValue = root.querySelector('#guincho').value;
  const guincho = guinchoValue === 'Sim';
  const valorGuincho = guincho ? Number(root.querySelector('#valor-guincho').value) || 0 : 0;
  const descontoText = root.querySelector('#desconto').value.trim();
  const descricao = root.querySelector('#descricao').value.trim();
  const mecanico = root.querySelector('#mecanico')?.value.trim() || '';
  const clienteData = clientes.find((item) => item.nome === cliente);

  if (!cliente || !carro || !servicos || !guinchoValue) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Preencha todos os campos obrigatórios antes de concluir.'
    });
    return;
  }

  if (pieces.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Adicione pelo menos uma peça',
      text: 'Inclua as peças utilizadas no serviço.'
    });
    return;
  }
  // validar valores negativos
  if (valorServicos < 0 || valorGuincho < 0) {
    Swal.fire({ icon: 'warning', title: 'Valores inválidos', text: 'Valores não podem ser negativos.' });
    return;
  }

  for (const p of pieces) {
    if (p.price < 0 || p.quantity <= 0) {
      Swal.fire({ icon: 'warning', title: 'Peças inválidas', text: 'Verifique preço e quantidade das peças.' });
      return;
    }
  }
  const partsTotal = pieces.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const total = partsTotal + valorServicos + valorGuincho;
  const discountInfo = parseDiscount(descontoText, total);
  if (!discountInfo) {
    Swal.fire({
      icon: 'warning',
      title: 'Desconto inválido',
      text: 'Informe o desconto em porcentagem ou valor válido.'
    });
    return;
  }

  const finalValue = Math.max(total - discountInfo.amount, 0);

  const noteRecord = {
    cliente,
    telefone: clienteData?.telefone || '',
    marca: clienteData?.marca || '',
    carro,
    servicos,
    mecanico,
    pagamento: '',
    tipo: 'Orçamento',
    guincho,
    valor_guincho: valorGuincho,
    valor_servicos: valorServicos,
    desconto: discountInfo.amount,
    desconto_text: descontoText,
    observacoes: descricao,
    valor_total: total,
    valor_final: finalValue,
    pecas: pieces,
    data_orcamento: new Date().toISOString()
  };

  const { error } = await createNota(noteRecord);
  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Erro ao registrar nota',
      text: error.message
    });
    return;
  }

  await Promise.all(
    pieces
      .filter((item) => item.estoque_id)
      .map(async (item) => {
        const stockItem = inventory.find((entry) => entry.id === item.estoque_id);
        if (!stockItem) return;
        const newQuantity = Math.max(stockItem.quantidade - item.quantity, 0);
        await updateEstoqueQuantity(stockItem.id, newQuantity);
      })
  );

  await Swal.fire({
    icon: 'success',
    title: 'Nota concluída',
    text: 'A nota foi registrada com sucesso.'
  });

  const printNow = await Swal.fire({
    icon: 'question',
    title: 'Deseja imprimir agora?',
    showCancelButton: true,
    confirmButtonText: 'Imprimir agora',
    cancelButtonText: 'Não'
  });

  if (printNow.isConfirmed) {
    // abrir janela de impressão com os dados do orçamento
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(buildOrcamentoPrintHtml(noteRecord));
      printWindow.document.close();
      printWindow.focus();
    } else {
      Swal.fire({ icon: 'error', title: 'Falha ao abrir impressão', text: 'Permita pop-ups para imprimir.' });
    }
  }

  window.location.hash = 'home';
}
