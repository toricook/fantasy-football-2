import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      leagueId?: string
      role?: string
      claimedMemberId?: string | null
      claimedMemberName?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    leagueId?: string
    role?: string
    claimedMemberId?: string | null
    claimedMemberName?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    leagueId?: string
    role?: string
    claimedMemberId?: string | null
    claimedMemberName?: string | null
  }
}