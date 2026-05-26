import{l as n}from"./index-H0E6emLw.js";function m(o){if(!o)return;o.innerHTML=`
    <div class="h-full border-r border-slate-200 bg-white p-6">
      <div class="mb-8 flex items-center gap-3">
        <img src="${n}" alt="Logo" class="h-10 w-10 rounded-md shadow-sm" />
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
  `,window.lucide&&window.lucide.replace();const c=e=>{document.documentElement.style.setProperty("--app-primary",e);try{const t=i(e,-12);document.documentElement.style.setProperty("--app-primary-hover",t)}catch{}},d=localStorage.getItem("app:primary");d&&c(d),document.querySelectorAll(".theme-swatch").forEach(e=>{e.addEventListener("click",t=>{const a=e.getAttribute("data-color");c(a),localStorage.setItem("app:primary",a)})});function i(e,t){e=e.replace("#","");const a=parseInt(e,16);let s=(a>>16)+t,l=(a>>8&255)+t,r=(a&255)+t;return s=Math.max(Math.min(255,s),0),l=Math.max(Math.min(255,l),0),r=Math.max(Math.min(255,r),0),"#"+(s<<16|l<<8|r).toString(16).padStart(6,"0")}}export{m as default,m as renderSidebar};
