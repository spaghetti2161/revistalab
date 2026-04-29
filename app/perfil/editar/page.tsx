'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function EditarPerfilPage() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: '', bio: '', avatar: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', bio: '', avatar: user.avatar || '' })
    }
  }, [user])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setForm((prev) => ({ ...prev, avatar: data.url }))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
      } else {
        setUser({ ...user!, name: data.name, avatar: data.avatar })
        setSuccess(true)
        setTimeout(() => router.push(`/profile/${user?.username}`), 1200)
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-text-muted">Debés iniciar sesión para editar tu perfil.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-px bg-accent" />
          <span className="text-accent text-xs font-medium tracking-widest uppercase">Perfil</span>
        </div>
        <h1 className="text-2xl font-light text-text-primary">Editar perfil</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-text-muted mb-1.5">Nombre para mostrar</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1.5">Biografía</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="Una breve descripción sobre vos"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1.5">Foto de perfil</label>
          <div className="flex items-center gap-3">
            {form.avatar && (
              <img src={form.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
            )}
            <div className="flex gap-3 flex-1">
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                className="flex-1 bg-elevated border border-border px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="https://..."
              />
              <label className="cursor-pointer bg-overlay border border-border px-3 py-2 text-text-muted text-sm hover:border-accent transition-colors flex items-center">
                {uploading ? '...' : 'Subir'}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">{error}</p>
        )}
        {success && (
          <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 px-4 py-3">✓ Perfil actualizado</p>
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
            onClick={() => router.push(`/profile/${user.username}`)}
            className="border border-border text-text-muted px-8 py-3 text-sm hover:border-text-muted transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
