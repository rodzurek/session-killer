import { PrismaClient } from '@prisma/client'

const g = globalThis as typeof globalThis & { prisma?: PrismaClient }

if (!g.prisma) {
  g.prisma = new PrismaClient()
}

export const prisma = g.prisma
