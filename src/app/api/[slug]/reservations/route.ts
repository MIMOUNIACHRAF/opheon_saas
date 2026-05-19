import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { ReservationSchema } from '@/lib/validations'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  await requireAdmin(slug)
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const reservations = await prisma.reservation.findMany({
    where: { tenantId: tenant.id },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(reservations)
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
  const parsed = ReservationSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const reservation = await prisma.reservation.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      tenantId: tenant.id,
    },
  })
  return NextResponse.json(reservation, { status: 201 })
}
