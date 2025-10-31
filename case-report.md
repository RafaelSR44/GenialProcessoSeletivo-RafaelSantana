# Case Report - Motor de Validação de Suitability de Carteira

## Genial Investimentos - Processo Seletivo

**Candidato:** Rafael Santana  
**Data:** 29 de Outubro de 2025  
**Conformidade:** Resolução CVM nº 30

---

## 1. Visão Geral do Sistema

O Motor de Validação de Suitability de Carteira foi desenvolvido para garantir que todas as operações de compra de ativos pelos clientes estejam em conformidade com seus perfis de risco, conforme estabelecido pela Resolução CVM nº 30.

### 1.1 Arquitetura Implementada

O sistema foi desenvolvido utilizando:
- **Framework:** Next.js 15 com TypeScript
- **Arquitetura:** API Routes para backend e React para frontend
- **Padrão:** Separação de responsabilidades com módulos independentes

### 1.2 Módulos Principais

1. **`lib/types.ts`**: Definições de tipos TypeScript para garantir type-safety
2. **`lib/suitability.ts`**: Lógica central do motor de validação
3. **`lib/utils.ts`**: Funções utilitárias (formatação, validação)
4. **`app/api/suitability/validar/route.ts`**: API para validação de suitability
5. **`app/api/suitability/termo-ciencia/route.ts`**: API para registro de termos de ciência
6. **`app/api/suitability/relatorio/route.ts`**: API para geração de relatórios
7. **`app/page.tsx`**: Interface do usuário

---

## 2. Implementação Técnica

### 2.1 Cálculo do Risco da Carteira (Média Ponderada)

A função `calcularRiscoCarteira` implementa a fórmula matemática exigida:

```
RC = Σ(Risco_i × ValorInvestido_i) / Σ(ValorInvestido_i)
```

**Características:**
- Tratamento de carteiras vazias (retorna 0)
- Tratamento de divisão por zero
- Precisão mantida através de números de ponto flutuante

### 2.2 Projeção do Risco Pós-Compra

A função `calcularRiscoProjetado` simula a inclusão do novo ativo na carteira e recalcula o risco médio ponderado. Isso permite visualizar o impacto da operação antes de sua execução.

### 2.3 Validação de Desenquadramento

O sistema implementa três níveis de validação:

1. **Aprovado**: `Risco Projetado ≤ Score Máximo`
   - Operação pode ser executada sem restrições
   - Carteira permanece dentro do perfil

2. **Alerta**: `Score Máximo < Risco Projetado ≤ Limite de Alerta (110%)`
   - Requer Termo de Ciência do cliente
   - Cliente pode prosseguir após aceite formal

3. **Rejeitado**: `Risco Projetado > Limite de Alerta`
   - Operação bloqueada
   - Viola a política de suitability

### 2.4 Geração de Relatórios

O sistema gera relatórios completos em formato texto estruturado contendo:
- Dados do cliente e perfil
- Análise detalhada da carteira atual e projetada
- Cálculos de risco e validações
- Conformidade regulatória
- Protocolo único para auditoria

---

## 3. Respostas às Questões de Negócio

### 3.1 Regulação vs. Negócio: Implicações do Termo de Ciência

**Questão:** Se o cliente, ao receber o Alerta, insistir em prosseguir com a compra (permitido pela CVM com Termo de Ciência), quais são as implicações tecnológicas e de Compliance?

#### Implicações Tecnológicas:

**a) Registro Permanente no Banco de Dados**
```javascript
// Estrutura do registro
{
  id: "uuid",
  relatorio_id: "relatorio_referenciado",
  cliente: { nome, email },
  aceite: true,
  timestamp: "ISO_8601",
  ip_origem: "xxx.xxx.xxx.xxx",
  user_agent: "navegador_info",
  auditoria: {
    tipo_evento: "ACEITE_TERMO_CIENCIA",
    origem: "WEB_APP",
    conformidade: "CVM_30"
  }
}
```

**b) Sistema de Logs de Auditoria**
- Logs centralizados (Elasticsearch, CloudWatch, etc.)
- Rastreabilidade completa da ação
- Timestamp preciso e imutável
- Metadados de contexto (IP, User-Agent, origem)

**c) Armazenamento de Evidências**
- Snapshot da carteira no momento do aceite
- PDF/texto do termo apresentado
- Hash criptográfico para garantir integridade
- Versionamento dos termos de ciência

**d) Notificações Automáticas**
- E-mail ao cliente com cópia do termo aceito
- Notificação ao assessor responsável
- Alerta à equipe de compliance

