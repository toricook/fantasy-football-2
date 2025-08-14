/**
 * NextAuth.js API Route Handler
 * 
 * This file MUST be at /api/auth/[...nextauth]/route.ts - NextAuth.js requires this exact path.
 * The [...nextauth] catch-all route handles all auth endpoints like:
 * - POST /api/auth/signin, /api/auth/signout
 * - GET /api/auth/session, /api/auth/providers, etc.
 * 
 * NextAuth.js automatically routes to the correct handler based on the URL.
 */
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers