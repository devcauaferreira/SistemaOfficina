import Swal from 'sweetalert2';

export function renderEmpresa(root) {
  root.innerHTML = `
    <div class="mx-auto max-w-4xl px-4 py-8">
      <header class="mb-6">
        <h1 class="text-2xl font-bold text-slate-900">Cadastro da oficina</h1>
        <p class="mt-2 text-sm text-slate-500">Busque pelo CNPJ para preencher automaticamente os dados.</p>
      </header>

      <section class="card p-6">
        <div class="grid gap-4 md:grid-cols-3">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700">CNPJ</label>
            <div class="mt-2 flex gap-2">
              <input id="cnpj-input" class="form-field" placeholder="00.000.000/0000-00" />
              <button id="buscar-cnpj" class="btn-primary">Buscar</button>
            </div>
          </div>
          <div class="flex flex-col items-start">
            <label class="text-sm font-medium text-slate-700">Logo</label>
            <input id="logo-file" type="file" accept="image/*" class="mt-2" />
            <img id="logo-preview" src="" alt="preview" class="mt-3 hidden h-20 w-20 rounded-md object-cover shadow-sm" />
          </div>
        </div>

        <hr class="my-6" />

        <div id="empresa-result" class="space-y-3 text-sm text-slate-700"></div>

        <div class="mt-6 flex items-center gap-3">
          <button id="salvar-empresa" class="btn-primary">Salvar oficina</button>
          <button id="limpar-empresa" class="btn-secondary">Limpar</button>
        </div>
      </section>
    </div>
  `;

  const cnpjInput = root.querySelector('#cnpj-input');
  const buscarBtn = root.querySelector('#buscar-cnpj');
  const resultBox = root.querySelector('#empresa-result');
  const salvarBtn = root.querySelector('#salvar-empresa');
  const limparBtn = root.querySelector('#limpar-empresa');
  const logoFile = root.querySelector('#logo-file');
  const logoPreview = root.querySelector('#logo-preview');

  // load existing
  const existing = JSON.parse(localStorage.getItem('empresa') || 'null');
  if (existing) showResult(existing);

  logoFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      logoPreview.src = reader.result;
      logoPreview.classList.remove('hidden');
      // store temporarily in data attribute
      logoPreview.dataset.image = reader.result;
    };
    reader.readAsDataURL(file);
  });

  buscarBtn.addEventListener('click', async () => {
    const raw = (cnpjInput.value || '').replace(/\D/g, '');
    if (!raw || raw.length !== 14) return Swal.fire({ icon: 'warning', title: 'CNPJ inválido', text: 'Informe um CNPJ com 14 dígitos.' });
    buscarBtn.disabled = true;
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`);
      if (!res.ok) throw new Error('CNPJ não encontrado');
      const data = await res.json();
      showResult(data);
    } catch (err) {
      await Swal.fire({ icon: 'error', title: 'Erro', text: err.message });
    } finally {
      buscarBtn.disabled = false;
    }
  });

  function showResult(data) {
    resultBox.innerHTML = `
      <p><strong>Razão social:</strong> ${data.razao_social || data.nome || '-'}</p>
      <p><strong>Nome fantasia:</strong> ${data.nome_fantasia || '-'}</p>
      <p><strong>Atividade:</strong> ${data.cnae_fiscal || '-'}</p>
      <p><strong>Telefone:</strong> ${data.ddd_telefone_1 || '-'} ${data.telefone_1 || ''}</p>
      <p><strong>Endereço:</strong> ${[data.tipo_logradouro, data.logradouro, data.numero, data.municipio, data.uf].filter(Boolean).join(', ')}</p>
    `;
  }

  salvarBtn.addEventListener('click', async () => {
    const empresa = {
      cnpj: (cnpjInput.value || '').replace(/\D/g, ''),
      logo: logoPreview.dataset.image || null,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('empresa', JSON.stringify(empresa));
    await Swal.fire({ icon: 'success', title: 'Oficina salva', text: 'Dados da oficina foram salvos localmente.' });
  });

  limparBtn.addEventListener('click', () => {
    localStorage.removeItem('empresa');
    resultBox.innerHTML = '';
    cnpjInput.value = '';
    logoPreview.src = '';
    logoPreview.classList.add('hidden');
    delete logoPreview.dataset.image;
  });
}

export default renderEmpresa;
