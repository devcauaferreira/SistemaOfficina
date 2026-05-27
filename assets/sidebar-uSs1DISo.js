import{g as d,c as r,b as c,a as n,u as m}from"./index-DILLSblt.js";function p(s){if(!s)return;const e=d();s.innerHTML=`
    <div class="h-full border-r border-slate-200 bg-white p-6">
      <div class="mb-8 flex items-center gap-3">
        <img src="${r(e)}" alt="Logo da oficina" data-sidebar-logo class="h-10 w-10 rounded-md object-cover shadow-sm" />
        <div>
          <div class="text-sm font-semibold text-primary">Oficina</div>
          <div class="font-bold text-lg text-slate-900" data-sidebar-company-name>${c(e)}</div>
          <div class="text-xs text-slate-500" data-sidebar-company-subtitle>${e.razaoSocial||"Cadastro da oficina"}</div>
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
    </div>
  `,window.lucide&&window.lucide.replace(),n(e.tema),m(e),window.__empresaSidebarListenerBound||(window.__empresaSidebarListenerBound=!0,window.addEventListener("empresa:atualizada",t=>{const a=(t==null?void 0:t.detail)||d(),l=document.querySelector("[data-sidebar-logo]"),i=document.querySelector("[data-sidebar-company-name]"),o=document.querySelector("[data-sidebar-company-subtitle]");l&&(l.src=r(a)),i&&(i.textContent=c(a)),o&&(o.textContent=a.razaoSocial||"Cadastro da oficina"),n(a.tema)}))}export{p as default,p as renderSidebar};
