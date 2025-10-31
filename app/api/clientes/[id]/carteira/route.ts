import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se o cliente pertence ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Buscar carteira com ativos
    const carteira = await prisma.carteira.findFirst({
      where: {
        clienteId: id
      },
      include: {
        ativos: true
      }
    })

    if (!carteira) {
      return NextResponse.json({ 
        id: '',
        clienteId: id,
        ativos: [],
        risco_atual: 0,
        valor_total: 0
      })
    }

    // Transformar para o formato esperado pelo frontend
    const response = {
      id: carteira.id,
      clienteId: carteira.clienteId,
      ativos: carteira.ativos.map(ativo => ({
        id: ativo.id,
        ativo: ativo.nome,
        risco: ativo.risco,
        valor_investido: ativo.valorInvestido
      })),
      risco_atual: carteira.riscoAtual,
      valor_total: carteira.valorTotal,
      createdAt: carteira.createdAt,
      updatedAt: carteira.updatedAt
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar carteira:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar carteira' },
      { status: 500 }
    )
  }
}
