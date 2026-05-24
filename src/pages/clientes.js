import Swal from 'sweetalert2';
import { createCliente } from '../lib/db.js';

export function renderClientes(root) {
  root.innerHTML = `
    <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase text-primary">Cadastro de cliente</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Novo cliente</h1>
          <p class="mt-2 text-sm text-slate-500">Informe os dados obrigatórios e os dados adicionais do veículo.</p>
        </div>
        <a href="#home" class="btn-secondary">Voltar</a>
      </div>

      <form id="cliente-form" class="space-y-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div class="grid gap-6 lg:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Nome</label>
            <input id="cliente-nome" class="form-field" type="text" required placeholder="Ex: João Silva" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Telefone</label>
            <input id="cliente-telefone" class="form-field" type="tel" required placeholder="(99) 99999-9999" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Marca do veículo</label>
            <input id="cliente-marca" class="form-field" type="text" required placeholder="Ex: Chevrolet" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Modelo / Veículo</label>
            <input id="cliente-veiculo" class="form-field" type="text" required placeholder="Ex: Corsa" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Placa do veículo</label>
            <input id="cliente-placa" class="form-field" type="text" required placeholder="ABC1D23" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">CPF</label>
            <input id="cliente-cpf" class="form-field" type="text" placeholder="000.000.000-00" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Cor do veículo</label>
            <input id="cliente-cor" class="form-field" type="text" required placeholder="Ex: Prata" />
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Endereço</label>
            <input id="cliente-local" class="form-field" type="text" placeholder="Ex: Rua das Flores, 123" />
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Descrição</label>
          <textarea id="cliente-descricao" class="form-field min-h-[120px]" placeholder="Observações adicionais sobre o cliente ou o veículo"></textarea>
        </div>

        <div class="flex justify-end">
          <button type="submit" class="btn-primary">Salvar cliente</button>
        </div>
      </form>
    </div>
  `;

  root.querySelector('#cliente-form').addEventListener('submit', handleSubmit);
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const nome = form['cliente-nome'].value.trim();
  const telefone = form['cliente-telefone'].value.trim();
  const marca = form['cliente-marca'].value.trim();
  const veiculo = form['cliente-veiculo'].value.trim();
  const placa = form['cliente-placa'].value.trim();
  const cpf = form['cliente-cpf'].value.trim();
  const cor = form['cliente-cor'].value.trim();

  if (!nome || !telefone || !marca || !veiculo || !placa || !cor) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Preencha todos os campos marcados como obrigatórios.'
    });
    return;
  }

  const record = {
    nome,
    telefone,
    marca,
    veiculo,
    cor,
    placa,
    cpf,
    local: form['cliente-local'].value.trim(),
    descricao: form['cliente-descricao'].value.trim()
  };

  const { error } = await createCliente(record);

  if (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Erro ao salvar',
      text: error.message
    });
    return;
  }

  await Swal.fire({
    icon: 'success',
    title: 'Cliente cadastrado',
    text: 'Os dados do cliente foram registrados com sucesso.'
  });

  form.reset();
  window.location.hash = 'home';
}
