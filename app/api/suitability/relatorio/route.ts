import { NextRequest, NextResponse } from 'next/server'
import { RelatorioSuitability } from '@/lib/types'
import { formatarMoeda, formatarPercentual, formatarData } from '@/lib/utils'

/**
 * API Route para gerar relatório de Suitability em formato texto
 * POST /api/suitability/relatorio
 * 
 * Gera um relatório detalhado em formato texto que pode ser baixado
 */
export async function POST(request: NextRequest) {
  try {
    const body: { relatorio: RelatorioSuitability } = await request.json()

    if (!body.relatorio) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dados do relatório não fornecidos'
        },
        { status: 400 }
      )
    }

    const { relatorio } = body
    const { cliente, validacao, timestamp, id } = relatorio

    // Gerar conteúdo do relatório
    const relatorioTexto = `
================================================================================
                    RELATÓRIO DE VALIDAÇÃO DE SUITABILITY
                           Genial Investimentos
================================================================================

PROTOCOLO: ${id.toUpperCase()}
DATA/HORA: ${formatarData(new Date(timestamp))}
CONFORMIDADE: Resolução CVM nº 30

================================================================================
                          DADOS DO CLIENTE
================================================================================

Nome: ${cliente.nome}
E-mail: ${cliente.email}
Perfil de Investidor: ${cliente.perfil}
Score Máximo de Risco: ${cliente.score_max_risco.toFixed(2)}

================================================================================
                       ANÁLISE DE RISCO DA CARTEIRA
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ CARTEIRA ATUAL                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Valor Total Investido: ${formatarMoeda(validacao.detalhes.carteira_atual.valor_total).padEnd(52)}│
│ Risco Médio Ponderado: ${validacao.detalhes.carteira_atual.risco_medio.toFixed(4).padEnd(52)}│
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PROJEÇÃO PÓS-COMPRA                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Valor Total Projetado: ${formatarMoeda(validacao.detalhes.carteira_projetada.valor_total).padEnd(53)}│
│ Risco Médio Projetado: ${validacao.detalhes.carteira_projetada.risco_medio.toFixed(4).padEnd(53)}│
│ Aumento de Risco: ${formatarPercentual(validacao.detalhes.percentual_aumento_risco).padEnd(58)}│
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                         PARÂMETROS DE VALIDAÇÃO
================================================================================

Score Máximo Permitido (Perfil): ${validacao.score_max_permitido.toFixed(2)}
Limite de Alerta (110% do Score): ${validacao.limite_alerta.toFixed(2)}
Risco Atual da Carteira: ${validacao.risco_atual.toFixed(4)}
Risco Projetado da Carteira: ${validacao.risco_projetado.toFixed(4)}

================================================================================
                           RESULTADO DA VALIDAÇÃO
================================================================================

STATUS: ${validacao.status}

${validacao.mensagem}

${validacao.requer_termo_ciencia ? `
⚠️  ATENÇÃO: Esta operação requer TERMO DE CIÊNCIA do cliente.

O cliente deve estar ciente de que a operação resultará em uma carteira com
risco superior ao recomendado para seu perfil, mas dentro do limite de alerta
estabelecido pela política de Suitability da Genial Investimentos.
` : ''}

${validacao.status === 'Aprovado' ? `
✓ A operação está APROVADA e pode ser executada.
  A carteira permanecerá em conformidade com o perfil do cliente.
` : ''}

${validacao.status === 'Rejeitado' ? `
✗ A operação foi REJEITADA.
  O risco projetado excede o limite máximo permitido pela política de Suitability.
  Recomenda-se revisar a ordem de compra ou reavaliar o perfil do cliente.
` : ''}

================================================================================
                         OBSERVAÇÕES REGULATÓRIAS
================================================================================

Este relatório foi gerado em conformidade com a Resolução CVM nº 30, que
estabelece diretrizes para a adequação de produtos, serviços e operações ao
perfil de risco do investidor.

A Genial Investimentos utiliza o método de média ponderada para calcular o
risco da carteira, considerando todos os ativos e suas respectivas alocações.

Fórmula utilizada:
RC = Σ(Risco_i × ValorInvestido_i) / Σ(ValorInvestido_i)

${validacao.requer_termo_ciencia ? `
IMPORTANTE: Caso o cliente decida prosseguir com a operação, o Termo de
Ciência deverá ser registrado no sistema para fins de auditoria e compliance.
` : ''}

================================================================================
                            ASSINATURA DIGITAL
================================================================================

Este documento foi gerado automaticamente pelo Sistema de Validação de
Suitability da Genial Investimentos.

Data de Geração: ${formatarData(new Date())}
Versão do Sistema: 1.0.0
Módulo: Motor de Validação de Suitability

================================================================================
                          FIM DO RELATÓRIO
================================================================================
`.trim()

    // Retornar relatório como texto
    return new NextResponse(relatorioTexto, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="relatorio-suitability-${id}.txt"`
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao gerar relatório',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
