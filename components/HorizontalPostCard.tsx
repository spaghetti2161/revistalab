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

export default function HorizontalPostCard({ post, rank }: { post: Post; rank: number }) {
  const date = new Date(post.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="flex items-start gap-5 p-4 bg-elevated rounded-xl hover:bg-overlay transition-colors duration-200">
        {/* Rank */}
        <span className="text-3xl font-light text-border group-hover:text-accent/40 transition-colors flex-shrink-0 w-8 text-center leading-none mt-1">
          {String(rank).padStart(2, '0')}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {post.categories.length > 0 && (
            <span className="text-xs text-accent tracking-widest uppercase">
              {post.categories[0].category.name}
            </span>
          )}
          <h3 className="text-base font-medium text-text-primary group-hover:text-accent transition-colors mt-1 leading-snug line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-faint mt-2">
            <span>{post.author.name || post.author.username}</span>
            <span>·</span>
            <time>{date}</time>
            <span>·</span>
            <span>{post.views.toLocaleString('es-AR')} lecturas</span>
          </div>
        </div>

        {/* Thumbnail */}
        {post.coverImage && (
          <div className="relative w-20 h-14 bg-overlay flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </article>
    </Link>
  )
}
