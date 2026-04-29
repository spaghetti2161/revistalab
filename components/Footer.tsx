'use client'

import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="text-xs font-medium tracking-widest uppercase text-text-faint mb-4">Revista Laboratorio</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Un espacio para el pensamiento, la ciencia y la cultura.
            </p>
            <p className="text-text-faint text-xs mt-3">revistalaboratorio.com.ar</p>
          </div>
          <div>
            <h3 className="text-xs font-medium tracking-widest uppercase text-text-faint mb-4">Secciones</h3>
            <div className="space-y-2">
              <Link href="/todas-las-entradas" className="block text-sm text-text-muted hover:text-accent transition-colors">Todas las entradas</Link>
              <Link href="/category/ciencia" className="block text-sm text-text-muted hover:text-accent transition-colors">Ciencia</Link>
              <Link href="/category/tecnologia" className="block text-sm text-text-muted hover:text-accent transition-colors">Tecnología</Link>
              <Link href="/category/cultura" className="block text-sm text-text-muted hover:text-accent transition-colors">Cultura</Link>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium tracking-widest uppercase text-text-faint mb-4">Newsletter</h3>
            <p className="text-text-muted text-sm mb-3">Recibí cada nueva entrada en tu email.</p>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector<HTMLButtonElement>('[data-subscribe]')?.click()
              }}
              className="inline-flex items-center gap-1.5 border border-accent text-accent px-4 py-2 text-xs font-medium tracking-wider uppercase hover:bg-accent hover:text-base transition-colors"
            >
              Suscribirse →
            </Link>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-faint text-xs">© {year} Revista Laboratorio. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-text-faint hover:text-text-muted transition-colors">Ingresar</Link>
            <Link href="/admin" className="text-xs text-text-faint hover:text-text-muted transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