**e) Integração com Sistema de CRM**
- Atualização automática do perfil do cliente
- Histórico de interações registrado
- Flag de "cliente com operação em alerta"

#### Implicações de Compliance:

**a) Governança de Dados**
- Retenção de registros por período mínimo (5-10 anos)
- LGPD: consentimento explícito registrado
- Direito ao esquecimento vs. obrigação regulatória

**b) Processo de Revisão Periódica**
- Sistema deve alertar compliance quando cliente acumular múltiplos termos
- Dashboard de clientes com operações em alerta
- Relatórios gerenciais para supervisão

**c) Trilha de Auditoria Completa**
- Quem autorizou (sistema automatizado vs. manual)
- Quando foi autorizado (timestamp)
- Por que foi autorizado (contexto da operação)
- Como foi autorizado (canal utilizado)

**d) Proteção Legal**
- Termo de ciência protege a Genial de responsabilização
- Demonstra que cliente foi adequadamente informado
- Documentação pode ser apresentada em eventuais disputas

**e) Conformidade com BACEN e CVM**
- Registro disponível para inspeções
- Relatórios podem ser gerados sob demanda
- Sistema deve permitir exportação de dados para órgãos reguladores

### 3.2 Desenquadramento Passivo

**Questão:** Como o sistema da Genial poderia usar este motor para monitorar o desenquadramento passivo (quando o risco da carteira aumenta devido à volatilidade do mercado) e quais canais de comunicação seriam mais eficazes?

#### Implementação Técnica do Monitoramento:

**a) Job Scheduled Diário/Semanal**
```javascript
// Pseudocódigo
async function monitorarDesenquadramentoPassivo() {
  const clientes = await obterTodosClientesAtivos()
  
  for (const cliente of clientes) {
    const carteiraAtualizada = await obterCarteiraComValoresMercado(cliente.id)
    const resultado = monitorarDesenquadramentoPassivo(
      carteiraAtualizada, 
      cliente.score_max_risco
    )
    
    if (resultado.desenquadrado) {
      await processarDesenquadramento(cliente, resultado)
    }
  }
}
```

**b) Sistema de Atualização de Preços em Tempo Real**
- Integração com APIs de cotações (B3, Fundos, CDBs)
- Recálculo automático de risco quando preço varia significativamente
- Event-driven architecture: mudança de preço → recálculo → notificação

**c) Níveis de Gravidade**
```javascript
{
  'Baixo': 0% < excesso ≤ 5%,      // Monitorar
  'Médio': 5% < excesso ≤ 10%,     // Notificar cliente
  'Alto': 10% < excesso ≤ 20%,     // Notificar + Assessor
  'Crítico': excesso > 20%         // Notificar + Compliance + Bloqueio
}
```

#### Canais de Comunicação Recomendados:

**1. Notificação Push no App (Mais Eficaz)**
- **Vantagens:**
  - Entrega instantânea
  - Alta taxa de visualização (70-90%)
  - Permite ação imediata (clique → app → rebalanceamento)
  - Custo baixo
- **Momento:** Desenquadramento detectado
- **Mensagem:** "Atenção: O risco da sua carteira aumentou devido à volatilidade do mercado. Revise sua carteira agora."

**2. E-mail Automático (Complementar)**
- **Vantagens:**
  - Documentação formal
  - Pode incluir detalhes técnicos e gráficos
  - Cliente pode consultar posteriormente
  - Serve como evidência de comunicação
- **Momento:** Desenquadramento confirmado + Relatório semanal
- **Conteúdo:**
  - Resumo da situação
  - Comparativo: risco atual vs. permitido
  - Sugestões de rebalanceamento
  - Link para acessar assessor

**3. SMS (Urgência Alta)**
- **Vantagens:**
  - Alta taxa de leitura (98% em 3 minutos)
  - Independente de internet
  - Ideal para alertas críticos
- **Momento:** Desenquadramento crítico (>20% do limite)
- **Mensagem:** "URGENTE: Risco da sua carteira na Genial excedeu limite. Acesse o app ou ligue para seu assessor."

**4. Notificação ao Assessor (Fundamental)**
- **Vantagens:**
  - Permite contato humano personalizado
  - Assessor pode oferecer soluções específicas
  - Fortalece relacionamento cliente-assessor
- **Momento:** Desenquadramento médio ou alto
- **Ação:** Assessor deve entrar em contato proativo
- **Dashboard:** Lista de clientes desenquadrados para o assessor acompanhar

**5. Central de Notificações no App (Histórico)**
- **Vantagens:**
  - Cliente pode revisar notificações antigas
  - Transparência no relacionamento
  - Educação financeira
- **Conteúdo:** Histórico de todos os alertas de desenquadramento

