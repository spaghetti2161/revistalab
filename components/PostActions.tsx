'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface PostActionsProps {
  slug: string
  redirectTo?: string
  className?: string
}

export default function PostActions({ slug, redirectTo, className = '' }: PostActionsProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      router.push(redirectTo ?? '/')
      router.refresh()
    } catch {
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Link
        href={`/editar/${slug}`}
        className="text-xs text-text-faint hover:text-accent transition-colors"
      >
        Editar
      </Link>
      <span className="text-border text-xs">·</span>
      {confirming ? (
        <span className="flex items-center gap-2">
          <span className="text-xs text-red-400">¿Confirmar?</span>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-text-faint hover:text-text-muted transition-colors"
          >
            Cancelar
          </button>
        </span>
      ) : (
        <button
          onClick={handleDelete}
          className="text-xs text-text-faint hover:text-red-400 transition-colors"
        >
          Eliminar
        </button>
      )}
    </div>
  )
}
