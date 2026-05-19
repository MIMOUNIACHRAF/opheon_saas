import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { CategorySchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const categories = await prisma.category.findMany({
    where: { tenantId: tenant.id },
    include: { products: { where: { available: true }, orderBy: { nameFr: 'asc' } } },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(categories)
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
  const parsed = CategorySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const category = await prisma.category.create({
    data: { ...parsed.data, tenantId: tenant.id },
  })
  return NextResponse.json(category, { status: 201 })
}
