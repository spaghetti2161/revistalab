import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const { name, bio, avatar } = await request.json()

    const updated = await prisma.user.update({
      where: { id: currentUser.userId },
      data: {
        name: name?.trim() || null,
        bio: bio?.trim() || null,
        avatar: avatar?.trim() || null,
      },
      select: { id: true, email: true, username: true, name: true, avatar: true, role: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
