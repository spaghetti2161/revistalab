import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminPanel from './AdminPanel'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/')

  const [users, posts, subscribers, invitations, categories] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, username: true, name: true, role: true, createdAt: true },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { username: true } } },
      select: {
        id: true, title: true, slug: true, published: true, views: true, createdAt: true,
        author: { select: { username: true } },
      },
    }),
    prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { username: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <AdminPanel
      initialData={{ users, posts, subscribers, invitations, categories }}
      currentUser={user}
    />
  )
}
