import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { ProductSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    include: { category: true },
    orderBy: [{ category: { order: 'asc' } }, { nameFr: 'asc' }],
  })
  return NextResponse.json(products)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  await requireAdmin(slug)
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = ProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const product = await prisma.product.create({
    data: { ...parsed.data, tenantId: tenant.id },
    include: { category: true },
  })
  return NextResponse.json(product, { status: 201 })
}
