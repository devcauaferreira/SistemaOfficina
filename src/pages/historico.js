import Swal from 'sweetalert2';
import { getClienteById, getClientes, getClientesComCpf, getNotas, replaceEnderecosCliente, updateCliente } from '../lib/db.js';

export function renderHistorico(root) {
  root.innerHTML = `
    <div class="page-shell">
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
      </section>
      </div>
    </div>
  `;

  root.querySelector('#search-button').addEventListener('click', () => loadClients(root));
  loadClients(root);
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function capitalizeWords(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/(^|\s|[.,/-])([a-záàâãéèêíïóôõöúçñ])/g, (match, separator, letter) => {
      return `${separator}${letter.toUpperCase()}`;
    });
}

function maskTelefone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function maskCep(value) {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function maskPlaca(value) {
  const plate = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

  if (/^[A-Z]{3}\d{4}$/.test(plate)) return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  return plate;
}

function isValidPlaca(value) {
  const plate = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^[A-Z]{3}\d{4}$/.test(plate) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate);
}

function montarEndereco({ rua, numero, bairro, cidade, estado, complemento }) {
  const ruaComNumero = [rua, numero].filter(Boolean).join(', ');
  return [ruaComNumero, bairro, cidade, estado, complemento].filter(Boolean).join(' - ');
}

function inputHtml(id, label, value, extra = '') {
  return `
    <label class="block text-sm font-medium text-slate-700" for="${id}">${label}</label>
    <input id="${id}" class="swal2-input" value="${String(value || '').replaceAll('"', '&quot;')}" ${extra} style="width:100%;margin:0 0 10px;" />
  `;
}

function getClientNotes(notes, client) {
  return notes.filter((note) => normalizeText(note.cliente) === normalizeText(client.nome));
}

function getAbatements(notes) {
  return notes.flatMap((note) => {
    const lines = String(note.observacoes || '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('Abatimento em '));

    return lines.map((line) => {
      const date = line.match(/^Abatimento em (.*?):/)?.[1] || '-';
      const amount = line.match(/:\s*(R\$\s*[\d.,]+)/)?.[1] || '-';
      const remaining = line.match(/Saldo restante:\s*(R\$\s*[\d.,]+)/)?.[1] || '-';

      return {
        date,
        amount,
        remaining,
        car: note.carro || '-',
        service: note.servicos || '-'
      };
    });
  });
}

function renderAbatementsHistory(notes, emptyClass = 'mt-4 rounded-[32px] border border-slate-200 bg-slate-50 p-6') {
  const abatements = getAbatements(notes);

  if (!abatements.length) {
    return `
      <section class="${emptyClass}">
        <h4 class="text-lg font-bold text-slate-900">Histórico de abatimentos</h4>
        <p class="mt-2 text-sm text-slate-500">Nenhum valor abatido foi registrado para este cliente.</p>
      </section>
    `;
  }

  return `
    <section class="mt-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 class="text-lg font-bold text-slate-900">Histórico de abatimentos</h4>
          <p class="text-sm text-slate-500">Valores pagos parcialmente em pendências do cliente.</p>
        </div>
        <span class="status-badge">${abatements.length} abatimento(s)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="bg-slate-100 text-left text-slate-600">
              <th class="border-b border-slate-200 px-4 py-3">Data</th>
              <th class="border-b border-slate-200 px-4 py-3">Carro</th>
              <th class="border-b border-slate-200 px-4 py-3">Valor abatido</th>
              <th class="border-b border-slate-200 px-4 py-3">Saldo restante</th>
              <th class="border-b border-slate-200 px-4 py-3">Serviço</th>
            </tr>
          </thead>
          <tbody>
            ${abatements
              .map(
                (item) => `
                  <tr class="border-t border-slate-200">
                    <td class="px-4 py-3 text-slate-700">${item.date}</td>
                    <td class="px-4 py-3 text-slate-700">${item.car}</td>
                    <td class="px-4 py-3 font-semibold text-green-700">${item.amount}</td>
                    <td class="px-4 py-3 font-semibold text-danger">${item.remaining}</td>
                    <td class="px-4 py-3 text-slate-700">${item.service}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
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
            <div class="flex flex-wrap gap-3">
              <a href="#historico-cliente?id=${encodeURIComponent(client.id)}" class="btn-secondary">Ver histórico</a>
              <button data-edit-client="${client.id}" class="btn-primary">Alterar cadastro</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  clientsList.querySelectorAll('[data-edit-client]').forEach((button) => {
    button.addEventListener('click', async () => {
      const client = data.find((item) => String(item.id) === button.dataset.editClient);
      if (!client) return;
      await editarCliente(root, client);
    });
  });
}

async function buscarEnderecoPorCepNoModal(showMessages = false) {
  const popup = Swal.getPopup();
  const cep = onlyDigits(popup.querySelector('#edit-cep').value);

  if (!cep) return;

  if (cep.length !== 8) {
    if (showMessages) {
      Swal.showValidationMessage('Informe um CEP com 8 dígitos para buscar o endereço.');
    }
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      throw new Error('Não foi possível consultar o CEP.');
    }

    const data = await response.json();
    if (data.erro) {
      if (showMessages) {
        Swal.showValidationMessage('CEP não encontrado. Verifique o número informado.');
      }
      return;
    }

    popup.querySelector('#edit-rua').value = capitalizeWords(data.logradouro || '');
    popup.querySelector('#edit-bairro').value = capitalizeWords(data.bairro || '');
    popup.querySelector('#edit-cidade').value = capitalizeWords(data.localidade || '');
    popup.querySelector('#edit-estado').value = String(data.uf || '').toUpperCase();

    if (showMessages) {
      Swal.resetValidationMessage();
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error?.message || error);
    if (showMessages) {
      Swal.showValidationMessage(error.message || 'Não foi possível consultar o CEP agora.');
    }
  }
}

