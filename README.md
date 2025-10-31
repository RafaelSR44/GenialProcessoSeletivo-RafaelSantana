# Sistema de Gestão de Clientes e Validação de Suitability

Sistema completo de gestão de investimentos com autenticação, CRUD de clientes e validação de conformidade desenvolvido para o **Processo Seletivo da Genial Investimentos**.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Sobre o Projeto

Sistema completo de gestão de investimentos que combina autenticação segura, gerenciamento de clientes e carteiras, com validação automática de conformidade conforme a **Resolução CVM nº 30**.

### Funcionalidades Principais

#### Autenticação e Segurança
- **Sistema de Login/Registro** - Autenticação com Better Auth
- **Sessões Seguras** - Gerenciamento de sessões de 7 dias
- **Rotas Protegidas** - Proteção de páginas com middleware
- **Hash de Senhas** - Criptografia com bcryptjs

#### Gestão de Clientes
- **CRUD Completo** - Criar, visualizar, editar e deletar clientes
- **Gerenciamento de Carteiras** - Múltiplos ativos por cliente
- **Cálculo Automático de Risco** - Média ponderada em tempo real
- **Perfis de Investidor** - Conservador, Moderado e Arrojado

#### Validação de Suitability
- **Validação Automática** - Ao adicionar novos ativos à carteira
- **Projeção de Risco** - Simulação antes da execução
- **Três Níveis de Status** - Aprovado, Alerta e Rejeitado
- **Termo de Ciência** - Registro formal no banco de dados quando risco excede limite
- **Histórico de Validações** - Rastreamento completo para auditoria

#### Interface Profissional
- **Design Corporativo** - Visual profissional sem elementos "IA"
- **Navegação Intuitiva** - Menu com páginas Validação e Clientes
- **Modais Interativos** - Criação e edição de clientes
- **Feedback Visual** - Indicadores de status e risco  

---

## Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Neon Database (PostgreSQL serverless)

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

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require&pgbouncer=true&pgprepare=false"
DIRECT_URL="postgresql://user:password@host/database?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

