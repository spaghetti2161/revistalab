import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production'
)

const protectedRoutes = ['/nueva-entrada', '/editar', '/admin']
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, request.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    const isAdmin = adminRoutes.some((r) => pathname.startsWith(r))
    if (isAdmin && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/nueva-entrada/:path*', '/editar/:path*', '/admin/:path*'],
}
