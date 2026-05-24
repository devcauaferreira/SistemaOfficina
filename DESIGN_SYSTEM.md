# DESIGN_SYSTEM.md

Este arquivo define o padrão visual do sistema de gerenciamento para oficina mecânica.

Ele deve ser usado para manter consistência entre telas, botões, formulários, cards, cores, ícones e mensagens.

## Princípios da interface

- A interface deve ser simples, clara e fácil de usar.
- O sistema deve parecer uma ferramenta de trabalho para oficina, não um site decorativo.
- As ações principais devem ser fáceis de encontrar.
- Textos visíveis devem estar em português do Brasil com acentuação correta.
- Informações importantes, como status da nota, valor, cliente e carro, devem ter destaque visual.
- Todas as telas devem ter botão de voltar.
- Mensagens de sucesso, erro, alerta e confirmação devem usar SweetAlert2.
- Botões, menus e ações principais devem usar Heroicons.

## Tecnologias visuais

- HTML
- Tailwind CSS
- JavaScript Vanilla
- Heroicons
- SweetAlert2

Não usar bibliotecas visuais complexas ou frameworks como React, Vue ou Angular.

## Paleta de cores

### Cores principais

- Azul principal: `#2563EB`
- Azul hover: `#1D4ED8`
- Cinza secundário: `#64748B`
- Verde sucesso: `#16A34A`
- Amarelo alerta: `#F59E0B`
- Vermelho perigo: `#DC2626`

### Tema claro

- Fundo: `#F8FAFC`
- Card: `#FFFFFF`
- Texto principal: `#0F172A`
- Texto secundário: `#475569`
- Borda: `#E2E8F0`

### Tema escuro

- Fundo: `#0F172A`
- Card: `#1E293B`
- Texto principal: `#F8FAFC`
- Texto secundário: `#CBD5E1`
- Borda: `#334155`

## Tipografia

- Fonte principal: Inter.
- Títulos: `font-bold`.
- Texto padrão: `text-sm` ou `text-base`.
- Labels: `text-sm font-medium`.
- Valores monetários podem usar `font-semibold`.
- Evitar textos longos dentro de botões, cards pequenos ou colunas estreitas.

## Uso das cores por status

### Serviço em aberto

Usar amarelo ou laranja.

Exemplo:

```html
<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
  Em aberto
</span>