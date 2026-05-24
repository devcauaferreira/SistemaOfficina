# AGENTS.md

Este arquivo define as instruções essenciais para agentes de IA que forem trabalhar neste projeto.

O projeto é um sistema de gerenciamento para oficina mecânica.  
O agente deve manter o sistema simples, funcional e alinhado aos requisitos abaixo.

## Tecnologias do projeto

- HTML
- Tailwind CSS
- JavaScript Vanilla
- Vite
- SweetAlert2
- Supabase

Não utilizar React, Vue, Angular ou frameworks semelhantes.

## Regras gerais

- Todo texto visível ao usuário deve estar em português do Brasil.
- Usar acentuação correta na interface.
- Usar SweetAlert2 para mensagens de sucesso, erro, alerta e confirmação.
- Não usar `alert()`, `confirm()` ou `prompt()` nativos.
- Validar os dados no front-end antes de salvar.
- Usar `async/await` e `try/catch`.
- Não usar dados fixos quando houver dados reais no Supabase.
- Não hardcodear URL ou chave do Supabase.
- Usar variáveis de ambiente via `import.meta.env`.

## Tela inicial

A tela inicial deve conter botões principais para:

- Registrar nova nota
- Ver notas
- Cadastrar cliente
- Ver histórico de clientes
- Ver clientes com pendências

Ao concluir uma nota, o sistema deve voltar para a tela inicial.

## Notas

O sistema deve permitir registrar uma nova nota de serviço.

Cada nota deve conter obrigatoriamente:

- Nome do cliente
- Carro do cliente
- Serviços realizados
- Peças utilizadas
- Quantidade de cada peça
- Preço de cada peça
- Informação se teve guincho ou não
- Descrição ou informações adicionais
- Forma de pagamento
- Desconto por porcentagem ou por valor

Formas de pagamento permitidas:

- Dinheiro
- Débito
- Crédito
- Pix
- Cheque

## Situações das notas

As notas devem ser organizadas em três grupos:

### Serviços em aberto

Notas de serviços que estão sendo feitos.

Devem conter:

- Data de início
- Hora de início

### Serviços concluídos

Notas de serviços finalizados e pagos pelo cliente.

Devem conter:

- Data de conclusão
- Hora de conclusão

### Orçamentos

Notas em que o cliente ficou de analisar ou não quis fazer o serviço.

Devem conter:

- Data do orçamento
- Hora do orçamento

## Busca de notas

A tela de notas deve ter barra de pesquisa.

A busca deve permitir localizar notas por:

- Data
- Nome do cliente
- Carro

## Ações nas notas

Cada nota deve ter:

- Botão para imprimir
- Botão para voltar
- Botão para limpar tudo
- Botão para concluir

O botão de limpar deve apagar os dados preenchidos da nota atual para começar novamente.

Todas as telas devem ter botão de voltar.

## Peças e estoque

Ao adicionar peças utilizadas em uma nota:

- O usuário deve selecionar a peça
- Informar a quantidade utilizada
- Informar ou confirmar o preço da peça

Se a peça existir no estoque, a quantidade utilizada deve ser descontada automaticamente.

O sistema não deve permitir usar quantidade maior do que a disponível em estoque.

## Cadastro de cliente

O sistema deve permitir cadastrar clientes.

Campos obrigatórios:

- Nome
- Telefone
- Veículo
- Cor do veículo
- Placa do veículo
- Marca do veículo

Campos opcionais:

- CPF
- Descrição
- Local onde mora

## Histórico de clientes

O sistema deve ter histórico de clientes.

Dentro do cadastro ou pasta do cliente, deve ser possível ver:

- Dados do cliente
- Veículos do cliente
- Serviços já realizados
- Notas anteriores
- Pendências

Também deve existir botão para cadastrar novo serviço para o mesmo cliente.

## Clientes com pendências

O sistema deve ter uma área de clientes com pendências.

Essa área deve mostrar:

- Nome do cliente
- Carro
- Valor que está devendo
- Serviços relacionados à dívida

## Supabase

O sistema deve usar Supabase para:

- Autenticação
- Cadastro de clientes
- Cadastro de veículos
- Notas
- Serviços
- Peças
- Estoque
- Pendências

As tabelas protegidas devem usar RLS.

Sempre que criar ou alterar tabelas protegidas, configurar também os `GRANTs` necessários para usuários autenticados.

## Autenticação

O sistema deve usar autenticação nativa do Supabase.

Funções mínimas:

- `login(email, senha)`
- `logout()`
- `getUsuarioAtual()`
- `verificarAutenticacao()`

Usuários não autenticados devem ser redirecionados para a tela de login.

## O que evitar

- Não criar telas vazias ou placeholders.
- Não criar funcionalidades fora dos requisitos.
- Não usar dados falsos no lugar de dados reais.
- Não alterar regras de negócio sem necessidade.
- Não adicionar complexidade desnecessária.