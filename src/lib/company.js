import logoUrl from '../assets/logo.svg';

const COMPANY_STORAGE_KEY = 'empresa';
const LEGACY_THEME_KEY = 'app:primary';
const DEFAULT_PRIMARY = '#0D9488';
const DEFAULT_PRIMARY_HOVER = '#0F766E';
const DEFAULT_NAME = 'Mecânica Pro';

function normalizeHexColor(value) {
  const text = String(value || '').trim();
  if (!/^#([0-9a-fA-F]{6})$/.test(text)) return null;
  return text.toUpperCase();
}

function hexToRgbTriplet(hex) {
  const normalized = normalizeHexColor(hex) || DEFAULT_PRIMARY;
  const value = normalized.slice(1);
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function shadeHexColor(hex, percent) {
  const normalized = normalizeHexColor(hex) || DEFAULT_PRIMARY;
  const value = normalized.slice(1);
  const num = Number.parseInt(value, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase()}`;
}

function mixHexWithWhite(hex, amount = 0.12) {
  const normalized = normalizeHexColor(hex) || DEFAULT_PRIMARY;
  const value = normalized.slice(1);
  const num = Number.parseInt(value, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = Math.max(0, Math.min(1, amount));
  const blendedR = Math.round(r * mix + 255 * (1 - mix));
  const blendedG = Math.round(g * mix + 255 * (1 - mix));
  const blendedB = Math.round(b * mix + 255 * (1 - mix));
  return `#${((blendedR << 16) | (blendedG << 8) | blendedB).toString(16).padStart(6, '0').toUpperCase()}`;
}

function readRawCompany() {
  try {
    return JSON.parse(localStorage.getItem(COMPANY_STORAGE_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

export function getCompanyData() {
  const raw = readRawCompany() || {};
  const theme = normalizeHexColor(raw.tema) || normalizeHexColor(localStorage.getItem(LEGACY_THEME_KEY)) || DEFAULT_PRIMARY;
  const razaoSocial = String(raw.razao_social || raw.razaoSocial || '').trim();
  const nomeFantasia = String(raw.nome_fantasia || raw.nomeFantasia || '').trim();
  const nomeExibicao = String(raw.nome_exibicao || raw.nomeExibicao || nomeFantasia || razaoSocial || DEFAULT_NAME).trim();

  return {
    cnpj: String(raw.cnpj || '').replace(/\D/g, ''),
    razaoSocial,
    nomeFantasia,
    nomeExibicao,
    logo: raw.logo || null,
    tema: theme,
    savedAt: raw.savedAt || raw.saved_at || null
  };
}

export function getCompanyDisplayName(company = getCompanyData()) {
  return String(company.nomeExibicao || company.nomeFantasia || company.razaoSocial || DEFAULT_NAME).trim() || DEFAULT_NAME;
}

export function getCompanyLogo(company = getCompanyData()) {
  return company.logo || logoUrl;
}

export function applyThemeColor(color) {
  const primary = normalizeHexColor(color) || DEFAULT_PRIMARY;
  const hover = shadeHexColor(primary, -12);
  const surface = mixHexWithWhite(primary, 0.12);
  const surfaceStrong = mixHexWithWhite(primary, 0.18);

  document.documentElement.style.setProperty('--app-primary', primary);
  document.documentElement.style.setProperty('--app-primary-hover', hover);
  document.documentElement.style.setProperty('--app-primary-rgb', hexToRgbTriplet(primary));
  document.documentElement.style.setProperty('--app-primary-hover-rgb', hexToRgbTriplet(hover));
  document.documentElement.style.setProperty('--app-surface-rgb', hexToRgbTriplet(surface));
  document.documentElement.style.setProperty('--app-surface-strong-rgb', hexToRgbTriplet(surfaceStrong));
}

export function applyStoredCompanyTheme() {
  const company = getCompanyData();
  applyThemeColor(company.tema);
  return company;
}

export function saveCompanyData(data) {
  const current = getCompanyData();
  const company = {
    ...current,
    ...data,
    cnpj: String(data.cnpj ?? current.cnpj ?? '').replace(/\D/g, ''),
    razaoSocial: String(data.razaoSocial ?? data.razao_social ?? current.razaoSocial ?? '').trim(),
    nomeFantasia: String(data.nomeFantasia ?? data.nome_fantasia ?? current.nomeFantasia ?? '').trim(),
    nomeExibicao: String(data.nomeExibicao ?? data.nome_exibicao ?? current.nomeExibicao ?? '').trim() || getCompanyDisplayName({ ...current, ...data }),
    logo: data.logo !== undefined ? data.logo : current.logo,
    tema: normalizeHexColor(data.tema) || current.tema || DEFAULT_PRIMARY,
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(company));
  localStorage.setItem(LEGACY_THEME_KEY, company.tema);
  applyThemeColor(company.tema);
  updateCompanyBranding(company);
  window.dispatchEvent(new CustomEvent('empresa:atualizada', { detail: company }));
  return company;
}

export function updateCompanyBranding(company = getCompanyData()) {
  const logo = getCompanyLogo(company);
  const name = getCompanyDisplayName(company);

  const logoEl = document.querySelector('[data-sidebar-logo]');
  if (logoEl) {
    logoEl.src = logo;
  }

  const nameEl = document.querySelector('[data-sidebar-company-name]');
  if (nameEl) {
    nameEl.textContent = name;
  }

  const subtitleEl = document.querySelector('[data-sidebar-company-subtitle]');
  if (subtitleEl) {
    subtitleEl.textContent = company.razaoSocial || 'Cadastro da oficina';
  }

  const title = name ? `${name} | Sistema da Oficina` : 'Sistema de Mecânica';
  document.title = title;
}

export function resetCompanyData() {
  localStorage.removeItem(COMPANY_STORAGE_KEY);
  localStorage.removeItem(LEGACY_THEME_KEY);
  applyThemeColor(DEFAULT_PRIMARY);
  updateCompanyBranding(getCompanyData());
  window.dispatchEvent(new CustomEvent('empresa:atualizada', { detail: getCompanyData() }));
}

export function normalizeCompanyNameInput(value) {
  return String(value || '').trim();
}
