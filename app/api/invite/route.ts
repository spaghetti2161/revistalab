import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { sendInvitationEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ valid: false })
  }

  const invitation = await prisma.invitation.findUnique({ where: { token } })

  if (!invitation || invitation.used) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({ valid: true, email: invitation.email })
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 400 })
    }

    const token = uuidv4()
    const invitation = await prisma.invitation.create({
      data: { email, token, createdById: currentUser.userId },
      include: { createdBy: { select: { name: true, username: true } } },
    })

    await sendInvitationEmail(
      email,
      token,
      invitation.createdBy.name || invitation.createdBy.username
    )

    return NextResponse.json({ ok: true, token })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al enviar invitación' }, { status: 500 })
  }
}
