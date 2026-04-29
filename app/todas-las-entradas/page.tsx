import { prisma } from '@/lib/prisma'
import PostCard from '@/components/PostCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Todas las entradas' }
export const revalidate = 60

export default async function TodasLasEntradasPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true, username: true } },
      categories: { include: { category: true } },
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-accent" />
          <span className="text-accent text-xs font-medium tracking-widest uppercase">Archivo</span>
        </div>
        <h1 className="text-3xl font-light text-text-primary">Todas las entradas</h1>
        <p className="text-text-muted mt-2">{posts.length} entradas publicadas</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-faint">
          <p>No hay entradas publicadas todavía.</p>
        </div>
      )}
    </div>
  )
}
