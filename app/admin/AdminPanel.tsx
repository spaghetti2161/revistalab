'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { JWTPayload } from '@/lib/auth'

type User = { id: string; email: string; username: string; name: string | null; role: string; createdAt: Date }
type Post = { id: string; title: string; slug: string; published: boolean; views: number; createdAt: Date; author: { username: string } }
type Subscriber = { id: string; email: string; createdAt: Date }
type Invitation = { id: string; email: string; token: string; used: boolean; createdAt: Date; createdBy: { username: string } }
type Category = { id: string; name: string; slug: string; parentId: string | null }

type Props = {
  initialData: { users: User[]; posts: Post[]; subscribers: Subscriber[]; invitations: Invitation[]; categories: Category[] }
  currentUser: JWTPayload
}

type Tab = 'posts' | 'users' | 'categories' | 'subscribers' | 'invitations'

export default function AdminPanel({ initialData, currentUser }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('posts')
  const [data, setData] = useState(initialData)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [newCat, setNewCat] = useState({ name: '', slug: '', parentId: '' })
  const [catLoading, setCatLoading] = useState(false)
  const [catMsg, setCatMsg] = useState('')

  async function sendInvite() {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    setInviteMsg('')
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      const d = await res.json()
      if (res.ok) {
        setInviteMsg(`✓ Invitación enviada a ${inviteEmail}`)
        setInviteEmail('')
        router.refresh()
      } else {
        setInviteMsg(`Error: ${d.error}`)
      }
    } catch {
      setInviteMsg('Error de conexión')
    } finally {
      setInviteLoading(false)
    }
  }

  async function togglePublish(slug: string, published: boolean) {
    await fetch(`/api/posts/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    })
    router.refresh()
  }

  async function deletePost(slug: string) {
    if (!confirm('¿Eliminar esta entrada definitivamente?')) return
    await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
    router.refresh()
  }

  async function createCategory() {
    if (!newCat.name || !newCat.slug) return
    setCatLoading(true)
    setCatMsg('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCat, parentId: newCat.parentId || null }),
      })
      const d = await res.json()
      if (res.ok) {
        setCatMsg('✓ Categoría creada')
        setNewCat({ name: '', slug: '', parentId: '' })
        router.refresh()
      } else {
        setCatMsg(`Error: ${d.error}`)
      }
    } catch {
      setCatMsg('Error de conexión')
    } finally {
      setCatLoading(false)
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'posts', label: 'Entradas', count: data.posts.length },
    { key: 'users', label: 'Usuarios', count: data.users.length },
    { key: 'categories', label: 'Categorías', count: data.categories.length },
    { key: 'subscribers', label: 'Suscriptores', count: data.subscribers.length },
    { key: 'invitations', label: 'Invitaciones', count: data.invitations.length },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-accent" />
          <span className="text-accent text-xs font-medium tracking-widest uppercase">Panel de administración</span>
        </div>
        <h1 className="text-2xl font-light text-text-primary">Administración</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-0 border-b border-border mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm border-b-2 transition-colors ${
              tab === t.key
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs text-text-faint">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {tab === 'posts' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-light text-text-primary">Todas las entradas</h2>
            <Link href="/nueva-entrada" className="bg-accent text-base px-4 py-2 text-sm font-medium hover:bg-accent-hover transition-colors">
              + Nueva entrada
            </Link>
          </div>
          <div className="space-y-2">
            {data.posts.map((post) => (
              <div key={post.id} className="bg-elevated border border-border px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/blog/${post.slug}`} className="text-text-primary hover:text-accent transition-colors truncate block">
                    {post.title}
                  </Link>
                  <p className="text-xs text-text-faint mt-0.5">
                    @{post.author.username} · {new Date(post.createdAt).toLocaleDateString('es-AR')} · {post.views} vistas
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 border ${post.published ? 'border-green-500/30 text-green-400' : 'border-border text-text-faint'}`}>
                    {post.published ? 'Publicado' : 'Borrador'}
                  </span>
                  <button onClick={() => togglePublish(post.slug, post.published)} className="text-xs text-text-muted hover:text-accent transition-colors">
                    {post.published ? 'Despublicar' : 'Publicar'}
                  </button>
                  <Link href={`/editar/${post.slug}`} className="text-xs text-text-muted hover:text-accent transition-colors">
                    Editar
                  </Link>
                  <button onClick={() => deletePost(post.slug)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          <h2 className="text-lg font-light text-text-primary mb-4">Usuarios registrados</h2>
          <div className="space-y-2">
            {data.users.map((u) => (
              <div key={u.id} className="bg-elevated border border-border px-4 py-3 flex items-center justify-between">
                <div>
                  <Link href={`/profile/${u.username}`} className="text-text-primary hover:text-accent transition-colors">
                    {u.name || u.username}
                  </Link>
                  <p className="text-xs text-text-faint mt-0.5">@{u.username} · {u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 border ${u.role === 'ADMIN' ? 'border-accent/40 text-accent' : 'border-border text-text-faint'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories tab */}
      {tab === 'categories' && (
        <div>
          <h2 className="text-lg font-light text-text-primary mb-4">Categorías</h2>

          {/* Add category */}
          <div className="bg-elevated border border-border p-4 mb-6">
            <h3 className="text-sm text-text-muted mb-3">Nueva categoría</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                placeholder="Nombre"
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                className="bg-base border border-border px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                placeholder="Slug (ej: ciencia)"
                value={newCat.slug}
                onChange={(e) => setNewCat({ ...newCat, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="bg-base border border-border px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
              <select
                value={newCat.parentId}
                onChange={(e) => setNewCat({ ...newCat, parentId: e.target.value })}
                className="bg-base border border-border px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
              >
                <option value="">Sin categoría padre</option>
                {data.categories.filter((c) => !c.parentId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={createCategory}
              disabled={catLoading}
              className="bg-accent text-base px-4 py-2 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {catLoading ? 'Creando...' : 'Crear categoría'}
            </button>
            {catMsg && <p className="text-sm text-text-muted mt-2">{catMsg}</p>}
          </div>

          <div className="space-y-2">
            {data.categories.filter((c) => !c.parentId).map((parent) => (
              <div key={parent.id}>
                <div className="bg-elevated border border-border px-4 py-3">
                  <span className="text-text-primary font-medium">{parent.name}</span>
                  <span className="text-text-faint text-xs ml-2">/{parent.slug}</span>
                </div>
                {data.categories.filter((c) => c.parentId === parent.id).map((child) => (
                  <div key={child.id} className="bg-elevated border border-border border-t-0 px-4 py-2 pl-8 flex items-center gap-2">
                    <span className="text-text-faint text-xs">└</span>
                    <span className="text-text-muted text-sm">{child.name}</span>
                    <span className="text-text-faint text-xs">/{child.slug}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribers tab */}
      {tab === 'subscribers' && (
        <div>
          <h2 className="text-lg font-light text-text-primary mb-4">
            Suscriptores ({data.subscribers.length})
          </h2>
          <div className="space-y-2">
            {data.subscribers.map((s) => (
              <div key={s.id} className="bg-elevated border border-border px-4 py-3 flex items-center justify-between">
                <span className="text-text-primary">{s.email}</span>
                <span className="text-xs text-text-faint">{new Date(s.createdAt).toLocaleDateString('es-AR')}</span>
              </div>
            ))}
            {data.subscribers.length === 0 && (
              <p className="text-text-faint text-sm">No hay suscriptores todavía.</p>
            )}
          </div>
        </div>
      )}

      {/* Invitations tab */}
      {tab === 'invitations' && (
        <div>
          <h2 className="text-lg font-light text-text-primary mb-4">Invitaciones</h2>

          <div className="bg-elevated border border-border p-4 mb-6">
            <h3 className="text-sm text-text-muted mb-3">Invitar a alguien</h3>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="email@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-base border border-border px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
              <button
                onClick={sendInvite}
                disabled={inviteLoading}
                className="bg-accent text-base px-4 py-2 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {inviteLoading ? 'Enviando...' : 'Enviar invitación'}
              </button>
            </div>
            {inviteMsg && <p className="text-sm text-text-muted mt-2">{inviteMsg}</p>}
          </div>

          <div className="space-y-2">
            {data.invitations.map((inv) => (
              <div key={inv.id} className="bg-elevated border border-border px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-text-primary text-sm">{inv.email}</span>
                  <p className="text-xs text-text-faint mt-0.5">
                    Por @{inv.createdBy.username} · {new Date(inv.createdAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 border ${inv.used ? 'border-green-500/30 text-green-400' : 'border-border text-text-faint'}`}>
                  {inv.used ? 'Usada' : 'Pendiente'}
                </span>
              </div>
            ))}
            {data.invitations.length === 0 && (
              <p className="text-text-faint text-sm">No hay invitaciones todavía.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
