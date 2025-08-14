import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
]

// Routes that require authentication
const protectedRoutes = [
  '/',
  '/news',
  '/members', 
  '/archive',
]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const session = await auth()
  
  if (!session?.user) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user has a league (is a league member)
  if (!session.user.leagueId) {
    // This shouldn't happen with our registration flow, but just in case
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated and is a league member - allow access
  return NextResponse.next()
}

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}