import { getCompanyData, getCompanyDisplayName, getCompanyLogo } from './company.js';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function splitServices(text) {
  return String(text || '')
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildOrcamentoPrintHtml(note, options = {}) {
  const company = options.company || getCompanyData();
  const logo = options.logo || getCompanyLogo(company);
  const companyName = options.companyName || getCompanyDisplayName(company);
  const pieces = Array.isArray(note?.pecas) ? note.pecas : [];
  const services = splitServices(note?.servicos);
  const serviceValue = Number(note?.valor_servicos || 0);
  const guinchoValue = Number(note?.valor_guincho || 0);
  const subtotalPieces = pieces.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
  const total = Number(note?.valor_total || subtotalPieces + serviceValue + guinchoValue);
  const discount = Number(note?.desconto || 0);
  const finalValue = Number(note?.valor_final || Math.max(total - discount, 0));
  const printDate = note?.data_orcamento || note?.created_at || new Date().toISOString();
  const mechanic = String(note?.mecanico || '').trim();
  const observations = String(note?.observacoes || '').trim();
  const firstService = services[0] || note?.servicos || 'Serviço a executar';
  const extraServices = services.slice(1);

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Orçamento - ${escapeHtml(note?.cliente || 'Cliente')}</title>
        <style>
          :root {
            --ink: #0f172a;
            --muted: #64748b;
            --line: #cbd5e1;
            --blue: #1d4ed8;
            --blue-weak: #dbeafe;
            --navy: #0f172a;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: var(--ink);
            font-family: Arial, Helvetica, sans-serif;
            background: #f4f7fb;
          }
          .sheet {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 16mm 14mm;
          }
          .topbar {
            display: grid;
            grid-template-columns: 1.1fr 1fr;
            gap: 16px;
            align-items: stretch;
            margin-bottom: 16px;
          }
          .brand {
            background: linear-gradient(135deg, var(--navy), #111827 65%, #1d4ed8);
            color: white;
            border-radius: 18px;
            padding: 18px;
            display: flex;
            gap: 14px;
            align-items: center;
            min-height: 132px;
          }
          .brand img {
            width: 62px;
            height: 62px;
            border-radius: 14px;
            object-fit: cover;
            background: white;
          }
          .brand .eyebrow {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: #93c5fd;
            margin-bottom: 6px;
          }
          .brand .name {
            font-size: 26px;
            line-height: 1.05;
            font-weight: 700;
            margin: 0;
          }
          .brand .sub {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.4;
            color: #dbeafe;
          }
          .proposal {
            border: 1px solid var(--line);
            border-radius: 18px;
            padding: 18px 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: linear-gradient(180deg, #ffffff, #f8fafc);
          }
          .proposal .title {
            font-size: 28px;
            line-height: 1.05;
            margin: 0;
            color: var(--ink);
          }
          .proposal .subtitle {
            margin-top: 8px;
            color: var(--muted);
            font-size: 13px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin: 14px 0 16px;
          }
          .info-box {
            border: 1px solid var(--line);
            border-radius: 14px;
            padding: 12px 14px;
            background: #f8fafc;
          }
          .info-label {
            display: block;
            font-size: 11px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 6px;
          }
          .info-value {
            font-size: 14px;
            font-weight: 700;
            color: var(--ink);
          }
          .section {
            margin-top: 14px;
            border: 1px solid var(--line);
            border-radius: 18px;
            overflow: hidden;
          }
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding: 14px 18px;
            background: linear-gradient(180deg, #eff6ff, #ffffff);
            border-bottom: 1px solid var(--line);
          }
          .section-header h2 {
            margin: 0;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: var(--blue);
          }
          .section-header .tag {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            color: #1e3a8a;
            background: var(--blue-weak);
          }
          .section-body {
            padding: 16px 18px;
          }
          .service-main {
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 10px;
          }
          .service-list {
            margin: 0;
            padding-left: 18px;
            color: var(--ink);
          }
          .service-list li {
            margin: 4px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid var(--line);
            padding: 10px 12px;
            text-align: left;
            vertical-align: top;
            font-size: 13px;
          }
          th {
            background: #f8fafc;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--muted);
          }
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 12px;
          }
          .summary-card {
            border: 1px solid var(--line);
            border-radius: 14px;
            padding: 12px 14px;
            background: #fff;
          }
          .summary-card .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: var(--muted);
          }
          .summary-card .value {
            margin-top: 6px;
            font-size: 18px;
            font-weight: 700;
          }
          .highlight {
            border-color: rgba(29, 78, 216, 0.3);
            background: #eff6ff;
          }
          .footer {
            margin-top: 16px;
            border-top: 1px solid var(--line);
            padding-top: 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 11px;
            color: var(--muted);
          }
          .footer strong {
            color: var(--ink);
          }
          @page {
            size: A4;
            margin: 10mm;
          }
          @media print {
            body {
              background: white;
            }
            .sheet {
              width: auto;
              min-height: auto;
              margin: 0;
              padding: 0;
            }
          }
        </style>
        <script>
          window.addEventListener('load', function () {
            setTimeout(function () {
              window.focus();
              window.print();
            }, 350);
          });
          window.addEventListener('afterprint', function () {
            window.close();
          });
        </script>
      </head>
      <body>
        <div class="sheet">
          <div class="topbar">
            <div class="brand">
              <img src="${logo}" alt="Logo da oficina" />
              <div>
                <div class="eyebrow">Oficina Mecânica</div>
                <h1 class="name">${escapeHtml(companyName)}</h1>
                <div class="sub">
                  <div>${escapeHtml(company.razaoSocial || 'Razão social não informada')}</div>
                  <div>${company.cnpj ? `CNPJ: ${escapeHtml(company.cnpj)}` : ''}</div>
                </div>
              </div>
            </div>
            <div class="proposal">
              <h2 class="title">Proposta de Orçamento</h2>
              <div class="subtitle">Documento gerado para conferência, impressão ou salvamento em PDF.</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <span class="info-label">Nome</span>
              <div class="info-value">${escapeHtml(note?.cliente || '-')}</div>
            </div>
            <div class="info-box">
              <span class="info-label">Telefone</span>
              <div class="info-value">${escapeHtml(note?.telefone || note?.cliente_telefone || '-')}</div>
            </div>
            <div class="info-box">
              <span class="info-label">Marca</span>
              <div class="info-value">${escapeHtml(note?.marca || '-')}</div>
            </div>
            <div class="info-box">
              <span class="info-label">Modelo</span>
              <div class="info-value">${escapeHtml(note?.carro || '-')}</div>
            </div>
            <div class="info-box">
              <span class="info-label">Mecânico</span>
              <div class="info-value">${escapeHtml(mechanic || '-')}</div>
            </div>
            <div class="info-box">
              <span class="info-label">Entrada em</span>
              <div class="info-value">${formatDate(printDate)}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <h2>Serviço a executar</h2>
              <span class="tag">${escapeHtml(note?.tipo || 'Orçamento')}</span>
            </div>
            <div class="section-body">
              <div class="service-main">${escapeHtml(firstService)}</div>
              ${extraServices.length ? `<ul class="service-list">${extraServices.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <h2>Peças utilizadas</h2>
              <span class="tag">${pieces.length} item(ns)</span>
            </div>
            <div class="section-body">
              <table>
                <thead>
                  <tr>
                    <th>Peça</th>
                    <th>Quantidade</th>
                    <th>Preço</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${pieces.length
                    ? pieces
                        .map(
                          (item) => `
                            <tr>
                              <td>${escapeHtml(item.name)}</td>
                              <td>${escapeHtml(item.quantity)}</td>
                              <td>${formatCurrency(item.price)}</td>
                              <td>${formatCurrency(Number(item.quantity || 0) * Number(item.price || 0))}</td>
                            </tr>
                          `
                        )
                        .join('')
                    : `<tr><td colspan="4">Nenhuma peça informada.</td></tr>`}
                </tbody>
              </table>

              <div class="summary-grid">
                <div class="summary-card">
                  <div class="label">Serviços / Mão de obra</div>
                  <div class="value">${formatCurrency(serviceValue)}</div>
                </div>
                <div class="summary-card">
                  <div class="label">Material usado</div>
                  <div class="value">${formatCurrency(subtotalPieces)}</div>
                </div>
                <div class="summary-card">
                  <div class="label">Guincho</div>
                  <div class="value">${formatCurrency(guinchoValue)}</div>
                </div>
                <div class="summary-card">
                  <div class="label">Desconto</div>
                  <div class="value">${note?.desconto_text ? escapeHtml(note.desconto_text) : formatCurrency(discount)}</div>
                </div>
                <div class="summary-card highlight" style="grid-column: 1 / -1;">
                  <div class="label">TOTAL</div>
                  <div class="value" style="font-size: 24px;">${formatCurrency(finalValue)}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section" style="margin-top: 14px;">
            <div class="section-header">
              <h2>Observações</h2>
              <span class="tag">Resumo final</span>
            </div>
            <div class="section-body" style="min-height: 64px;">
              ${observations ? escapeHtml(observations).replaceAll('\n', '<br />') : '<span style="color:#64748b">Sem observações adicionais.</span>'}
            </div>
          </div>

          <div class="footer">
            <div><strong>Gerado em:</strong> ${formatDateTime(new Date().toISOString())}</div>
            <div style="text-align:right;"><strong>Entrada registrada em:</strong> ${formatDateTime(printDate)}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
