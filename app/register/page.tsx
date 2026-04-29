'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const { setUser } = useAuth()

  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [form, setForm] = useState({ name: '', username: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }
    fetch(`/api/invite?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        setTokenValid(data.valid)
        if (data.email) setInviteEmail(data.email)
      })
      .catch(() => setTokenValid(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!/^[a-z0-9_-]+$/.test(form.username)) {
      setError('El nombre de usuario solo puede contener letras minúsculas, números, - y _')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: inviteEmail, token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
      } else {
        setUser(data.user)
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-text-muted">Verificando invitación...</p>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-light text-text-primary mb-4">Invitación inválida</h1>
          <p className="text-text-muted">Este enlace de invitación no es válido o ya fue usado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-accent" />
            <span className="text-accent text-xs font-medium tracking-widest uppercase">Registro</span>
          </div>
          <h1 className="text-2xl font-light text-text-primary">Crear cuenta</h1>
          {inviteEmail && (
            <p className="text-text-muted text-sm mt-2">Registrando: <span className="text-text-primary">{inviteEmail}</span></p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Nombre completo</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Nombre de usuario</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
              className="w-full bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors"
              placeholder="usuario123"
              pattern="[a-z0-9_-]+"
            />
            <p className="text-xs text-text-faint mt-1">Solo minúsculas, números, guión y guión bajo</p>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Confirmar contraseña</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full bg-elevated border border-border px-4 py-3 text-text-primary placeholder-text-faint focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-base py-3 font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><p className="text-text-muted">Cargando...</p></div>}>
      <RegisterForm />
    </Suspense>
  )
}
