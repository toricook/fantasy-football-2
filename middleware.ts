import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
  '/api/test-db',
  '/api/debug-members',
  '/api/debug-user',
]

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log(`🔍 MIDDLEWARE: ${pathname}`)
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log(`✅ MIDDLEWARE: Public route allowed: ${pathname}`)
    return NextResponse.next()
  }

  // Check for session token (basic auth check)
  const sessionToken = request.cookies.get('authjs.session-token')?.value || 
                      request.cookies.get('__Secure-authjs.session-token')?.value

  if (!sessionToken) {
    console.log(`❌ MIDDLEWARE: No session token, redirecting to login`)
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  console.log(`✅ MIDDLEWARE: Session token found, allowing access to ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}