async function cpfJaCadastradoEmOutroCliente(cpf, clienteId) {
  const cpfDigits = onlyDigits(cpf);
  if (!cpfDigits) return { exists: false, error: null };

  const { data, error } = await getClientesComCpf();
  if (error) return { exists: false, error };

  const exists = (data || []).some((cliente) => String(cliente.id) !== String(clienteId) && onlyDigits(cliente.cpf) === cpfDigits);
  return { exists, error: null };
}

async function editarCliente(root, client, onUpdated = null) {
  const { value: changes, isConfirmed } = await Swal.fire({
    title: 'Alterar dados do cliente',
    html: `
      <div class="space-y-2 text-left">
        ${inputHtml('edit-nome', 'Nome', client.nome)}
        ${inputHtml('edit-telefone', 'Telefone', client.telefone)}
        ${inputHtml('edit-cpf', 'CPF', client.cpf)}
        ${inputHtml('edit-marca', 'Marca do veículo', client.marca)}
        ${inputHtml('edit-veiculo', 'Modelo / veículo', client.veiculo)}
        ${inputHtml('edit-cor', 'Cor do veículo', client.cor)}
        ${inputHtml('edit-placa', 'Placa do veículo', client.placa)}
        <label class="block text-sm font-medium text-slate-700" for="edit-cep">CEP</label>
        <div style="display:flex;gap:10px;margin:0 0 10px;">
          <input id="edit-cep" class="swal2-input" value="${client.cep || ''}" style="flex:1;width:auto;margin:0;" />
          <button id="edit-buscar-cep" type="button" class="swal2-confirm swal2-styled" style="margin:0;">Buscar CEP</button>
        </div>
        ${inputHtml('edit-rua', 'Rua', client.rua)}
        ${inputHtml('edit-numero', 'Número da casa', client.numero)}
        ${inputHtml('edit-bairro', 'Bairro', client.bairro)}
        ${inputHtml('edit-cidade', 'Cidade', client.cidade)}
        ${inputHtml('edit-estado', 'Estado', client.estado, 'maxlength="2"')}
        ${inputHtml('edit-complemento', 'Complemento', client.complemento)}
        <label class="block text-sm font-medium text-slate-700" for="edit-descricao">Descrição</label>
        <textarea id="edit-descricao" class="swal2-textarea" style="width:100%;margin:0;">${client.descricao || ''}</textarea>
      </div>
    `,
    width: 720,
    showCancelButton: true,
    confirmButtonText: 'Salvar alterações',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      const popup = Swal.getPopup();
      popup.querySelector('#edit-telefone').addEventListener('input', (event) => {
        event.target.value = maskTelefone(event.target.value);
      });
      popup.querySelector('#edit-cpf').addEventListener('input', (event) => {
        event.target.value = maskCpf(event.target.value);
      });
      popup.querySelector('#edit-placa').addEventListener('input', (event) => {
        event.target.value = maskPlaca(event.target.value);
      });
      popup.querySelector('#edit-cep').addEventListener('input', (event) => {
        event.target.value = maskCep(event.target.value);
        if (onlyDigits(event.target.value).length === 8) {
          buscarEnderecoPorCepNoModal(false);
        }
      });
      popup.querySelector('#edit-cep').addEventListener('blur', () => buscarEnderecoPorCepNoModal(false));
      popup.querySelector('#edit-buscar-cep').addEventListener('click', () => buscarEnderecoPorCepNoModal(true));
      popup.querySelector('#edit-estado').addEventListener('input', (event) => {
        event.target.value = event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
      });
    },
    preConfirm: async () => {
      const popup = Swal.getPopup();
      const nome = capitalizeWords(popup.querySelector('#edit-nome').value.trim());
      const telefone = popup.querySelector('#edit-telefone').value.trim();
      const cpf = popup.querySelector('#edit-cpf').value.trim();
      const marca = capitalizeWords(popup.querySelector('#edit-marca').value.trim());
      const veiculo = capitalizeWords(popup.querySelector('#edit-veiculo').value.trim());
      const cor = capitalizeWords(popup.querySelector('#edit-cor').value.trim());
      const placa = popup.querySelector('#edit-placa').value.trim();
      const cep = popup.querySelector('#edit-cep').value.trim();
      const rua = capitalizeWords(popup.querySelector('#edit-rua').value.trim());
      const numero = popup.querySelector('#edit-numero').value.trim();
      const bairro = capitalizeWords(popup.querySelector('#edit-bairro').value.trim());
      const cidade = capitalizeWords(popup.querySelector('#edit-cidade').value.trim());
      const estado = popup.querySelector('#edit-estado').value.trim().toUpperCase();
      const complemento = capitalizeWords(popup.querySelector('#edit-complemento').value.trim());
      const descricao = capitalizeWords(popup.querySelector('#edit-descricao').value.trim());

      if (!nome || !telefone || !marca || !veiculo || !placa || !cor) {
        Swal.showValidationMessage('Preencha nome, telefone, marca, veículo, placa e cor.');
        return false;
      }

      const telefoneDigits = onlyDigits(telefone);
      if (telefoneDigits.length < 10 || telefoneDigits.length > 11) {
        Swal.showValidationMessage('Informe um telefone com DDD.');
        return false;
      }

      if (cpf && onlyDigits(cpf).length !== 11) {
        Swal.showValidationMessage('Informe um CPF com 11 dígitos.');
        return false;
      }

      if (cep && onlyDigits(cep).length !== 8) {
        Swal.showValidationMessage('Informe um CEP com 8 dígitos.');
        return false;
      }

      if (!isValidPlaca(placa)) {
        Swal.showValidationMessage('Informe uma placa no formato ABC-1234 ou ABC1D23.');
        return false;
      }

      if (estado && estado.length !== 2) {
        Swal.showValidationMessage('Informe o estado com 2 letras, por exemplo SP.');
        return false;
      }

      const { exists, error } = await cpfJaCadastradoEmOutroCliente(cpf, client.id);
      if (error) {
        Swal.showValidationMessage(error.message);
        return false;
      }

      if (exists) {
        Swal.showValidationMessage('Já existe outro cliente cadastrado com este CPF.');
        return false;
      }

      return {
        nome,
        telefone,
        cpf,
        marca,
        veiculo,
        cor,
        placa,
        cep,
        rua,
        numero,
        bairro,
        cidade,
        estado,
        complemento,
        local: montarEndereco({ rua, numero, bairro, cidade, estado, complemento }),
        descricao
      };
    }
  });

  if (!isConfirmed) return;

  const { error } = await updateCliente(client.id, changes);
  if (error) {
    await Swal.fire({ icon: 'error', title: 'Erro ao atualizar cliente', text: error.message });
    return;
  }

  const enderecoPreenchido = changes.cep || changes.rua || changes.numero || changes.bairro || changes.cidade || changes.estado || changes.complemento;
  if (enderecoPreenchido) {
    const { error: enderecoError } = await replaceEnderecosCliente(client.id, {
      cep: changes.cep,
      rua: changes.rua,
      numero: changes.numero,
      bairro: changes.bairro,
      cidade: changes.cidade,
      estado: changes.estado,
      complemento: changes.complemento,
      endereco_completo: changes.local
    });

    if (enderecoError) {
      await Swal.fire({ icon: 'error', title: 'Cliente atualizado, mas endereço não', text: enderecoError.message });
      return;
    }
  }

  await Swal.fire({
    icon: 'success',
    title: 'Cliente atualizado',
    text: 'As informações do cliente foram alteradas com sucesso.'
  });

  if (onUpdated) {
    await onUpdated();
    return;
  }

  await loadClients(root);
}

