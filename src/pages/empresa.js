import Swal from 'sweetalert2';
import {
  applyThemeColor,
  getCompanyData,
  getCompanyDisplayName,
  getCompanyLogo,
  saveCompanyData,
  updateCompanyBranding
} from '../lib/company.js';

const THEME_OPTIONS = [
  { label: 'Verde oficina', value: '#0D9488' },
  { label: 'Azul técnico', value: '#0284C7' },
  { label: 'Laranja forte', value: '#FB923C' },
  { label: 'Roxo moderno', value: '#7C3AED' }
];

export function renderEmpresa(root) {
  const company = getCompanyData();
  root.innerHTML = `
    <div class="page-shell">
      <div class="mx-auto max-w-7xl px-4 py-8">
      <div class="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Empresa</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Cadastro da oficina</h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-500">Cadastre a identidade da oficina com CNPJ, nome de exibição, logo e tema visual. O nome e a imagem aparecem no painel assim que forem informados.</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <a href="#home" class="btn-secondary">Voltar</a>
          <button id="clear-company" class="btn-secondary" type="button">Limpar cadastro</button>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.85fr)]">
        <section class="space-y-6 min-w-0">
          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Consulta</p>
              <h2 class="mt-1 text-xl font-bold text-slate-900">Buscar dados pelo CNPJ</h2>
              <p class="mt-1 text-sm text-slate-500">Os campos serão preenchidos automaticamente quando a consulta for concluída.</p>
            </div>

            <div class="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
              <div class="min-w-0">
                <label class="mb-2 block text-sm font-medium text-slate-700" for="cnpj-input">CNPJ</label>
                <input id="cnpj-input" class="form-field" placeholder="00.000.000/0000-00" value="${formatCnpj(company.cnpj)}" />
              </div>
              <button id="buscar-cnpj" class="btn-primary h-14 w-full whitespace-nowrap" type="button">Consultar CNPJ</button>
            </div>

            <div id="empresa-result" class="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div class="text-slate-500">Nenhuma empresa carregada ainda.</div>
            </div>
          </div>

          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5">
              <p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Identidade</p>
              <h2 class="mt-1 text-xl font-bold text-slate-900">Nome e logotipo</h2>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-slate-700" for="nome-exibicao">Nome de exibição</label>
                <input id="nome-exibicao" class="form-field" placeholder="Nome que aparece no topo do painel" value="${escapeHtml(company.nomeExibicao)}" />
                <p class="mt-2 text-xs text-slate-500">Você pode personalizar esse nome, mesmo depois de consultar o CNPJ.</p>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700" for="razao-social">Razão social</label>
                <input id="razao-social" class="form-field" placeholder="Razão social" value="${escapeHtml(company.razaoSocial)}" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700" for="nome-fantasia">Nome fantasia</label>
                <input id="nome-fantasia" class="form-field" placeholder="Nome fantasia" value="${escapeHtml(company.nomeFantasia)}" />
              </div>
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-slate-700" for="logo-file">Logo da oficina</label>
                <input id="logo-file" type="file" accept="image/*" class="form-field" />
                <p class="mt-2 text-xs text-slate-500">Ao escolher a imagem, o topo do painel muda na hora para facilitar a conferência.</p>
              </div>
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                <img id="logo-preview" src="${getCompanyLogo(company)}" alt="Prévia do logo" class="h-full w-full object-cover" />
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900">Prévia do logo</p>
                <p class="mt-1 text-sm text-slate-500">Essa imagem será usada no painel e nas áreas que exibem a identidade da oficina.</p>
              </div>
            </div>
          </div>

          <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5">
              <p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Personalização</p>
              <h2 class="mt-1 text-xl font-bold text-slate-900">Tema da interface</h2>
              <p class="mt-1 text-sm text-slate-500">Essas cores servem apenas para personalização visual da oficina.</p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              ${THEME_OPTIONS.map(
                (option) => `
                  <button
                    type="button"
                    class="theme-choice flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                    data-theme="${option.value}"
                    style="border-color: ${option.value}33"
                  >
                    <span class="h-10 w-10 rounded-xl shadow-sm" style="background:${option.value}"></span>
                    <span>
                      <span class="block text-sm font-semibold text-slate-900">${option.label}</span>
                      <span class="block text-xs text-slate-500">${option.value}</span>
                    </span>
                  </button>
                `
              ).join('')}
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button id="salvar-empresa" class="btn-primary" type="button">Salvar oficina</button>
          </div>
        </section>

        <aside class="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section class="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Prévia do painel</p>
            <div class="mt-4 flex items-center gap-3">
              <img id="preview-sidebar-logo" src="${getCompanyLogo(company)}" alt="Logo da oficina" class="h-12 w-12 rounded-2xl object-cover shadow-sm" />
              <div>
                <p class="text-sm text-slate-300">Canto superior esquerdo</p>
                <h3 id="preview-sidebar-name" class="text-lg font-bold text-white">${escapeHtml(getCompanyDisplayName(company))}</h3>
              </div>
            </div>
            <div class="mt-6 rounded-3xl bg-white/8 p-4">
              <p class="text-xs uppercase tracking-[0.16em] text-slate-300">Razão social</p>
              <p id="preview-razao" class="mt-2 text-sm font-semibold text-white">${escapeHtml(company.razaoSocial || 'Não informado')}</p>
            </div>
            <div class="mt-4 rounded-3xl bg-primary/20 p-4 ring-1 ring-inset ring-primary/30">
              <p class="text-xs uppercase tracking-[0.16em] text-slate-200">Nome exibido</p>
              <p id="preview-exibicao" class="mt-2 text-lg font-bold text-white">${escapeHtml(company.nomeExibicao || 'Mecânica Pro')}</p>
            </div>
          </section>
        </aside>
      </div>
      </div>
    `;

  const cnpjInput = root.querySelector('#cnpj-input');
  const buscarBtn = root.querySelector('#buscar-cnpj');
  const salvarBtn = root.querySelector('#salvar-empresa');
  const limparBtn = root.querySelector('#clear-company');
  const logoFile = root.querySelector('#logo-file');

  const refs = {
    resultBox: root.querySelector('#empresa-result'),
    nomeExibicao: root.querySelector('#nome-exibicao'),
    razaoSocial: root.querySelector('#razao-social'),
    nomeFantasia: root.querySelector('#nome-fantasia'),
    logoPreview: root.querySelector('#logo-preview'),
    previewSidebarLogo: root.querySelector('#preview-sidebar-logo'),
    previewSidebarName: root.querySelector('#preview-sidebar-name'),
    previewRazao: root.querySelector('#preview-razao'),
    previewExibicao: root.querySelector('#preview-exibicao')
  };

  let draft = {
    ...company,
    cnpj: company.cnpj,
    razaoSocial: company.razaoSocial,
    nomeFantasia: company.nomeFantasia,
    nomeExibicao: company.nomeExibicao,
    logo: company.logo,
    tema: company.tema
  };

  renderCompanyResult(refs.resultBox, draft);
  setActiveThemeButton(root, draft.tema);
  applyLivePreview(root, refs, draft);

  logoFile.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      draft = { ...draft, logo: reader.result };
      applyLivePreview(root, refs, draft);
    };
    reader.readAsDataURL(file);
  });

  cnpjInput.addEventListener('input', () => {
    cnpjInput.value = formatCnpj(cnpjInput.value);
  });

  buscarBtn.addEventListener('click', async () => {
    const raw = (cnpjInput.value || '').replace(/\D/g, '');
    if (!raw || raw.length !== 14) {
      await Swal.fire({
        icon: 'warning',
        title: 'CNPJ inválido',
        text: 'Informe um CNPJ com 14 dígitos.'
      });
      return;
    }

    buscarBtn.disabled = true;
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`);
      if (!response.ok) throw new Error('Não foi possível localizar o CNPJ informado.');

      const data = await response.json();
      draft = {
        ...draft,
        cnpj: raw,
        razaoSocial: data.razao_social || data.nome || '',
        nomeFantasia: data.nome_fantasia || data.razao_social || data.nome || '',
        nomeExibicao: draft.nomeExibicao || data.nome_fantasia || data.razao_social || data.nome || ''
      };

      cnpjInput.value = formatCnpj(raw);
      refs.razaoSocial.value = draft.razaoSocial;
      refs.nomeFantasia.value = draft.nomeFantasia;
      if (!refs.nomeExibicao.value.trim()) {
        refs.nomeExibicao.value = draft.nomeExibicao;
      }
      renderCompanyResult(refs.resultBox, draft, data);
      applyLivePreview(root, refs, draft);

      await Swal.fire({
        icon: 'success',
        title: 'Dados carregados',
        text: 'Agora você pode ajustar o nome de exibição, logo e tema antes de salvar.'
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Erro ao buscar CNPJ',
        text: error.message || 'Não foi possível consultar o CNPJ.'
      });
    } finally {
      buscarBtn.disabled = false;
    }
  });

  refs.nomeExibicao.addEventListener('input', () => {
    draft = { ...draft, nomeExibicao: refs.nomeExibicao.value.trim() };
    applyLivePreview(root, refs, draft);
  });

  refs.razaoSocial.addEventListener('input', () => {
    draft = { ...draft, razaoSocial: refs.razaoSocial.value.trim() };
    applyLivePreview(root, refs, draft);
  });

  refs.nomeFantasia.addEventListener('input', () => {
    draft = { ...draft, nomeFantasia: refs.nomeFantasia.value.trim() };
    applyLivePreview(root, refs, draft);
  });

  root.querySelectorAll('.theme-choice').forEach((button) => {
    button.addEventListener('click', () => {
      const tema = button.dataset.theme;
      draft = { ...draft, tema };
      setActiveThemeButton(root, tema);
      applyLivePreview(root, refs, draft);
    });
  });

  salvarBtn.addEventListener('click', async () => {
    const payload = buildPayloadFromDraft(draft, cnpjInput.value);

    if (!payload.cnpj) {
      await Swal.fire({
        icon: 'warning',
        title: 'CNPJ obrigatório',
        text: 'Busque ou informe um CNPJ válido antes de salvar.'
      });
      return;
    }

    if (!payload.nomeExibicao) {
      await Swal.fire({
        icon: 'warning',
        title: 'Nome de exibição obrigatório',
        text: 'Informe o nome que deve aparecer no topo da interface.'
      });
      return;
    }

    const companySaved = saveCompanyData(payload);
    draft = { ...companySaved };
    renderCompanyResult(refs.resultBox, companySaved);
    applyLivePreview(root, refs, companySaved);

    await Swal.fire({
      icon: 'success',
      title: 'Oficina salva',
      text: 'Os dados, a logo e o tema foram salvos com sucesso.'
    });
  });

  limparBtn.addEventListener('click', async () => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Limpar cadastro da oficina?',
      text: 'Isso remove o nome, a logo e o tema salvos.',
      showCancelButton: true,
      confirmButtonText: 'Sim, limpar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmation.isConfirmed) return;

    localStorage.removeItem('empresa');
    localStorage.removeItem('app:primary');
    draft = {
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      nomeExibicao: '',
      logo: null,
      tema: '#0D9488'
    };

    cnpjInput.value = '';
    refs.nomeExibicao.value = '';
    refs.razaoSocial.value = '';
    refs.nomeFantasia.value = '';
    refs.logoPreview.src = getCompanyLogo(draft);
    renderCompanyResult(refs.resultBox, draft);
    setActiveThemeButton(root, draft.tema);
    applyLivePreview(root, refs, draft);

    await Swal.fire({
      icon: 'success',
      title: 'Cadastro limpo',
      text: 'A configuração da oficina foi removida.'
    });
  });
}

function buildPayloadFromDraft(draft, cnpjInputValue) {
  const cnpj = String(draft.cnpj || cnpjInputValue || '').replace(/\D/g, '');
  return {
    cnpj,
    razaoSocial: draft.razaoSocial || '',
    nomeFantasia: draft.nomeFantasia || '',
    nomeExibicao: draft.nomeExibicao || draft.nomeFantasia || draft.razaoSocial || '',
    logo: draft.logo || null,
    tema: draft.tema || '#0D9488'
  };
}

function renderCompanyResult(resultBox, draft, fetchedData = null) {
  const address = fetchedData
    ? [fetchedData.tipo_logradouro, fetchedData.logradouro, fetchedData.numero, fetchedData.municipio, fetchedData.uf]
        .filter(Boolean)
        .join(', ')
    : '';

  resultBox.innerHTML = `
    <div><span class="font-semibold text-slate-900">Nome social:</span> ${escapeHtml(draft.razaoSocial || 'Não informado')}</div>
    <div><span class="font-semibold text-slate-900">Nome fantasia:</span> ${escapeHtml(draft.nomeFantasia || 'Não informado')}</div>
    <div><span class="font-semibold text-slate-900">Nome de exibição:</span> ${escapeHtml(draft.nomeExibicao || 'Não informado')}</div>
    <div><span class="font-semibold text-slate-900">CNPJ:</span> ${formatCnpj(draft.cnpj) || 'Não informado'}</div>
    ${address ? `<div><span class="font-semibold text-slate-900">Endereço:</span> ${escapeHtml(address)}</div>` : ''}
  `;
}

function applyLivePreview(root, refs, draft) {
  applyThemeColor(draft.tema);
  updateCompanyBranding(draft);

  if (refs.logoPreview) refs.logoPreview.src = draft.logo || getCompanyLogo(draft);
  if (refs.previewSidebarLogo) refs.previewSidebarLogo.src = draft.logo || getCompanyLogo(draft);
  if (refs.previewSidebarName) refs.previewSidebarName.textContent = draft.nomeExibicao || 'Mecânica Pro';
  if (refs.previewRazao) refs.previewRazao.textContent = draft.razaoSocial || 'Não informado';
  if (refs.previewExibicao) refs.previewExibicao.textContent = draft.nomeExibicao || 'Mecânica Pro';

  const companyName = document.querySelector('[data-sidebar-company-name]');
  if (companyName) companyName.textContent = draft.nomeExibicao || 'Mecânica Pro';
}

function setActiveThemeButton(root, tema) {
  root.querySelectorAll('.theme-choice').forEach((button) => {
    const selected = button.dataset.theme === tema;
    button.classList.toggle('border-primary', selected);
    button.classList.toggle('bg-primary/5', selected);
    button.classList.toggle('shadow-sm', selected);
  });
}

function formatCnpj(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 14);
  if (!digits) return '';
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default renderEmpresa;
