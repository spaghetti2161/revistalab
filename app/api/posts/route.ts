import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { sendNewPostNewsletter } from '@/lib/email'
import slugify from 'slugify'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const published = searchParams.get('published')
  const authorUsername = searchParams.get('author')
  const take = Number(searchParams.get('take')) || 20
  const skip = Number(searchParams.get('skip')) || 0

  const where: Record<string, unknown> = {}
  if (published === 'true') where.published = true
  if (published === 'false') where.published = false
  if (authorUsername) {
    where.author = { username: authorUsername }
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    skip,
    include: {
      author: { select: { name: true, username: true, avatar: true } },
      categories: { include: { category: true } },
    },
  })

  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { title, excerpt, content, coverImage, published, categoryIds } = await request.json()

    if (!title?.trim()) return NextResponse.json({ error: 'Título requerido' }, { status: 400 })
    if (!content?.trim()) return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })

    let slug = slugify(title, { lower: true, strict: true, locale: 'es' })
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        coverImage: coverImage?.trim() || null,
        published: Boolean(published),
        authorId: currentUser.userId,
        categories: categoryIds?.length
          ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
          : undefined,
      },
      include: { author: { select: { name: true } } },
    })

    if (post.published) {
      const subscribers = await prisma.subscriber.findMany({ select: { email: true } })
      if (subscribers.length > 0) {
        sendNewPostNewsletter(
          subscribers.map((s) => s.email),
          { title: post.title, excerpt: post.excerpt, slug: post.slug, authorName: post.author.name }
        ).catch(console.error)
      }
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
