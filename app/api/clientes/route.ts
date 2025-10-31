import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const clientes = await prisma.cliente.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformar para snake_case para o frontend
    const clientesFormatados = clientes.map(cliente => ({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      perfil: cliente.perfil,
      score_max_risco: cliente.scoreMaxRisco,
      createdAt: cliente.createdAt
    }))

    return NextResponse.json(clientesFormatados)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, email, perfil, score_max_risco, ativos, risco_atual, valor_total } = body

    // Validações
    if (!nome || !email || !perfil) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, email, perfil' },
        { status: 400 }
      )
    }

    // Criar cliente e carteira em uma transação
    const cliente = await prisma.$transaction(async (tx) => {
      // Criar cliente
      const novoCliente = await tx.cliente.create({
        data: {
          userId: session.user.id,
          nome,
          email,
          perfil,
          scoreMaxRisco: score_max_risco
        }
      })

      // Criar carteira com ativos
      await tx.carteira.create({
        data: {
          clienteId: novoCliente.id,
          nome: 'Principal',
          riscoAtual: risco_atual || 0,
          valorTotal: valor_total || 0,
          ativos: {
            create: ativos?.map((ativo: any) => ({
              nome: ativo.ativo,
              risco: ativo.risco,
              valorInvestido: ativo.valor_investido
            })) || []
          }
        }
      })

      return novoCliente
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    )
  }
}
