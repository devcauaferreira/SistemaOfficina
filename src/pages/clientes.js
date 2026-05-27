import Swal from 'sweetalert2';
import { createCliente, createEndereco, getClientesComCpf } from '../lib/db.js';

export function renderClientes(root) {
  root.innerHTML = `
    <div class="page-shell">
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
            <input id="cliente-marca" class="form-field" type="text" required list="marcas-list" placeholder="Ex: Chevrolet" />
            <datalist id="marcas-list">
              <option value="Chevrolet"></option>
              <option value="Volkswagen"></option>
              <option value="Fiat"></option>
              <option value="Ford"></option>
              <option value="Toyota"></option>
              <option value="Honda"></option>
              <option value="Hyundai"></option>
              <option value="Renault"></option>
              <option value="Jeep"></option>
              <option value="Nissan"></option>
              <option value="Peugeot"></option>
              <option value="Citroën"></option>
              <option value="Mitsubishi"></option>
              <option value="Kia"></option>
              <option value="Mercedes-Benz"></option>
              <option value="BMW"></option>
              <option value="Audi"></option>
              <option value="Volvo"></option>
              <option value="Chery"></option>
              <option value="Caoa Chery"></option>
            </datalist>
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
            <input id="cliente-cor" class="form-field" type="text" required list="cores-list" placeholder="Ex: Prata" />
            <datalist id="cores-list">
              <option value="Branco"></option>
              <option value="Preto"></option>
              <option value="Prata"></option>
              <option value="Cinza"></option>
              <option value="Vermelho"></option>
              <option value="Azul"></option>
              <option value="Bege"></option>
              <option value="Marrom"></option>
              <option value="Verde"></option>
              <option value="Amarelo"></option>
              <option value="Dourado"></option>
              <option value="Laranja"></option>
              <option value="Vinho"></option>
            </datalist>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">CEP</label>
            <input id="cliente-cep" class="form-field" type="text" placeholder="00000-000" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Rua</label>
            <input id="cliente-rua" class="form-field" type="text" placeholder="Ex: Rua das Flores" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Número da casa</label>
            <input id="cliente-numero" class="form-field" type="text" placeholder="Ex: 123" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Bairro</label>
            <input id="cliente-bairro" class="form-field" type="text" placeholder="Ex: Centro" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Cidade</label>
            <input id="cliente-cidade" class="form-field" type="text" placeholder="Ex: Itu" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Estado</label>
            <input id="cliente-estado" class="form-field" type="text" maxlength="2" placeholder="Ex: SP" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Complemento</label>
            <input id="cliente-complemento" class="form-field" type="text" placeholder="Ex: Casa 2" />
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
    </div>
  `;

  const form = root.querySelector('#cliente-form');
  const telefoneField = root.querySelector('#cliente-telefone');
  const cpfField = root.querySelector('#cliente-cpf');
  const placaField = root.querySelector('#cliente-placa');
  const cepField = root.querySelector('#cliente-cep');
  const capitalizedFields = [
    root.querySelector('#cliente-nome'),
    root.querySelector('#cliente-marca'),
    root.querySelector('#cliente-veiculo'),
    root.querySelector('#cliente-cor'),
    root.querySelector('#cliente-rua'),
    root.querySelector('#cliente-bairro'),
    root.querySelector('#cliente-cidade'),
    root.querySelector('#cliente-complemento'),
    root.querySelector('#cliente-descricao')
  ];

  telefoneField.addEventListener('input', () => {
    telefoneField.value = maskTelefone(telefoneField.value);
  });

  cpfField.addEventListener('input', () => {
    cpfField.value = maskCpf(cpfField.value);
  });

  placaField.addEventListener('input', () => {
    placaField.value = maskPlaca(placaField.value);
  });

  cepField.addEventListener('input', () => {
    cepField.value = maskCep(cepField.value);
  });

  cepField.addEventListener('blur', () => buscarEnderecoPorCep(root));

  // ordenar opções de marcas alfabeticamente
  (function sortMarcas() {
    try {
      const datalist = root.querySelector('#marcas-list');
      const options = Array.from(datalist.querySelectorAll('option')).map(o => o.value).filter(Boolean);
      options.sort((a, b) => a.localeCompare(b, 'pt-BR'));
      datalist.innerHTML = options.map(m => `<option value="${m}"></option>`).join('');
    } catch (e) {}
  })();

  root.querySelector('#cliente-estado').addEventListener('input', (event) => {
    event.target.value = event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  });

  capitalizedFields.forEach((field) => {
    field.addEventListener('blur', () => {
      field.value = capitalizeWords(field.value);
    });
  });

  form.addEventListener('submit', handleSubmit);
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
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

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
  const plate = String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7);

  if (/^[A-Z]{3}\d{4}$/.test(plate)) {
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  }

  return plate;
}

function isValidPlaca(value) {
  const plate = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^[A-Z]{3}\d{4}$/.test(plate) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate);
}

