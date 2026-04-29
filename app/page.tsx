import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import FeaturedPost from '@/components/FeaturedPost'
import HorizontalPostCard from '@/components/HorizontalPostCard'
import PostCard from '@/components/PostCard'

export const dynamic = 'force-dynamic'

async function getData() {
  const [latest, mostVisited, recent] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, username: true } }, categories: { include: { category: true } } },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { views: 'desc' },
      take: 3,
      include: { author: { select: { name: true, username: true } }, categories: { include: { category: true } } },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 7,
      include: { author: { select: { name: true, username: true } }, categories: { include: { category: true } } },
    }),
  ])

  // remove the latest from the recent grid to avoid duplication
  const recentGrid = recent.filter((p) => p.id !== latest?.id).slice(0, 6)

  return { latest, mostVisited, recentGrid }
}

export default async function HomePage() {
  const { latest, mostVisited, recentGrid } = await getData()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Sección 1: Última entrada destacada */}
      {latest && (
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-accent" />
            <span className="text-accent text-xs font-medium tracking-widest uppercase">Última entrada</span>
          </div>
          <FeaturedPost post={latest} />
        </section>
      )}

      {/* Sección 2: Las más leídas */}
      {mostVisited.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-accent" />
            <span className="text-accent text-xs font-medium tracking-widest uppercase">Las más leídas</span>
          </div>
          <div className="space-y-4">
            {mostVisited.map((post, index) => (
              <HorizontalPostCard key={post.id} post={post} rank={index + 1} />
            ))}
          </div>
        </section>
      )}

      {/* Sección 3: Entradas recientes */}
      {recentGrid.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-accent" />
              <span className="text-accent text-xs font-medium tracking-widest uppercase">Entradas recientes</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {recentGrid.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/todas-las-entradas"
              className="inline-flex items-center gap-2 border border-border text-text-muted hover:text-text-primary hover:border-accent px-6 py-3 text-sm transition-colors duration-200"
            >
              Ver todas las entradas
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {!latest && (
        <div className="text-center py-32 text-text-faint">
          <p className="text-lg">No hay entradas publicadas todavía.</p>
        </div>
      )}
    </div>
  )
}