export async function renderHistoricoCliente(root, clientId) {
  root.innerHTML = `
    <div class="page-shell">
      <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase text-primary">Histórico de abatimentos</p>
          <h1 id="client-history-title" class="mt-2 text-3xl font-bold text-slate-900">Carregando cliente...</h1>
          <p class="mt-2 text-sm text-slate-500">Valores abatidos nas pendências do cliente selecionado.</p>
        </div>
        <a href="#historico" class="btn-secondary">Voltar</a>
      </div>

      <section id="client-history-page" class="space-y-4">
        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">Carregando histórico de abatimentos...</div>
      </section>
      </div>
    </div>
  `;

  const historyContainer = root.querySelector('#client-history-page');

  if (!clientId) {
    historyContainer.innerHTML = `
      <div class="rounded-3xl border border-danger bg-red-50 p-6 text-danger">
        Cliente não informado para carregar o histórico.
      </div>
    `;
    return;
  }

  const { data: client, error: clientError } = await getClienteById(clientId);

  if (clientError) {
    historyContainer.innerHTML = `
      <div class="rounded-3xl border border-danger bg-red-50 p-6 text-danger">
        Não foi possível carregar o cliente: ${clientError.message}
      </div>
    `;
    return;
  }

  root.querySelector('#client-history-title').textContent = `Histórico de ${client.nome}`;

  const { data, error } = await getNotas(client.nome);
  if (error) {
    historyContainer.innerHTML = `
      <div class="rounded-3xl border border-danger bg-red-50 p-6 text-danger">
        Não foi possível carregar as notas do cliente: ${error.message}
      </div>
    `;
    return;
  }

  const notes = getClientNotes(Array.isArray(data) ? data : [], client);

  historyContainer.innerHTML = `
    <div class="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 class="text-xl font-bold text-slate-900">${client.nome}</h3>
          <p class="mt-2 text-sm text-slate-500">Veículo: ${client.veiculo} · Placa: ${client.placa} · Telefone: ${client.telefone}</p>
        </div>
        <button id="edit-current-client" class="btn-primary">Alterar cadastro</button>
      </div>
    </div>
    ${renderAbatementsHistory(notes, 'rounded-[32px] border border-slate-200 bg-slate-50 p-6')}
  `;

  if (!notes.length) {
    historyContainer.innerHTML += `
      <div class="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-500">
        Não há notas registradas para este cliente.
      </div>
    `;
  }

  historyContainer.querySelector('#edit-current-client').addEventListener('click', async () => {
    await editarCliente(root, client, () => renderHistoricoCliente(root, client.id));
  });
}
