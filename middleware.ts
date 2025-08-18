import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
  '/api/test-db',
  '/api/debug-user'
]

// Routes that require authentication but don't require a claimed profile
const authOnlyRoutes = [
  '/claim-profile',
  '/api/claim-profile',
]

// Routes that require both authentication AND a claimed profile
const protectedRoutes = [
  '/',
  '/news',
  '/members', 
  '/archive',
  '/profile',
  '/api/profile',
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

  // Allow auth-only routes (like claim-profile) without checking for claimed profile
  if (authOnlyRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For protected routes, check if user has claimed a profile using session data
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check if user has claimed a profile (stored in session)
    const hasClaimedProfile = !!session.user.claimedMemberId
    
    if (!hasClaimedProfile) {
      // User needs to claim a profile first
      const claimUrl = new URL('/claim-profile', request.url)
      return NextResponse.redirect(claimUrl)
    }
  }

  // User is authenticated and has claimed profile - allow access
  return NextResponse.next()
}

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}