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
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const category = post.categories[0]?.category

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="bg-elevated rounded-2xl overflow-hidden flex flex-col h-full transition-transform duration-200 group-hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-overlay overflow-hidden flex-shrink-0">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-text-faint text-5xl font-light opacity-10 select-none">
                {post.title[0]}
              </span>
            </div>
          )}

          {/* Category badge */}
          {category && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-accent text-base text-xs font-semibold px-2.5 py-1 rounded-full">
                {category.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors duration-150 leading-snug line-clamp-3 flex-1">
            {post.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-text-faint">
            <span className="truncate max-w-[60%]">{post.author.name || post.author.username}</span>
            <time className="flex-shrink-0">{date}</time>
          </div>
        </div>
      </article>
    </Link>
  )
}
