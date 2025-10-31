import { NextRequest, NextResponse } from 'next/server'
import { gerarId } from '@/lib/utils'

/**
 * API Route para registrar aceite do Termo de Ciência
 * POST /api/suitability/termo-ciencia
 * 
 * Esta rota registra quando o cliente aceita prosseguir com uma operação
 * que resulta em alerta de desenquadramento, conforme permitido pela CVM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validações
    if (!body.relatorio_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID do relatório é obrigatório'
        },
        { status: 400 }
      )
    }

    if (!body.cliente_nome || !body.cliente_email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dados do cliente são obrigatórios'
        },
        { status: 400 }
      )
    }

    if (!body.aceite || body.aceite !== true) {
      return NextResponse.json(
        {
          success: false,
          message: 'Aceite do termo é obrigatório'
        },
        { status: 400 }
      )
    }

    // Registrar termo de ciência
    const termoRegistrado = {
      id: gerarId(),
      relatorio_id: body.relatorio_id,
      cliente: {
        nome: body.cliente_nome,
        email: body.cliente_email
      },
      aceite: true,
      timestamp: new Date().toISOString(),
      ip_origem: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'desconhecido',
      user_agent: request.headers.get('user-agent') || 'desconhecido',
      
      // Informações para auditoria e compliance
      auditoria: {
        tipo_evento: 'ACEITE_TERMO_CIENCIA',
        origem: 'WEB_APP',
        conformidade: 'CVM_30',
        justificativa: body.justificativa || 'Cliente ciente do risco e optou por prosseguir'
      }
    }

    // Em produção, aqui seria salvo no banco de dados
    // await database.termosCiencia.insert(termoRegistrado)
    
    // Log de auditoria (em produção, enviaria para sistema de logs centralizado)
    console.log('[AUDITORIA] Termo de Ciência registrado:', {
      termo_id: termoRegistrado.id,
      cliente: body.cliente_nome,
      timestamp: termoRegistrado.timestamp,
      relatorio_id: body.relatorio_id
    })

    return NextResponse.json({
      success: true,
      message: 'Termo de ciência registrado com sucesso',
      data: {
        termo_id: termoRegistrado.id,
        timestamp: termoRegistrado.timestamp,
        protocolo: `TC-${termoRegistrado.id.toUpperCase()}`
      }
    })

  } catch (error) {
    console.error('Erro ao registrar termo de ciência:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao registrar termo de ciência',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
