import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { OrderSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  await requireAdmin(slug)
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const orders = await prisma.order.findMany({
    where: { tenantId: tenant.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { items, ...orderData } = parsed.data
  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  const order = await prisma.order.create({
    data: {
      ...orderData,
      total,
      tenantId: tenant.id,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  })
  return NextResponse.json(order, { status: 201 })
}
