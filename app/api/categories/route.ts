import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: [{ parentId: 'asc' }, { name: 'asc' }] })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { name, slug, parentId } = await request.json()
    if (!name || !slug) {
      return NextResponse.json({ error: 'Nombre y slug requeridos' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: { name, slug, parentId: parentId || null },
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error && error.message.includes('Unique') ? 'El slug ya existe' : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
