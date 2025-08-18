import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          },
          include: {
            league: true,
            memberLinks: {
              where: { status: 'APPROVED' },
              include: { member: true }
            }
          }
        })

        if (!user) {
          return null
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password || ""
        )

        if (!isValidPassword) {
          return null
        }

        if (!user.isActive) {
          throw new Error("Account has been deactivated")
        }

        const claimedMember = user.memberLinks[0]?.member || null

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.name,
          leagueId: user.leagueId,
          role: user.role,
          claimedMemberId: claimedMember?.id || null,
          claimedMemberName: claimedMember?.displayName || null,
        } as any
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Only set user data on login - don't make database calls here
      // because this runs in Edge Runtime for middleware
      if (user) {
        token.leagueId = user.leagueId
        token.role = user.role
        token.claimedMemberId = user.claimedMemberId
        token.claimedMemberName = user.claimedMemberName
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.leagueId = token.leagueId as string
        session.user.role = token.role as string
        session.user.claimedMemberId = token.claimedMemberId as string
        session.user.claimedMemberName = token.claimedMemberName as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  },
  trustHost: true,
})