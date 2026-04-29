'use client'

import { useState, useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
}

export default function SubscribeModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStatus('idle')
        setEmail('')
        setMessage('')
      }, 300)
    }
  }, [open])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || '¡Suscripción exitosa!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Error al suscribirse')
      }
    } catch {
      setStatus('error')
      setMessage('Error de conexión')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-elevated border border-border max-w-md w-full p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-faint hover:text-text-muted transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-6 h-px bg-accent" />
            <span className="text-accent text-xs font-medium tracking-widest uppercase">Newsletter</span>
          </div>
          <h2 className="text-xl font-light text-text-primary">Suscribirse</h2>
          <p className="text-text-muted text-sm mt-2">
            Recibí cada nueva entrada de Revista Laboratorio directamente en tu email.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="text-accent text-2xl mb-3">✓</div>
            <p className="text-text-primary font-medium">{message}</p>
            <p className="text-text-muted text-sm mt-1">Te avisaremos cuando haya novedades.</p>
            <button
              onClick={onClose}
              className="mt-6 border border-border text-text-muted px-6 py-2 text-sm hover:border-accent hover:text-accent transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex gap-0">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 bg-base border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors text-sm"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-accent text-base px-5 py-3 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {status === 'loading' ? '...' : 'Suscribirme'}
              </button>
            </div>
            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2">{message}</p>
            )}
            <p className="text-text-faint text-xs mt-3">
              Sin spam. Podés cancelar cuando quieras.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
