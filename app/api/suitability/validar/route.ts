import { NextRequest, NextResponse } from 'next/server'
import { validarSuitability } from '@/lib/suitability'
import { SuitabilityRequest, RelatorioSuitability } from '@/lib/types'
import { gerarId } from '@/lib/utils'

/**
 * API Route para validação de Suitability
 * POST /api/suitability/validar
 */
export async function POST(request: NextRequest) {
  try {
    const body: SuitabilityRequest = await request.json()

    // Validações básicas
    if (!body.perfil_cliente || !body.perfil_cliente.score_max_risco) {
      return NextResponse.json(
        {
          success: false,
          message: 'Perfil do cliente inválido ou score máximo de risco não informado'
        },
        { status: 400 }
      )
    }

    if (!body.carteira_atual || !Array.isArray(body.carteira_atual)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Carteira atual inválida'
        },
        { status: 400 }
      )
    }

    if (!body.nova_ordem || !body.nova_ordem.ativo || !body.nova_ordem.risco || !body.nova_ordem.valor_ordem) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nova ordem inválida. Certifique-se de informar ativo, risco e valor da ordem'
        },
        { status: 400 }
      )
    }

    // Validar valores numéricos
    if (body.perfil_cliente.score_max_risco <= 0 || body.perfil_cliente.score_max_risco > 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'Score máximo de risco deve estar entre 0 e 5'
        },
        { status: 400 }
      )
    }

    if (body.nova_ordem.risco <= 0 || body.nova_ordem.risco > 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'Risco do ativo deve estar entre 0 e 5'
        },
        { status: 400 }
      )
    }

    if (body.nova_ordem.valor_ordem <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valor da ordem deve ser maior que zero'
        },
        { status: 400 }
      )
    }

    // Validar carteira atual
    for (const ativo of body.carteira_atual) {
      if (!ativo.ativo || ativo.risco <= 0 || ativo.valor_investido <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'Carteira atual contém ativos inválidos'
          },
          { status: 400 }
        )
      }
    }

    // Executar validação de suitability
    const resultado = validarSuitability(
      body.perfil_cliente,
      body.carteira_atual,
      body.nova_ordem
    )

    // Gerar relatório
    const relatorio: RelatorioSuitability = {
      id: gerarId(),
      timestamp: new Date().toISOString(),
      cliente: body.perfil_cliente,
      validacao: resultado
    }

    // Retornar resultado
    return NextResponse.json({
      success: true,
      message: 'Validação executada com sucesso',
      data: relatorio
    })

  } catch (error) {
    console.error('Erro ao validar suitability:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao processar validação de suitability',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
