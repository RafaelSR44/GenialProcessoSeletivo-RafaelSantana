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

    const cliente = await prisma.cliente.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        carteiras: {
          include: {
            ativos: true
          }
        }
      }
    })

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const body = await request.json()
    const { nome, email, perfil, score_max_risco, ativos, risco_atual, valor_total } = body

    // Verificar se o cliente pertence ao usuário
    const clienteExistente = await prisma.cliente.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!clienteExistente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Atualizar cliente e carteira em uma transação
    const cliente = await prisma.$transaction(async (tx) => {
      // Atualizar cliente
      const clienteAtualizado = await tx.cliente.update({
        where: { id },
        data: {
          nome,
          email,
          perfil,
          scoreMaxRisco: score_max_risco
        }
      })

      // Buscar carteira principal
      const carteira = await tx.carteira.findFirst({
        where: { clienteId: id }
      })

      if (carteira) {
        // Deletar ativos antigos
        await tx.ativo.deleteMany({
          where: { carteiraId: carteira.id }
        })

        // Criar novos ativos
        if (ativos && ativos.length > 0) {
          await tx.ativo.createMany({
            data: ativos.map((ativo: any) => ({
              carteiraId: carteira.id,
              nome: ativo.ativo,
              risco: ativo.risco,
              valorInvestido: ativo.valor_investido
            }))
          })
        }

        // Atualizar carteira
        await tx.carteira.update({
          where: { id: carteira.id },
          data: {
            riscoAtual: risco_atual || 0,
            valorTotal: valor_total || 0
          }
        })
      }

      return clienteAtualizado
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar cliente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Deletar cliente (cascade vai deletar carteiras e ativos)
    await prisma.cliente.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar cliente' },
      { status: 500 }
    )
  }
}
