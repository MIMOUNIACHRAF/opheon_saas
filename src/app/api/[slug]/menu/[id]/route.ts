import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { ProductSchema } from '@/lib/validations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  await requireAdmin(slug)
  const prisma = getPrisma()
  const body = await req.json()
  const parsed = ProductSchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
    include: { category: true },
  })
  return NextResponse.json(product)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  await requireAdmin(slug)
  const prisma = getPrisma()
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