function isValidCpfNumber(value) {
  const cpf = onlyDigits(value);
  if (!cpf || cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calc = (t) => {
    let sum = 0;
    for (let i = 0; i < t - 1; i++) sum += parseInt(cpf.charAt(i)) * (t - i);
    let rev = 11 - (sum % 11);
    return rev >= 10 ? 0 : rev;
  };

  return calc(10) === parseInt(cpf.charAt(9)) && calc(11) === parseInt(cpf.charAt(10));
}

async function cpfJaCadastrado(cpf) {
  const cpfDigits = onlyDigits(cpf);
  if (!cpfDigits) return { exists: false, error: null };

  const { data, error } = await getClientesComCpf();
  if (error) return { exists: false, error };

  const exists = (data || []).some((cliente) => onlyDigits(cliente.cpf) === cpfDigits);
  return { exists, error: null };
}

function montarEndereco({ rua, numero, bairro, cidade, estado, complemento }) {
  const ruaComNumero = [rua, numero].filter(Boolean).join(', ');
  return [ruaComNumero, bairro, cidade, estado, complemento].filter(Boolean).join(' - ');
}

async function buscarEnderecoPorCep(root) {
  const cepField = root.querySelector('#cliente-cep');
  const ruaField = root.querySelector('#cliente-rua');
  const bairroField = root.querySelector('#cliente-bairro');
  const cidadeField = root.querySelector('#cliente-cidade');
  const estadoField = root.querySelector('#cliente-estado');
  const cep = onlyDigits(cepField.value);

  if (!cep) return;

  if (cep.length !== 8) {
    await Swal.fire({
      icon: 'warning',
      title: 'CEP inválido',
      text: 'Informe um CEP com 8 dígitos.'
    });
    return;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) {
      throw new Error('Não foi possível consultar o CEP.');
    }

    const data = await response.json();

    if (data.erro) {
      await Swal.fire({
        icon: 'warning',
        title: 'CEP não encontrado',
        text: 'Verifique o CEP informado.'
      });
      return;
    }

    ruaField.value = capitalizeWords(data.logradouro || '');
    bairroField.value = capitalizeWords(data.bairro || '');
    cidadeField.value = capitalizeWords(data.localidade || '');
    estadoField.value = String(data.uf || '').toUpperCase();
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Erro ao buscar endereço',
      text: error.message || 'Não foi possível consultar o CEP agora.'
    });
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const nome = capitalizeWords(form['cliente-nome'].value.trim());
  const telefone = form['cliente-telefone'].value.trim();
  const marca = capitalizeWords(form['cliente-marca'].value.trim());
  const veiculo = capitalizeWords(form['cliente-veiculo'].value.trim());
  const placa = form['cliente-placa'].value.trim();
  const cpf = form['cliente-cpf'].value.trim();
  const cep = form['cliente-cep'].value.trim();
  const cor = capitalizeWords(form['cliente-cor'].value.trim());
  const rua = capitalizeWords(form['cliente-rua'].value.trim());
  const numero = form['cliente-numero'].value.trim();
  const bairro = capitalizeWords(form['cliente-bairro'].value.trim());
  const cidade = capitalizeWords(form['cliente-cidade'].value.trim());
  const estado = form['cliente-estado'].value.trim().toUpperCase();
  const complemento = capitalizeWords(form['cliente-complemento'].value.trim());

  if (!nome || !telefone || !marca || !veiculo || !placa || !cor) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Preencha todos os campos marcados como obrigatórios.'
    });
    return;
  }

  const telefoneDigits = onlyDigits(telefone);
  if (telefoneDigits.length < 10 || telefoneDigits.length > 11) {
    Swal.fire({
      icon: 'warning',
      title: 'Telefone inválido',
      text: 'Informe um telefone com DDD.'
    });
    return;
  }

  if (cpf && onlyDigits(cpf).length !== 11) {
    Swal.fire({
      icon: 'warning',
      title: 'CPF inválido',
      text: 'Informe um CPF com 11 dígitos.'
    });
    return;
  }

  if (cpf && !isValidCpfNumber(cpf)) {
    Swal.fire({
      icon: 'warning',
      title: 'CPF inválido',
      text: 'O CPF informado não passou na validação do dígito verificador.'
    });
    return;
  }

  if (cep && onlyDigits(cep).length !== 8) {
    Swal.fire({
      icon: 'warning',
      title: 'CEP inválido',
      text: 'Informe um CEP com 8 dígitos.'
    });
    return;
  }

  if (!isValidPlaca(placa)) {
    Swal.fire({
      icon: 'warning',
      title: 'Placa inválida',
      text: 'Informe uma placa no formato ABC-1234 ou ABC1D23.'
    });
    return;
  }

  if (estado && estado.length !== 2) {
    Swal.fire({
      icon: 'warning',
      title: 'Estado inválido',
      text: 'Informe o estado com 2 letras, por exemplo SP.'
    });
    return;
  }

  const { exists, error: cpfError } = await cpfJaCadastrado(cpf);
  if (cpfError) {
    Swal.fire({
      icon: 'error',
      title: 'Erro ao verificar CPF',
      text: cpfError.message
    });
    return;
  }

  if (exists) {
    Swal.fire({
      icon: 'warning',
      title: 'CPF já cadastrado',
      text: 'Já existe um cliente cadastrado com este CPF.'
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
    cep,
    rua,
    numero,
    bairro,
    cidade,
    estado,
    complemento,
    local: montarEndereco({ rua, numero, bairro, cidade, estado, complemento }),
    descricao: capitalizeWords(form['cliente-descricao'].value.trim())
  };

  const { data: clienteCriado, error } = await createCliente(record);

  if (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Erro ao salvar',
      text: error.message
    });
    return;
  }

  const enderecoPreenchido = cep || rua || numero || bairro || cidade || estado || complemento;
  if (enderecoPreenchido && clienteCriado?.id) {
    const { error: enderecoError } = await createEndereco({
      cliente_id: clienteCriado.id,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
      complemento,
      endereco_completo: record.local
    });

    if (enderecoError) {
      await Swal.fire({
        icon: 'error',
        title: 'Cliente salvo, mas endereço não',
        text: enderecoError.message
      });
      return;
    }
  }

  await Swal.fire({
    icon: 'success',
    title: 'Cliente cadastrado',
    text: 'Os dados do cliente foram registrados com sucesso.'
  });

  form.reset();
  window.location.hash = 'home';
}
