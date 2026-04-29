import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { sendNewPostNewsletter } from '@/lib/email'

type Params = { params: { slug: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { name: true, username: true, avatar: true } },
      categories: { include: { category: true } },
    },
  })

  if (!post) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  if (post.authorId !== currentUser.userId && currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const wasUnpublished = !post.published
    const willBePublished = body.published === true

    const { categoryIds, ...rest } = body

    const updated = await prisma.post.update({
      where: { slug: params.slug },
      data: {
        ...rest,
        ...(categoryIds !== undefined && {
          categories: {
            deleteMany: {},
            create: categoryIds.map((id: string) => ({ categoryId: id })),
          },
        }),
      },
      include: { author: { select: { name: true } } },
    })

    if (wasUnpublished && willBePublished) {
      const subscribers = await prisma.subscriber.findMany({ select: { email: true } })
      if (subscribers.length > 0) {
        sendNewPostNewsletter(
          subscribers.map((s) => s.email),
          { title: updated.title, excerpt: updated.excerpt, slug: updated.slug, authorName: updated.author.name }
        ).catch(console.error)
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  if (post.authorId !== currentUser.userId && currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  await prisma.post.delete({ where: { slug: params.slug } })
  return NextResponse.json({ ok: true })
}
