import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import Link from 'next/link'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!cat) return { title: 'Categoría no encontrada' }
  return { title: cat.name }
}

export const revalidate = 60

export default async function CategoryPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      parent: true,
      children: true,
      posts: {
        include: {
          post: {
            include: {
              author: { select: { name: true, username: true } },
              categories: { include: { category: true } },
            },
          },
        },
        where: { post: { published: true } },
        orderBy: { post: { createdAt: 'desc' } },
      },
    },
  })

  if (!category) notFound()

  const posts = category.posts.map((pc) => pc.post)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        {category.parent && (
          <Link
            href={`/category/${category.parent.slug}`}
            className="text-xs text-text-faint tracking-widest uppercase hover:text-accent transition-colors mb-2 inline-block"
          >
            {category.parent.name}
          </Link>
        )}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-accent" />
          <span className="text-accent text-xs font-medium tracking-widest uppercase">Categoría</span>
        </div>
        <h1 className="text-3xl font-light text-text-primary">{category.name}</h1>
        <p className="text-text-muted mt-2">{posts.length} entradas</p>

        {/* Subcategories */}
        {category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="px-3 py-1 border border-border text-sm text-text-muted hover:border-accent hover:text-accent transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-faint">
          <p>No hay entradas en esta categoría.</p>
        </div>
      )}
    </div>
  )
}
