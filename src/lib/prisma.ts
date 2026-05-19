import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrisma(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL ?? 'file:./prisma/dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN
  const adapter = new PrismaLibSql({ url, authToken })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

export function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    return createPrisma()
  }
  if (!global.__prisma) {
    global.__prisma = createPrisma()
  }
  return global.__prisma
}
