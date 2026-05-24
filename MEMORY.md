# MEMORY.md

Este arquivo registra o contexto principal do projeto.  
Ele serve como memória de referência para agentes de IA entenderem o que o sistema é e quais funcionalidades devem ser mantidas.

## Contexto do projeto

Sistema de gerenciamento para oficina mecânica.

O sistema deve permitir controlar:

- clientes;
- veículos;
- notas de serviço;
- serviços em aberto;
- serviços concluídos;
- orçamentos;
- peças utilizadas;
- estoque;
- histórico de clientes;
- pendências de pagamento.

## Tecnologias

O projeto utiliza:

- HTML;
- Tailwind CSS;
- JavaScript Vanilla;
- Vite;
- SweetAlert2;
- Supabase.

Não devem ser usados frameworks como React, Vue ou Angular.

## Objetivo do sistema

O objetivo do sistema é ajudar a oficina a registrar e acompanhar serviços feitos para clientes.

O sistema deve permitir:

- cadastrar clientes;
- cadastrar veículos dos clientes;
- registrar novas notas;
- acompanhar serviços em aberto;
- finalizar serviços concluídos;
- registrar orçamentos;
- consultar histórico de clientes;
- controlar peças usadas nos serviços;
- descontar peças do estoque;
- registrar forma de pagamento;
- aplicar desconto por valor ou porcentagem;
- identificar clientes com pendências.

## Tela inicial

A tela inicial deve ter botões para:

- registrar nova nota;
- acessar notas;
- cadastrar cliente;
- acessar histórico de clientes;
- acessar clientes com pendências.

Ao concluir uma nota, o sistema deve voltar para a tela inicial.

## Notas de serviço

Cada nota deve conter:

- nome do cliente;
- carro do cliente;
- serviços realizados;
- peças utilizadas;
- quantidade de peças;
- preço de cada peça;
- informação se teve guincho ou não;
- descrição ou informações adicionais;
- forma de pagamento;
- desconto por porcentagem ou por valor.

As formas de pagamento são:

- dinheiro;
- débito;
- crédito;
- pix;
- cheque.

## Tipos de nota

As notas devem ser organizadas em:

### Serviços em aberto

Serviços que estão sendo feitos.

Devem registrar:

- data de início;
- hora de início.

### Serviços concluídos

Serviços finalizados e pagos pelo cliente.

Devem registrar:

- data de conclusão;
- hora de conclusão.

### Orçamentos

Casos em que o cliente ficou de analisar ou não quis fazer o serviço.

Devem registrar:

- data do orçamento;
- hora do orçamento.

## Busca de notas

O sistema deve permitir buscar notas por:

- data;
- nome do cliente;
- carro.

## Ações nas telas

As telas devem ter:

- botão de voltar;
- botão de limpar;
- botão de concluir, quando aplicável;
- botão de imprimir nas notas.

O botão de limpar deve apagar os dados preenchidos da nota atual.

## Cadastro de clientes

O cadastro de cliente deve conter obrigatoriamente:

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

Cada cliente deve ter uma área de histórico contendo:

- dados do cliente;
- veículos;
- serviços realizados;
- notas anteriores;
- pendências.

Dentro do histórico do cliente, deve haver botão para cadastrar novo serviço para esse mesmo cliente.

## Pendências

O sistema deve ter uma área de clientes com pendências.

Essa área deve mostrar:

- nome do cliente;
- carro;
- valor devido;
- serviços relacionados à dívida.

## Estoque

O sistema deve controlar peças e produtos.

Ao usar uma peça em uma nota:

- selecionar a peça;
- informar a quantidade usada;
- informar ou confirmar o preço;
- descontar automaticamente do estoque, se a peça existir nele.

Não deve ser permitido usar quantidade maior do que a disponível em estoque.

## Supabase

O Supabase deve ser usado para:

- autenticação;
- clientes;
- veículos;
- notas;
- serviços;
- peças;
- estoque;
- pendências.

Usuários não autenticados devem ser redirecionados para a tela de login.