import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      leagueId?: string
      role?: string
    } & DefaultSession["user"]
  }

  interface User {
    leagueId?: string
    role?: string
  }
}