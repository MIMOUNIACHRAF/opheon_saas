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

  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: body.status },
  })
  return NextResponse.json(reservation)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params
  await requireAdmin(slug)
  const prisma = getPrisma()
  await prisma.reservation.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
