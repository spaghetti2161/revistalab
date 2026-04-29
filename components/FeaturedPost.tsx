import Link from 'next/link'
import Image from 'next/image'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  createdAt: Date
  views: number
  author: { name: string | null; username: string }
  categories: { category: { id: string; name: string; slug: string } }[]
}

export default function FeaturedPost({ post }: { post: Post }) {
  const date = new Date(post.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border hover:border-accent/50 transition-colors duration-300">
        {/* Image */}
        <div className="relative aspect-video lg:aspect-auto lg:min-h-72 bg-overlay overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-text-faint text-6xl font-light opacity-20">
                {post.title[0]}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {post.categories.map(({ category }) => (
                <span key={category.id} className="text-xs text-accent tracking-widest uppercase">
                  {category.name}
                </span>
              ))}
            </div>
          )}

          <h2 className="text-2xl lg:text-3xl font-light text-text-primary leading-tight mb-4 group-hover:text-accent transition-colors duration-200">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-text-muted leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-text-faint mt-auto">
            <span>{post.author.name || post.author.username}</span>
            <span className="text-border">·</span>
            <time>{date}</time>
            <span className="text-border">·</span>
            <span>{post.views.toLocaleString('es-AR')} lecturas</span>
          </div>

          <div className="mt-6 flex items-center gap-2 text-accent text-sm">
            <span>Leer entrada</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  )
}
