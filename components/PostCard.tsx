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

export default function PostCard({ post }: { post: Post }) {
  const date = new Date(post.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="bg-elevated border border-border hover:border-accent/40 transition-colors duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-video bg-overlay overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-text-faint text-4xl font-light opacity-20">{post.title[0]}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {post.categories.length > 0 && (
            <span className="text-xs text-accent tracking-widest uppercase mb-2">
              {post.categories[0].category.name}
            </span>
          )}

          <h3 className="text-base font-medium text-text-primary group-hover:text-accent transition-colors leading-snug line-clamp-2 mb-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-sm text-text-muted leading-relaxed line-clamp-2 mb-4 flex-1">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
            <span className="text-xs text-text-faint">{post.author.name || post.author.username}</span>
            <div className="flex items-center gap-2 text-xs text-text-faint">
              <time>{date}</time>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
