import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Criar nova instância para evitar cache de schema antigo
if (globalForPrisma.prisma) {
  globalForPrisma.prisma.$disconnect()
  globalForPrisma.prisma = undefined
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
