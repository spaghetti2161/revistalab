import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, username, name, password, token } = await request.json()

    if (!token || !username || !name || !password) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: 'Nombre de usuario inválido' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const invitation = await prisma.invitation.findUnique({ where: { token } })
    if (!invitation || invitation.used) {
      return NextResponse.json({ error: 'Token de invitación inválido o ya utilizado' }, { status: 400 })
    }

    const userEmail = email || invitation.email
    if (!userEmail) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: userEmail }, { username }] },
    })
    if (existingUser) {
      return NextResponse.json({ error: 'El email o nombre de usuario ya está en uso' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const [user] = await prisma.$transaction([
      prisma.user.create({
        data: {
          email: userEmail,
          username,
          name,
          password: hashedPassword,
          role: 'USER',
          invitedById: invitation.createdById,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { used: true },
      }),
    ])

    const jwtToken = await signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    setAuthCookie(jwtToken)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
