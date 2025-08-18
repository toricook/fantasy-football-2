import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user with member links
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        memberLinks: {
          where: { status: 'APPROVED' },
          include: { member: true }
        }
      }
    })

    // Get session data
    const sessionData = {
      id: session.user.id,
      email: session.user.email,
      leagueId: session.user.leagueId,
      claimedMemberId: session.user.claimedMemberId,
      claimedMemberName: session.user.claimedMemberName
    }

    return NextResponse.json({
      sessionData,
      userFromDB: {
        id: user?.id,
        email: user?.email,
        memberLinks: user?.memberLinks.map(link => ({
          id: link.id,
          status: link.status,
          memberName: link.member.displayName,
          memberId: link.member.id
        }))
      }
    })

  } catch (error) {
    console.error("Debug user error:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}