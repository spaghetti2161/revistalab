import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Buscar' }

type Props = { searchParams: { q?: string } }

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() || ''

  const posts = query
    ? await prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 24,
        include: {
          author: { select: { name: true, username: true } },
          categories: { include: { category: true } },
        },
      })
    : []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-accent" />
          <span className="text-accent text-xs font-medium tracking-widest uppercase">Búsqueda</span>
        </div>
        <h1 className="text-3xl font-light text-text-primary">
          {query ? `Resultados para "${query}"` : 'Buscar entradas'}
        </h1>
        {query && (
          <p className="text-text-muted mt-2">{posts.length} resultado{posts.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Search form */}
      <form method="GET" className="mb-12">
        <div className="flex gap-0 max-w-xl">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Buscar por título o contenido..."
            className="flex-1 bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            className="bg-accent text-base px-6 py-3 font-medium hover:bg-accent-hover transition-colors"
          >
            Buscar
          </button>
        </div>
      </form>

      {query && posts.length === 0 && (
        <div className="text-center py-20 text-text-faint">
          <p>No se encontraron entradas para &ldquo;{query}&rdquo;</p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