6. Abra [http://localhost:3000](http://localhost:3000) no navegador

### Primeiro Acesso

1. Acesse `/auth` para criar sua conta
2. Faça login com suas credenciais
3. Você será redirecionado para a página de Validação
4. Use o menu para navegar entre Validação e Clientes

---

## Estrutura do Projeto

```
/app
  /api
    /auth/[...all]        - Rotas de autenticação (Better Auth)
    /clientes
      route.ts            - GET (listar), POST (criar cliente)
      /[id]
        route.ts          - GET, PUT, DELETE (operações individuais)
        /carteira
          route.ts        - GET (buscar carteira com ativos)
    /cep
      route.ts            - Consulta de CEP (ViaCEP)
    /consulta
      route.ts            - Validação de suitability
    /processar
      route.ts            - Processamento de validações
    /suitability
      /termo-ciencia      - Registro de termos de ciência
  /auth
    page.tsx              - Página de login/registro
    auth-form.tsx         - Formulário de autenticação
  /clientes
    page.tsx              - Interface CRUD de clientes
    clientes.module.css   - Estilos da página de clientes
  page.tsx                - Página inicial (validação)
  page.module.css         - Estilos da página inicial
  protected-page.tsx      - Wrapper de autenticação
  layout.tsx              - Layout base
  globals.css             - Estilos globais

/lib
  auth.ts                 - Configuração Better Auth (servidor)
  auth-client.ts          - Client-side auth helpers
  prisma.ts               - Cliente Prisma singleton
  suitability.ts          - Lógica central do motor de validação
  types.ts                - Definições de tipos TypeScript
  utils.ts                - Funções utilitárias

/prisma
  schema.prisma           - Schema do banco de dados
  /migrations             - Histórico de migrações

.env                      - Variáveis de ambiente (não versionado)
```

---

## Como Usar

### Página de Validação (Home)

1. **Preencher Perfil do Cliente**
   - Nome e e-mail
   - Perfil de investidor (Conservador, Moderado ou Arrojado)
   - Score máximo de risco tolerado (0-5)

2. **Adicionar Ativos à Carteira Atual**
   - Nome do ativo
   - Risco do ativo (0-5)
   - Valor investido em R$

3. **Definir Nova Ordem de Compra**
   - Ativo que deseja comprar
   - Risco do novo ativo
   - Valor da ordem

4. **Validar Suitability**
   - O sistema calcula automaticamente o risco atual e projetado
   - Retorna status: **Aprovado**, **Alerta** ou **Rejeitado**

5. **Baixar Relatório**
   - Relatório completo em formato texto para auditoria

### Página de Clientes

1. **Criar Novo Cliente**
   - Clique em "Novo Cliente"
   - Preencha: Nome, Email, Perfil de Risco, Score Máximo
   - Adicione a carteira inicial com ativos
   - Sistema calcula automaticamente o risco da carteira
   - **Não há validação de suitability na criação**

2. **Visualizar Cliente**
   - Clique no botão "Ver" de qualquer cliente
   - Veja todos os detalhes e ativos da carteira

3. **Editar Cliente**
   - Clique no botão "Editar"
   - Modifique informações do cliente ou da carteira
   - **Remover ativos**: Apenas recalcula o risco (sem validação)
   - **Adicionar novos ativos**: Validação de suitability obrigatória
   - Se risco projetado > score máximo: Modal de Termo de Ciência
   - Aceitar termo registra no banco de dados e permite salvar

4. **Deletar Cliente**
   - Clique no botão "Deletar"
   - Confirme a exclusão
   - Todos os dados relacionados são removidos (cascade)

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

## Banco de Dados

### Schema Prisma

O sistema utiliza 7 modelos principais:

1. **User** - Usuários do sistema (Better Auth)
2. **Session** - Sessões de autenticação
3. **Account** - Contas de provedores de autenticação
4. **Cliente** - Dados dos clientes/investidores
5. **Carteira** - Carteiras de investimento dos clientes
6. **Ativo** - Ativos individuais dentro das carteiras
7. **Validacao** - Histórico de validações de suitability
8. **TermoCiencia** - Registro de termos de ciência aceitos

### Relacionamentos

- Um **User** pode ter múltiplos **Clientes**
- Um **Cliente** pode ter múltiplas **Carteiras**
- Uma **Carteira** pode ter múltiplos **Ativos**
- Um **Cliente** pode ter múltiplas **Validações**
- Um **Cliente** pode ter múltiplos **TermosCiencia**

### Migrações

```bash
# Criar nova migração
npx prisma migrate dev --name nome_da_migracao

# Aplicar migrações em produção
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate

# Visualizar banco de dados
npx prisma studio
```

---

## Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.6** - Framework React com App Router
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript 5.5** - Tipagem estática
- **CSS Modules** - Estilos com escopo local

### Backend
- **Next.js API Routes** - Endpoints serverless
- **Prisma 6.18.0** - ORM para PostgreSQL
- **Better Auth** - Sistema de autenticação moderno
- **bcryptjs** - Hash de senhas

### Database
- **Neon PostgreSQL** - Database serverless
- **Prisma Migrations** - Versionamento de schema

### Ferramentas
- **ESLint** - Linting de código
- **Prettier** - Formatação de código

---

## API Routes

### Autenticação
- **POST** `/api/auth/sign-in` - Login de usuário
- **POST** `/api/auth/sign-up` - Registro de novo usuário
- **POST** `/api/auth/sign-out` - Logout
- **GET** `/api/auth/get-session` - Obter sessão atual

### Clientes
- **GET** `/api/clientes` - Listar todos os clientes do usuário logado
- **POST** `/api/clientes` - Criar novo cliente com carteira inicial
- **GET** `/api/clientes/[id]` - Buscar detalhes de um cliente
- **PUT** `/api/clientes/[id]` - Atualizar cliente e carteira
- **DELETE** `/api/clientes/[id]` - Deletar cliente (cascade)

### Carteiras
- **GET** `/api/clientes/[id]/carteira` - Buscar carteira com ativos

### Suitability
- **POST** `/api/consulta` - Validar suitability de nova ordem
- **POST** `/api/suitability/termo-ciencia` - Registrar termo de ciência
- **POST** `/api/processar` - Processar validação completa

### Utilidades
- **GET** `/api/cep?cep=xxxxx-xxx` - Consultar CEP (ViaCEP)

---

## Regras de Negócio

### Validação de Suitability

A validação de suitability é **obrigatória** apenas nos seguintes casos:

1. **Ao adicionar novos ativos** a uma carteira existente (edição)
2. **Não é necessária** ao:
   - Criar um novo cliente e carteira inicial
   - Remover ativos de uma carteira
   - Apenas editar informações do cliente (sem mexer nos ativos)

### Fluxo de Validação

1. Sistema detecta adição de novo ativo
2. Calcula risco projetado da carteira
3. Compara com score máximo do perfil do cliente
4. **Se risco ≤ score máximo**: Aprovado automaticamente
5. **Se risco > score máximo**: Requer Termo de Ciência
   - Modal é exibido com detalhes do risco
   - Cliente pode aceitar ou cancelar
   - Se aceitar: Termo registrado no banco de dados
   - Operação prossegue normalmente

### Cálculo de Risco

**Média Ponderada:**
```
Risco = Σ(Risco_ativo × Valor_ativo) / Σ(Valor_ativo)
```

**Perfis de Risco:**
- **Conservador**: Score máximo recomendado 1-2
- **Moderado**: Score máximo recomendado 2-3
- **Arrojado**: Score máximo recomendado 3-5

---

## Compliance e Segurança

### Autenticação
- Senhas criptografadas com bcryptjs
- Sessões com expiração de 7 dias
- Tokens seguros gerenciados pelo Better Auth
- Rotas protegidas com middleware

### Banco de Dados
- Conexão SSL com Neon PostgreSQL
- Prepared statements desabilitados para pgbouncer
- Cascade delete para integridade referencial
- Timestamps automáticos em todos os registros

### Auditoria
- Registro de todas as validações com protocolo único
- Histórico de termos de ciência no banco
- Rastreamento de operações por usuário
- Timestamps em todas as operações

### LGPD
- Dados sensíveis armazenados com segurança
- Senhas nunca expostas em logs ou APIs
- Relacionamento de dados por usuário
- Possibilidade de exclusão completa (cascade)

---

## Comandos Úteis

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Lint do código
npm run lint
```

### Banco de Dados
```bash
# Criar e aplicar migração
npx prisma migrate dev

# Aplicar migrações (produção)
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Resetar banco de dados (CUIDADO!)
npx prisma migrate reset
```

### Troubleshooting

#### Erro: "Response from the Engine was empty"
**Causa:** Prepared statements incompatíveis com pgbouncer do Neon.  
**Solução:** Adicione `pgprepare=false` na `DATABASE_URL`:
```env
DATABASE_URL="postgresql://...?pgbouncer=true&pgprepare=false"
```

#### Erro: "Cannot find module 'prisma/client'"
**Solução:**
```bash
npx prisma generate
```

#### Erro: Async params no Next.js 15
**Causa:** Next.js 15 requer await em params de rotas dinâmicas.  
**Código correto:**
```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

#### Porta 3000 em uso
```bash
# Windows
taskkill //F //IM node.exe

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## Documentação Técnica Adicional

- **[SCRIPTS.md](SCRIPTS.md)** - Scripts e comandos úteis do projeto
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Guia de resolução de problemas

---

## Autor

**Rafael Santana**  
Candidato - Processo Seletivo Genial Investimentos 2026

GitHub: [@RafaelSR44](https://github.com/RafaelSR44)

---

## Licença

Este projeto foi desenvolvido para fins educacionais e de avaliação no processo seletivo da Genial Investimentos.

---

## Changelog

### v2.0.0 - Sistema Completo de Gestão
- ✅ Implementação de autenticação com Better Auth
- ✅ Integração com banco de dados Neon PostgreSQL
- ✅ CRUD completo de clientes e carteiras
- ✅ Validação automática de suitability em adições de ativos
- ✅ Sistema de termos de ciência com registro em banco
- ✅ Interface profissional sem elementos "IA"
- ✅ Navegação entre páginas com proteção de rotas

### v1.0.0 - Motor de Validação Inicial
- ✅ Validação de suitability standalone
- ✅ Cálculo de risco de carteira
- ✅ Geração de relatórios

---

**Desenvolvido por Rafael Santana para Genial Investimentos**