#### Estratégia de Comunicação por Gravidade:

| Nível | App Push | E-mail | SMS | Assessor | Compliance |
|-------|----------|--------|-----|----------|------------|
| Baixo | ✓ | Semanal | - | - | - |
| Médio | ✓ | ✓ | - | Notificado | - |
| Alto | ✓ | ✓ | - | ✓ Contato Ativo | Notificado |
| Crítico | ✓ | ✓ | ✓ | ✓ Contato Imediato | ✓ + Bloqueio |

#### Frequência de Monitoramento Recomendada:

1. **Tempo Real (Streaming):**
   - Para clientes com carteiras altamente voláteis
   - Custo computacional alto, mas necessário para risco crítico

2. **Diário (Batch Processing):**
   - Para maioria dos clientes
   - Processamento overnight (madrugada)
   - Notificações enviadas pela manhã

3. **Semanal (Relatório Consolidado):**
   - Para clientes conservadores com baixa volatilidade
   - E-mail com resumo da semana

#### Funcionalidades Adicionais do Sistema:

**a) Sugestões Automáticas de Rebalanceamento**
```javascript
{
  "sugestoes": [
    {
      "acao": "Reduzir exposição",
      "ativo": "Ação ABC",
      "percentual_reducao": 15,
      "justificativa": "Reduzir risco da carteira em X pontos"
    },
    {
      "acao": "Aumentar exposição",
      "ativo": "CDB XPTO",
      "percentual_aumento": 10,
      "justificativa": "Aumentar alocação em ativos de menor risco"
    }
  ]
}
```

**b) Simulador de Rebalanceamento**
- Cliente testa cenários antes de executar
- Visualiza impacto no risco projetado
- Facilita tomada de decisão informada

**c) Alertas Preventivos**
- Sistema avisa quando risco está próximo do limite (ex: 95%)
- Cliente pode agir antes do desenquadramento
- Reduz fricção e melhora experiência

---

## 4. Diferenciais Implementados

### 4.1 Experiência do Usuário

- Interface intuitiva e responsiva
- Feedback visual claro do status (cores, badges)
- Formulário dividido em etapas lógicas
- Validações em tempo real

### 4.2 Segurança e Compliance

- Validações no frontend e backend
- Registro de auditoria com metadados completos
- Geração de protocolo único para cada validação
- Relatório completo disponível para download

### 4.3 Escalabilidade

- Código modular e reutilizável
- Funções puras para cálculos (fácil teste unitário)
- Separação clara entre lógica de negócio e apresentação
- Preparado para integração com banco de dados

### 4.4 Conformidade Regulatória

- Fórmulas matemáticas implementadas corretamente
- Três níveis de validação bem definidos
- Documentação clara no código
- Relatórios com informações regulatórias

---

## 5. Próximos Passos (Roadmap)

### 5.1 Curto Prazo
- [ ] Integração com banco de dados (PostgreSQL/MongoDB)
- [ ] Testes unitários e de integração
- [ ] Sistema de autenticação de usuários
- [ ] API para integração com sistemas legados

### 5.2 Médio Prazo
- [ ] Dashboard de compliance para supervisão
- [ ] Sistema de monitoramento de desenquadramento passivo
- [ ] Integração com APIs de cotações em tempo real
- [ ] Notificações push e e-mail automáticas

### 5.3 Longo Prazo
- [ ] Machine Learning para sugestões de rebalanceamento
- [ ] App mobile nativo (iOS/Android)
- [ ] Sistema de assessoria digital automatizada
- [ ] Exportação de dados para órgãos reguladores

---

## 6. Conclusão

O Motor de Validação de Suitability de Carteira desenvolvido atende completamente aos requisitos técnicos e de negócio especificados no case. A solução:

1. Implementa corretamente a fórmula de cálculo de risco ponderado
2. Projeta o risco pós-compra com precisão
3. Valida desenquadramento com três níveis claros
4. Gera relatórios completos e estruturados
5. Registra termos de ciência para compliance
6. Fornece base para monitoramento de desenquadramento passivo
7. Interface intuitiva para operação do dia a dia

Além disso, a arquitetura proposta demonstra visão de negócio ao considerar:
- Implicações regulatórias e de compliance
- Experiência do cliente como diferencial competitivo
- Escalabilidade e manutenibilidade do código
- Integração com outros sistemas da organização

O sistema transforma uma obrigação legal (CVM 30) em um diferencial de serviço, fortalecendo a confiança do cliente na Genial Investimentos.

---

**Assinatura Digital**  
Rafael Santana  
Candidato - Processo Seletivo Genial Investimentos  
Data: 29/10/2025
