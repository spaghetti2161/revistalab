'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import SubscribeModal from './SubscribeModal'

type Category = { id: string; name: string; slug: string; parentId: string | null }

export default function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (showSearch) searchRef.current?.focus()
  }, [showSearch])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const parentCategories = categories.filter((c) => !c.parentId)
  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId)

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-50 bg-base border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-4">
            {/* LEFT: Navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {parentCategories.map((cat) => {
                const children = getChildren(cat.id)
                return (
                  <div key={cat.id} className="relative">
                    {children.length > 0 ? (
                      <button
                        onClick={() => setOpenDropdown(openDropdown === cat.id ? null : cat.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                          openDropdown === cat.id
                            ? 'text-accent'
                            : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {cat.name}
                        <svg className={`w-3 h-3 transition-transform ${openDropdown === cat.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        href={`/category/${cat.slug}`}
                        className="px-3 py-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
                      >
                        {cat.name}
                      </Link>
                    )}

                    {/* Dropdown */}
                    {children.length > 0 && openDropdown === cat.id && (
                      <div className="absolute top-full left-0 mt-1 bg-elevated border border-border shadow-lg min-w-36 py-1 z-50">
                        <Link
                          href={`/category/${cat.slug}`}
                          onClick={() => setOpenDropdown(null)}
                          className="block px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-overlay transition-colors"
                        >
                          Todos en {cat.name}
                        </Link>
                        <div className="border-t border-border my-1" />
                        {children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/category/${child.slug}`}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-overlay transition-colors"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* CENTER: Logo */}
            <Link
              href="/"
              className="flex-shrink-0 text-center font-light tracking-widest uppercase text-sm text-text-primary hover:text-accent transition-colors md:absolute md:left-1/2 md:-translate-x-1/2"
            >
              <span className="text-accent font-medium">Revista</span>{' '}
              <span>Laboratorio</span>
            </Link>

            {/* RIGHT: actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Search */}
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="bg-elevated border border-border px-3 py-1.5 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-accent w-48 transition-colors"
                    onBlur={() => { if (!searchQuery) setShowSearch(false) }}
                  />
                  <button type="submit" className="hidden" />
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Buscar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {/* Subscribe button */}
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 border border-accent text-accent px-3 py-1.5 text-xs font-medium tracking-wider uppercase hover:bg-accent hover:text-base transition-colors"
              >
                Suscribirse
              </button>

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-7 h-7 rounded-full bg-overlay border border-border flex items-center justify-center text-xs text-text-muted hover:border-accent hover:text-accent transition-colors"
                  >
                    {(user.name || user.username)[0].toUpperCase()}
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-elevated border border-border shadow-lg py-1 min-w-44 z-50">
                      <div className="px-4 py-2 text-xs text-text-faint border-b border-border">
                        @{user.username}
                      </div>
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-overlay transition-colors"
                      >
                        Mi perfil
                      </Link>
                      <Link
                        href="/nueva-entrada"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-overlay transition-colors"
                      >
                        Nueva entrada
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-overlay transition-colors"
                        >
                          Administración
                        </Link>
                      )}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-red-400 hover:bg-overlay transition-colors"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-xs text-text-muted hover:text-text-primary transition-colors hidden sm:block"
                >
                  Ingresar
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-3 space-y-1">
              {parentCategories.map((cat) => (
                <div key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-2 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                  {getChildren(cat.id).map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-6 py-1.5 text-sm text-text-faint hover:text-text-muted transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="pt-2 border-t border-border flex flex-col gap-2 px-2">
                <button
                  onClick={() => { setShowSubscribeModal(true); setMobileMenuOpen(false) }}
                  className="w-full border border-accent text-accent px-4 py-2 text-xs font-medium tracking-wider uppercase"
                >
                  Suscribirse
                </button>
                {!user && (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-text-muted text-center">
                    Ingresar
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <SubscribeModal open={showSubscribeModal} onClose={() => setShowSubscribeModal(false)} />
    </>
  )
}
