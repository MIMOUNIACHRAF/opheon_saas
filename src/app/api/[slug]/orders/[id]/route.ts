import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  await requireAdmin(slug)
  const prisma = getPrisma()
  const body = await req.json()

  const order = await prisma.order.update({
    where: { id },
    data: { status: body.status },
    include: { items: { include: { product: true } } },
  })
  return NextResponse.json(order)
}
