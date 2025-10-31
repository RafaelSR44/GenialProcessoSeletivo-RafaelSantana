/**
 * Script de Teste para o Motor de Suitability
 * Execute com: node --loader tsx lib/suitability.test.ts
 * ou adicione ao package.json como script de teste
 */

import {
  calcularRiscoCarteira,
  calcularValorTotal,
  calcularRiscoProjetado,
  calcularLimiteAlerta,
  determinarStatus,
  validarSuitability,
  monitorarDesenquadramentoPassivo
} from './suitability'
import { Ativo, NovaOrdem, PerfilCliente } from './types'

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`)
}

function assert(condition: boolean, message: string) {
  if (condition) {
    log(colors.green, `✓ ${message}`)
    return true
  } else {
    log(colors.red, `✗ ${message}`)
    return false
  }
}

// Dados de teste
const carteiraExemplo1: Ativo[] = [
  { ativo: 'CDB XPTO', risco: 1.2, valor_investido: 50000 },
  { ativo: 'Ação ABC', risco: 4.0, valor_investido: 10000 }
]

const novaOrdemExemplo1: NovaOrdem = {
  ativo: 'FII YYY',
  risco: 3.5,
  valor_ordem: 5000
}

const perfilExemplo1: PerfilCliente = {
  nome: 'João Silva',
  email: 'joao@exemplo.com',
  perfil: 'Moderado',
  score_max_risco: 2.5
}

// Dados para teste de Alerta (Teste 8)
// Score máximo: 2.5, Limite alerta: 2.75
// Risco atual: (2.3 * 50000 + 2.7 * 30000) / 80000 = 2.45
// Com nova ordem: (2.3 * 50000 + 2.7 * 30000 + 4.5 * 10000) / 90000 = 2.633
// 2.5 < 2.633 <= 2.75 ✓ (está no intervalo de ALERTA)
const carteiraAlerta: Ativo[] = [
  { ativo: 'CDB XPTO', risco: 2.3, valor_investido: 50000 },
  { ativo: 'Ação ABC', risco: 2.7, valor_investido: 30000 }
]

const novaOrdemAlerta: NovaOrdem = {
  ativo: 'FII YYY',
  risco: 4.5,
  valor_ordem: 10000
}

const perfilAlerta: PerfilCliente = {
  nome: 'Maria Santos',
  email: 'maria@exemplo.com',
  perfil: 'Moderado',
  score_max_risco: 2.5
}

// Testes
console.log('\n' + '='.repeat(80))
log(colors.cyan, '🧪 INICIANDO TESTES DO MOTOR DE SUITABILITY')
console.log('='.repeat(80) + '\n')

let passedTests = 0
let totalTests = 0

// Teste 1: Cálculo de Risco da Carteira
log(colors.blue, '\n📊 Teste 1: Cálculo de Risco da Carteira')
totalTests++
const riscoCalculado = calcularRiscoCarteira(carteiraExemplo1)
const riscoEsperado = (1.2 * 50000 + 4.0 * 10000) / (50000 + 10000)
if (assert(
  Math.abs(riscoCalculado - riscoEsperado) < 0.01,
  `Risco calculado: ${riscoCalculado.toFixed(4)} | Esperado: ${riscoEsperado.toFixed(4)}`
)) passedTests++

// Teste 2: Cálculo de Valor Total
log(colors.blue, '\n💰 Teste 2: Cálculo de Valor Total')
totalTests++
const valorTotal = calcularValorTotal(carteiraExemplo1)
if (assert(
  valorTotal === 60000,
  `Valor total: R$ ${valorTotal.toLocaleString('pt-BR')} | Esperado: R$ 60.000`
)) passedTests++

// Teste 3: Cálculo de Risco Projetado
log(colors.blue, '\n🔮 Teste 3: Cálculo de Risco Projetado')
totalTests++
const riscoProjetado = calcularRiscoProjetado(carteiraExemplo1, novaOrdemExemplo1)
const riscoProjetadoEsperado = 
  (1.2 * 50000 + 4.0 * 10000 + 3.5 * 5000) / (50000 + 10000 + 5000)
if (assert(
  Math.abs(riscoProjetado - riscoProjetadoEsperado) < 0.01,
  `Risco projetado: ${riscoProjetado.toFixed(4)} | Esperado: ${riscoProjetadoEsperado.toFixed(4)}`
)) passedTests++

// Teste 4: Cálculo de Limite de Alerta
log(colors.blue, '\n⚠️  Teste 4: Cálculo de Limite de Alerta')
totalTests++
const limiteAlerta = calcularLimiteAlerta(2.5)
if (assert(
  limiteAlerta === 2.75,
  `Limite de alerta: ${limiteAlerta} | Esperado: 2.75`
)) passedTests++

// Teste 5: Determinação de Status - Aprovado
log(colors.blue, '\n✅ Teste 5: Status Aprovado')
totalTests++
const statusAprovado = determinarStatus(2.0, 2.5, 2.75)
if (assert(
  statusAprovado === 'Aprovado',
  `Status: ${statusAprovado} | Esperado: Aprovado`
)) passedTests++

// Teste 6: Determinação de Status - Alerta
log(colors.blue, '\n⚠️  Teste 6: Status Alerta')
totalTests++
const statusAlerta = determinarStatus(2.6, 2.5, 2.75)
if (assert(
  statusAlerta === 'Alerta',
  `Status: ${statusAlerta} | Esperado: Alerta`
)) passedTests++

// Teste 7: Determinação de Status - Rejeitado
log(colors.blue, '\n❌ Teste 7: Status Rejeitado')
totalTests++
const statusRejeitado = determinarStatus(3.0, 2.5, 2.75)
if (assert(
  statusRejeitado === 'Rejeitado',
  `Status: ${statusRejeitado} | Esperado: Rejeitado`
)) passedTests++

// Teste 8: Validação Completa de Suitability (com Status Alerta)
log(colors.blue, '\n🎯 Teste 8: Validação Completa - Status Alerta')
totalTests++
const resultado = validarSuitability(
  perfilAlerta,
  carteiraAlerta,
  novaOrdemAlerta
)
// Risco projetado deve estar entre score_max e limite_alerta (110% do score_max)
const scoreMax = perfilAlerta.score_max_risco
const limiteAlertaCalc = scoreMax * 1.1
const riscoEstaNoIntervaloAlerta = resultado.risco_projetado > scoreMax && resultado.risco_projetado <= limiteAlertaCalc
if (assert(
  resultado.status === 'Alerta' && resultado.requer_termo_ciencia === true && riscoEstaNoIntervaloAlerta,
  `Status: ${resultado.status} | Termo: ${resultado.requer_termo_ciencia} | Risco: ${resultado.risco_projetado.toFixed(4)} (esperado: ${scoreMax} < risco <= ${limiteAlertaCalc.toFixed(2)})`
)) passedTests++

// Teste 9: Carteira Vazia
log(colors.blue, '\n📭 Teste 9: Carteira Vazia')
totalTests++
const riscoVazio = calcularRiscoCarteira([])
if (assert(
  riscoVazio === 0,
  `Risco de carteira vazia: ${riscoVazio} | Esperado: 0`
)) passedTests++

// Teste 10: Desenquadramento Passivo
log(colors.blue, '\n📉 Teste 10: Monitoramento de Desenquadramento Passivo')
totalTests++
const carteiraDesenquadrada: Ativo[] = [
  { ativo: 'Ação Volátil', risco: 4.5, valor_investido: 60000 },
  { ativo: 'CDB', risco: 1.0, valor_investido: 40000 }
]
const monitoramento = monitorarDesenquadramentoPassivo(carteiraDesenquadrada, 2.5)
if (assert(
  monitoramento.desenquadrado === true && monitoramento.nivelGravidade === 'Alto',
  `Desenquadrado: ${monitoramento.desenquadrado} | Gravidade: ${monitoramento.nivelGravidade}`
)) passedTests++

// Resumo
console.log('\n' + '='.repeat(80))
log(colors.cyan, '📊 RESUMO DOS TESTES')
console.log('='.repeat(80))
console.log(`Total de testes: ${totalTests}`)
log(colors.green, `Testes aprovados: ${passedTests}`)
log(colors.red, `Testes reprovados: ${totalTests - passedTests}`)
const percentual = ((passedTests / totalTests) * 100).toFixed(2)
log(colors.yellow, `Taxa de sucesso: ${percentual}%`)
console.log('='.repeat(80) + '\n')

// Exibir detalhes do resultado da validação completa
console.log('\n' + '='.repeat(80))
log(colors.cyan, '📋 DETALHES DA VALIDAÇÃO COMPLETA (Teste 8)')
console.log('='.repeat(80))
console.log(JSON.stringify(resultado, null, 2))
console.log('='.repeat(80) + '\n')

// Código de saída
process.exit(passedTests === totalTests ? 0 : 1)
