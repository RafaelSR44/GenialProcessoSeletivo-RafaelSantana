# Motor de Validação de Suitability de Carteira

Sistema de validação de conformidade de operações de investimento desenvolvido para o **Processo Seletivo da Genial Investimentos**.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Sobre o Projeto

O **Motor de Validação de Suitability** garante que todas as operações de compra de ativos pelos clientes estejam em conformidade com a **Resolução CVM nº 30**, que exige adequação dos produtos ao perfil de risco do investidor.

### Funcionalidades Principais

- **Cálculo de Risco da Carteira** - Média ponderada baseada em todos os ativos  
- **Projeção de Risco Pós-Compra** - Simulação antes da execução  
- **Validação de Desenquadramento** - Três níveis: Aprovado, Alerta e Rejeitado  
- **Termo de Ciência** - Registro formal quando cliente opta por prosseguir com alerta  
- **Relatórios Detalhados** - Documentação completa para auditoria e compliance  
- **Interface Intuitiva** - Experiência de usuário fluida e responsiva  

---

## Começando

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/RafaelSR44/GenialProcessoSeletivo-RafaelSantana.git
cd GenialProcessoSeletivo-RafaelSantana
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

---

## Estrutura do Projeto

```
/app
  /api
    /suitability
      /validar            - API de validação de suitability
      /termo-ciencia      - API de registro de termo de ciência
      /relatorio          - API de geração de relatórios
  page.tsx                - Interface principal do usuário
  page.module.css         - Estilos da aplicação
  layout.tsx              - Layout base
  globals.css             - Estilos globais
  
/lib
  suitability.ts          - Lógica central do motor de validação
  suitability.test.ts     - Testes automatizados (10 testes)
  types.ts                - Definições de tipos TypeScript
  utils.ts                - Funções utilitárias

case-report.md            - Relatório completo do case (LEIA!)
```

---

## Como Usar

### 1. Preencher Perfil do Cliente
- Nome e e-mail
- Perfil de investidor (Conservador, Moderado ou Arrojado)
- Score máximo de risco tolerado (0-5)

### 2. Adicionar Ativos à Carteira Atual
- Nome do ativo
- Risco do ativo (0-5)
- Valor investido em R$

### 3. Definir Nova Ordem de Compra
- Ativo que deseja comprar
- Risco do novo ativo
- Valor da ordem

### 4. Validar Suitability
O sistema irá:
- Calcular o risco atual da carteira
- Projetar o risco após a compra
- Validar se a operação está em conformidade
- Retornar status: **Aprovado**, **Alerta** ou **Rejeitado**

### 5. Baixar Relatório
Relatório completo em formato texto para download e auditoria.

---

## Fórmula Matemática

O sistema utiliza **média ponderada** para calcular o risco da carteira:

```
RC = Σ(Risco_i × ValorInvestido_i) / Σ(ValorInvestido_i)
```

Onde:
- **RC** = Risco da Carteira
- **Risco_i** = Score de risco do ativo i
- **ValorInvestido_i** = Valor investido no ativo i

---

## Níveis de Validação

| Status | Condição | Ação |
|--------|----------|------|
| **Aprovado** | Risco Projetado ≤ Score Máximo | Operação executada normalmente |
| **Alerta** | Score Máximo < Risco ≤ Limite (110%) | Requer Termo de Ciência |
| **Rejeitado** | Risco Projetado > Limite (110%) | Operação bloqueada |

---

## Testes

Execute os testes automatizados:
```bash
npm test
```

**Cobertura:** 10 testes unitários com 100% de aprovação

---

## Tecnologias Utilizadas

- **Next.js 15** - Framework React para produção
- **TypeScript 5.5** - Superset JavaScript com tipagem estática
- **React 18** - Biblioteca para interfaces de usuário
- **CSS Modules** - Estilos com escopo local

---

## API Routes

### POST `/api/suitability/validar`
Valida uma nova ordem de compra contra o perfil do cliente.

### POST `/api/suitability/termo-ciencia`
Registra o aceite do cliente para prosseguir com operação em alerta.

### POST `/api/suitability/relatorio`
Gera relatório completo em formato texto para download.

---

## Documentação Adicional

- **[case-report.md](case-report.md)** - Relatório técnico completo com análises de negócio, compliance e estratégias de comunicação

---

## Compliance e Segurança

- Validações no frontend e backend
- Registro de auditoria com timestamp e metadados
- Protocolo único para cada validação
- Relatórios prontos para apresentação à CVM
- Conformidade com LGPD (dados sensíveis)

---

## Autor

**Rafael Santana**  
Candidato - Processo Seletivo Genial Investimentos 2026

GitHub: [@RafaelSR44](https://github.com/RafaelSR44)

---

## Licença

Este projeto foi desenvolvido para fins educacionais e de avaliação no processo seletivo da Genial Investimentos.

---

**Desenvolvido por Rafael Santana**
