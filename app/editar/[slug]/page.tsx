'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/AuthProvider'

const MarkdownEditor = dynamic(() => import('@/components/MarkdownEditor'), { ssr: false })

type Category = { id: string; name: string; slug: string; parentId: string | null }

export default function EditarEntradaPage() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    published: false,
    categoryIds: [] as string[],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${slug}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([post, cats]) => {
      if (post.error) { router.push('/'); return }
      setForm({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        coverImage: post.coverImage || '',
        published: post.published || false,
        categoryIds: post.categories?.map((c: { categoryId: string }) => c.categoryId) || [],
      })
      setCategories(cats)
    }).catch(() => router.push('/')).finally(() => setFetching(false))
  }, [slug, router])

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }))
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al subir imagen')
      } else if (data.url) {
        setForm((prev) => ({ ...prev, coverImage: data.url }))
      }
    } catch {
      setError('Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
      } else {
        router.push(`/blog/${data.slug}`)
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-text-muted">Cargando entrada...</p>
      </div>
    )
  }

  const parentCats = categories.filter((c) => !c.parentId)
  const childCats = (parentId: string) => categories.filter((c) => c.parentId === parentId)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-accent" />
          <span className="text-accent text-xs font-medium tracking-widest uppercase">Editar entrada</span>
        </div>
        <h1 className="text-2xl font-light text-text-primary">Editar entrada</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Título *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors text-lg"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1.5">Resumen / Bajada</label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1.5">Imagen de portada</label>
          <div className="flex gap-3">
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="flex-1 bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors"
            />
            <label className="cursor-pointer bg-overlay border border-border px-4 py-3 text-text-muted hover:border-accent hover:text-text-primary transition-colors text-sm whitespace-nowrap flex items-center">
              {uploading ? 'Subiendo...' : 'Subir imagen'}
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </div>
          {form.coverImage && (
            <img src={form.coverImage} alt="Preview" className="mt-2 h-32 object-cover rounded-sm" />
          )}
        </div>

        {parentCats.length > 0 && (
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Categorías</label>
            <div className="space-y-3">
              {parentCats.map((parent) => (
                <div key={parent.id}>
                  <label className="flex items-center gap-2 cursor-pointer mb-1.5">
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(parent.id)}
                      onChange={() => toggleCategory(parent.id)}
                      className="accent-accent"
                    />
                    <span className="text-text-primary text-sm font-medium">{parent.name}</span>
                  </label>
                  {childCats(parent.id).length > 0 && (
                    <div className="ml-6 flex flex-wrap gap-3">
                      {childCats(parent.id).map((child) => (
                        <label key={child.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.categoryIds.includes(child.id)}
                            onChange={() => toggleCategory(child.id)}
                            className="accent-accent"
                          />
                          <span className="text-text-muted text-sm">{child.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm text-text-muted mb-1.5">Contenido * (Markdown)</label>
          <MarkdownEditor
            value={form.content}
            onChange={(val) => setForm({ ...form, content: val || '' })}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="accent-accent w-4 h-4"
          />
          <label htmlFor="published" className="text-sm text-text-muted cursor-pointer">
            Publicar (visible para todos)
          </label>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-base px-8 py-3 font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/blog/${slug}`)}
            className="border border-border text-text-muted px-8 py-3 hover:border-text-muted transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
