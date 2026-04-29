import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSubscriptionConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const existing = await prisma.subscriber.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ message: 'Ya estás suscripto' })
    }

    await prisma.subscriber.create({ data: { email: email.toLowerCase() } })

    sendSubscriptionConfirmation(email).catch(console.error)

    return NextResponse.json({ message: 'Suscripción exitosa' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
