import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import ViewTracker from '@/components/ViewTracker'
import PostActions from '@/components/PostActions'
import { getCurrentUser } from '@/lib/auth'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug, published: true },
    include: { author: { select: { name: true } } },
  })
  if (!post) return { title: 'Entrada no encontrada' }
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export const revalidate = 0

export default async function PostPage({ params }: Props) {
  const [post, currentUser] = await Promise.all([
    prisma.post.findUnique({
      where: { slug: params.slug, published: true },
      include: {
        author: { select: { name: true, username: true, avatar: true } },
        categories: { include: { category: { include: { parent: true } } } },
      },
    }),
    getCurrentUser(),
  ])

  if (!post) notFound()

  const canEdit =
    currentUser?.username === post.author.username || currentUser?.role === 'ADMIN'

  const relatedPosts = await prisma.post.findMany({
    where: {
      published: true,
      id: { not: post.id },
      categories: {
        some: {
          categoryId: { in: post.categories.map((c) => c.categoryId) },
        },
      },
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true, username: true } } },
  })

  const formattedDate = new Date(post.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <ViewTracker slug={params.slug} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Categories */}
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories.map(({ category }) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-xs text-accent tracking-widest uppercase hover:text-accent-hover transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-light text-text-primary leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-text-muted mb-8 pb-8 border-b border-border">
          <Link
            href={`/profile/${post.author.username}`}
            className="hover:text-text-primary transition-colors"
          >
            {post.author.name || post.author.username}
          </Link>
          <span className="text-border">·</span>
          <time>{formattedDate}</time>
          <span className="text-border">·</span>
          <span>{post.views.toLocaleString('es-AR')} lecturas</span>
          {canEdit && (
            <>
              <span className="text-border">·</span>
              <PostActions
                slug={post.slug}
                redirectTo={`/profile/${post.author.username}`}
              />
            </>
          )}
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative w-full aspect-video mb-10 rounded-sm overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-text-muted font-light leading-relaxed mb-10 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Author card */}
        <div className="mt-16 pt-8 border-t border-border flex items-start gap-4">
          {post.author.avatar ? (
            <Image
              src={post.author.avatar}
              alt={post.author.name || post.author.username}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-overlay flex items-center justify-center text-text-muted font-medium flex-shrink-0">
              {(post.author.name || post.author.username)[0].toUpperCase()}
            </div>
          )}
          <div>
            <Link
              href={`/profile/${post.author.username}`}
              className="font-medium text-text-primary hover:text-accent transition-colors"
            >
              {post.author.name || post.author.username}
            </Link>
            <p className="text-sm text-text-muted mt-1">
              Ver todas las entradas de este autor
            </p>
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-sm text-text-faint tracking-widest uppercase mb-6">
              También podría interesarte
            </h2>
            <div className="space-y-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <span className="text-text-primary group-hover:text-accent transition-colors">
                      {related.title}
                    </span>
                    <svg className="w-4 h-4 text-text-faint group-hover:text-accent transition-colors flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}
