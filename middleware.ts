import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth',
  '/api/test-db',
  '/api/debug-members',
  '/api/debug-user',
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
  
  console.log(`🔍 MIDDLEWARE: ${pathname}`)
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log(`✅ MIDDLEWARE: Public route allowed: ${pathname}`)
    return NextResponse.next()
  }

  // Check if user is authenticated
  const session = await auth()
  console.log(`👤 MIDDLEWARE: Session check for ${pathname}:`, {
    hasUser: !!session?.user,
    userId: session?.user?.id,
    leagueId: session?.user?.leagueId,
    claimedMemberId: session?.user?.claimedMemberId,
    claimedMemberName: session?.user?.claimedMemberName
  })
  
  if (!session?.user) {
    console.log(`❌ MIDDLEWARE: No session, redirecting to login`)
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user has a league
  if (!session.user.leagueId) {
    console.log(`❌ MIDDLEWARE: No league, redirecting to login`)
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Allow auth-only routes
  if (authOnlyRoutes.some(route => pathname.startsWith(route))) {
    console.log(`✅ MIDDLEWARE: Auth-only route allowed: ${pathname}`)
    return NextResponse.next()
  }

  // For protected routes, check if user has claimed a profile
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const hasClaimedProfile = !!session.user.claimedMemberId
    console.log(`🔒 MIDDLEWARE: Protected route ${pathname}, hasClaimedProfile: ${hasClaimedProfile}`)
    
    if (!hasClaimedProfile) {
      console.log(`❌ MIDDLEWARE: No claimed profile, redirecting to claim-profile`)
      const claimUrl = new URL('/claim-profile', request.url)
      return NextResponse.redirect(claimUrl)
    }
  }

  console.log(`✅ MIDDLEWARE: Access granted to ${pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}