# Sistema de Gerenciamento para Oficina Mecânica

Sistema para gerenciamento de oficina mecânica, desenvolvido com HTML, Tailwind CSS, JavaScript Vanilla, Vite, SweetAlert2 e Supabase.

O objetivo do projeto é permitir o controle de clientes, veículos, notas de serviço, serviços em aberto, serviços concluídos, orçamentos, peças utilizadas, estoque, histórico de clientes e pendências de pagamento.

## Documentos importantes do projeto

Antes de alterar qualquer parte do sistema, leia estes arquivos:

- [AGENTS.md](AGENTS.md): define as regras essenciais para agentes de IA e desenvolvimento do projeto.
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md): define o padrão visual da aplicação, incluindo cores, botões, cards, formulários, tabelas, ícones e mensagens.
- [MEMORY.md](MEMORY.md): registra o contexto funcional do sistema e as principais decisões do projeto.

Esses arquivos ajudam a manter o sistema organizado, consistente e alinhado com os requisitos da oficina.

## Tecnologias utilizadas

- HTML
- Tailwind CSS
- JavaScript Vanilla
- Vite
- SweetAlert2
- Supabase
- Heroicons

Não devem ser usados frameworks como React, Vue ou Angular.

## Objetivo do sistema

O sistema deve ajudar a oficina a registrar, acompanhar e organizar os serviços feitos para seus clientes.

Principais objetivos:

- cadastrar clientes;
- cadastrar veículos;
- registrar novas notas;
- acompanhar serviços em aberto;
- registrar serviços concluídos;
- registrar orçamentos;
- controlar peças usadas nos serviços;
- descontar peças do estoque;
- registrar formas de pagamento;
- aplicar descontos;
- consultar histórico de clientes;
- controlar clientes com pendências.

## Funcionalidades principais

### Tela inicial

A tela inicial deve conter os principais atalhos do sistema:

- Registrar nova nota
- Notas
- Cadastrar cliente
- Histórico de clientes
- Clientes com pendências
- Estoque

Ao concluir uma nota, o sistema deve voltar para a tela inicial.

### Notas de serviço

O sistema deve permitir criar notas de serviço com:

- nome do cliente;
- carro do cliente;
- serviços realizados;
- peças utilizadas;
- quantidade de cada peça;
- preço de cada peça;
- informação se teve guincho ou não;
- descrição ou informações adicionais;
- forma de pagamento;
- desconto por valor ou porcentagem.

Formas de pagamento permitidas:

- dinheiro;
- débito;
- crédito;
- pix;
- cheque.

### Situação das notas

As notas devem ser organizadas em três grupos:

#### Serviços em aberto

Serviços que estão sendo feitos.

Devem registrar:

- data de início;
- hora de início.

#### Serviços concluídos

Serviços finalizados e pagos pelo cliente.

Devem registrar:

- data de conclusão;
- hora de conclusão.

#### Orçamentos

Casos em que o cliente ficou de analisar ou não quis fazer o serviço.

Devem registrar:

- data do orçamento;
- hora do orçamento.

### Busca de notas

A tela de notas deve possuir barra de pesquisa.

A busca deve permitir localizar notas por:

- data;
- nome do cliente;
- carro.

### Ações das notas

Cada nota deve ter:

- botão para imprimir;
- botão para voltar;
- botão para limpar tudo;
- botão para concluir.

O botão de limpar deve apagar os dados preenchidos da nota atual para começar novamente.

Todas as telas devem ter botão de voltar.

## Cadastro de clientes

O sistema deve permitir cadastrar clientes.

Campos obrigatórios:

- nome;
- telefone;
- veículo;
- cor do veículo;
- placa do veículo;
- marca do veículo.

Campos opcionais:

- CPF;
- descrição;
- local onde mora.

## Histórico de clientes

O sistema deve possuir histórico de clientes.

Dentro do histórico de cada cliente, deve ser possível visualizar:

- dados do cliente;
- veículos;
- serviços realizados;
- notas anteriores;
- pendências.

Também deve existir um botão para cadastrar novo serviço para o mesmo cliente.

## Clientes com pendências

O sistema deve ter uma área para clientes com pendências.

Essa área deve mostrar:

- nome do cliente;
- carro;
- valor devido;
- serviço relacionado à dívida.

## Estoque

O sistema deve controlar peças e produtos utilizados nos serviços.

Ao adicionar uma peça em uma nota:

- o usuário deve selecionar a peça;
- informar a quantidade usada;
- informar ou confirmar o preço;
- o sistema deve descontar automaticamente a quantidade do estoque, se a peça existir nele.

O sistema não deve permitir usar quantidade maior do que a disponível em estoque.

## Autenticação

O sistema deve usar autenticação nativa do Supabase.

Funções mínimas:

- `login(email, senha)`
- `logout()`
- `getUsuarioAtual()`
- `verificarAutenticacao()`

Usuários não autenticados devem ser redirecionados para a tela de login.

## Regras técnicas principais

- Usar HTML, Tailwind CSS e JavaScript Vanilla.
- Usar Vite como ferramenta de build e servidor de desenvolvimento.
- Usar Supabase para autenticação e banco de dados.
- Acessar variáveis de ambiente com `import.meta.env`.
- Não hardcodear URL ou chave do Supabase.
- Usar SweetAlert2 para mensagens de sucesso, erro, confirmação e alerta.
- Não usar `alert()`, `confirm()` ou `prompt()` nativos.
- Usar Heroicons nos menus, botões de ação e controles principais.
- Manter textos visíveis em português do Brasil com acentuação correta.
- Validar dados no front-end antes de salvar.
- Usar `async/await`.
- Usar `try/catch` para tratamento de erros.
- Configurar RLS e GRANTs necessários no Supabase.

## Configuração do ambiente

Antes de rodar o projeto, crie um arquivo `.env` na raiz com as variáveis do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sb_publishable_XXXXXX