import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

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
            league: true
          }
        })

        if (!user) {
          return null
        }

        // Check password
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password || ""
        )

        if (!isValidPassword) {
          return null
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account has been deactivated")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.name,
          leagueId: user.leagueId,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.leagueId = user.leagueId
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.leagueId = token.leagueId as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  }
})