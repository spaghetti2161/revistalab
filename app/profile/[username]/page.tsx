import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import PostActions from '@/components/PostActions'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'

type Props = { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { username: params.username } })
  if (!user) return { title: 'Usuario no encontrado' }
  return { title: user.name || user.username }
}

export const revalidate = 60

export default async function ProfilePage({ params }: Props) {
  const [profileUser, currentUser] = await Promise.all([
    prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        posts: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { name: true, username: true } },
            categories: { include: { category: true } },
          },
        },
      },
    }),
    getCurrentUser(),
  ])

  if (!profileUser) notFound()

  const isOwner = currentUser?.username === params.username
  const allPosts = isOwner
    ? await prisma.post.findMany({
        where: { authorId: profileUser.id },
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true, username: true } },
          categories: { include: { category: true } },
        },
      })
    : profileUser.posts

  const joinedDate = new Date(profileUser.createdAt).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-12 pb-12 border-b border-border">
        {profileUser.avatar ? (
          <Image
            src={profileUser.avatar}
            alt={profileUser.name || profileUser.username}
            width={80}
            height={80}
            className="rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-overlay flex items-center justify-center text-2xl text-text-muted font-light flex-shrink-0">
            {(profileUser.name || profileUser.username)[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-light text-text-primary">
            {profileUser.name || profileUser.username}
          </h1>
          <p className="text-text-muted text-sm mt-1">@{profileUser.username}</p>
          {profileUser.bio && (
            <p className="text-text-muted mt-3 max-w-prose">{profileUser.bio}</p>
          )}
          <p className="text-text-faint text-xs mt-3">Miembro desde {joinedDate}</p>
        </div>
        {isOwner && (
          <Link
            href="/perfil/editar"
            className="border border-border text-text-muted text-sm px-4 py-2 hover:border-accent hover:text-accent transition-colors"
          >
            Editar perfil
          </Link>
        )}
      </div>

      {/* Posts */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-px bg-accent" />
          <span className="text-accent text-xs font-medium tracking-widest uppercase">
            {isOwner ? 'Mis entradas' : 'Entradas'}
          </span>
        </div>

        {allPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.map((post) => (
              <div key={post.id} className="relative">
                <PostCard post={post} />
                {isOwner && !post.published && (
                  <div className="absolute top-3 right-3 bg-overlay border border-border px-2 py-0.5 text-xs text-text-faint">
                    Borrador
                  </div>
                )}
                {isOwner && (
                  <PostActions
                    slug={post.slug}
                    redirectTo={`/profile/${params.username}`}
                    className="mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-faint">
            <p>{isOwner ? 'Todavía no publicaste nada.' : 'Este usuario no tiene entradas publicadas.'}</p>
            {isOwner && (
              <Link
                href="/nueva-entrada"
                className="inline-block mt-4 text-accent hover:text-accent-hover text-sm transition-colors"
              >
                Escribir primera entrada →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
