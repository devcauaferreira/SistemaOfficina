export function renderSidebar(root) {
  if (!root) return;

  root.innerHTML = `
    <div class="h-full border-r border-slate-200 bg-white p-6">
      <div class="mb-8 flex items-center gap-3">
        <img src="/src/assets/logo.svg" alt="Logo" class="h-10 w-10 rounded-md shadow-sm" />
        <div>
          <div class="text-sm font-semibold text-primary">Oficina</div>
          <div class="font-bold text-lg text-slate-900">Mecânica Pro</div>
        </div>
      </div>

      <nav class="space-y-1 text-sm">
        <a href="#home" class="flex items-center gap-3 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
          <i data-lucide="home" class="w-5 h-5"></i>
          Início
        </a>
        <a href="#nota" class="flex items-center gap-3 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
          <i data-lucide="file-plus" class="w-5 h-5"></i>
          Novo orçamento
        </a>
        <a href="#notas" class="flex items-center gap-3 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
          <i data-lucide="file-text" class="w-5 h-5"></i>
          Notas
        </a>
        <a href="#clientes" class="flex items-center gap-3 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
          <i data-lucide="users" class="w-5 h-5"></i>
          Clientes
        </a>
        <a href="#estoque" class="flex items-center gap-3 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
          <i data-lucide="box" class="w-5 h-5"></i>
          Estoque
        </a>
        <a href="#historico" class="flex items-center gap-3 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
          <i data-lucide="clock" class="w-5 h-5"></i>
          Histórico
        </a>
        <a href="#empresa" class="flex items-center gap-3 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
          <i data-lucide="building" class="w-5 h-5"></i>
          Empresa
        </a>
        <a href="#pendencias" class="flex items-center gap-3 rounded-xl p-3 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
          <i data-lucide="alert-circle" class="w-5 h-5"></i>
          Pendências
        </a>
      </nav>
      <div class="mt-6">
        <p class="text-sm font-semibold uppercase text-slate-500">Tema</p>
        <div class="mt-3 flex items-center gap-2">
          <button class="theme-swatch rounded-md h-8 w-8" data-color="#0D9488" style="background:#0D9488"></button>
          <button class="theme-swatch rounded-md h-8 w-8" data-color="#0284C7" style="background:#0284C7"></button>
          <button class="theme-swatch rounded-md h-8 w-8" data-color="#FB923C" style="background:#FB923C"></button>
          <button class="theme-swatch rounded-md h-8 w-8" data-color="#7C3AED" style="background:#7C3AED"></button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.replace();

  // apply stored theme or default
  const applyTheme = (color) => {
    const colorMap = {
      primary: color,
      hover: color
    };
    document.documentElement.style.setProperty('--app-primary', color);
    // slightly darker for hover
    try {
      const darker = shadeColor(color, -12);
      document.documentElement.style.setProperty('--app-primary-hover', darker);
    } catch (e) {}
  };

  const stored = localStorage.getItem('app:primary');
  if (stored) applyTheme(stored);

  // attach listeners
  document.querySelectorAll('.theme-swatch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const color = btn.getAttribute('data-color');
      applyTheme(color);
      localStorage.setItem('app:primary', color);
    });
  });

  // helper to shade hex color
  function shadeColor(hex, percent) {
    hex = hex.replace('#','');
    const num = parseInt(hex,16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.max(Math.min(255,r),0);
    g = Math.max(Math.min(255,g),0);
    b = Math.max(Math.min(255,b),0);
    return '#' + (r<<16 | g<<8 | b).toString(16).padStart(6,'0');
  }
}

export default renderSidebar;
