import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { role: string }).role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden')
  }
  return session
}

export async function GET() {
  await requireSuperAdmin()
  const prisma = getPrisma()
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: { select: { orders: true, reservations: true, products: true, users: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tenants)
}

export async function POST(req: NextRequest) {
  await requireSuperAdmin()
  const prisma = getPrisma()
  const body = await req.json()

  const tenant = await prisma.tenant.create({ data: body })
  return NextResponse.json(tenant, { status: 201 })
}
