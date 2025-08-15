import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { memberId } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Check if user already has an approved profile link
    const existingLink = await prisma.userMemberLink.findFirst({
      where: {
        userId: session.user.id,
        status: 'APPROVED'
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "You have already claimed a profile" },
        { status: 400 }
      );
    }

    // Check if the member exists and is in the same league
    const member = await prisma.leagueMember.findFirst({
      where: {
        id: memberId,
        leagueId: session.user.leagueId
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: "League member not found" },
        { status: 404 }
      );
    }

    // Check if member is already claimed by someone else
    const existingClaim = await prisma.userMemberLink.findFirst({
      where: {
        leagueMemberId: memberId,
        status: 'APPROVED'
      }
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "This profile has already been claimed" },
        { status: 400 }
      );
    }

    // Create the link - for now we'll auto-approve, but you could require commissioner approval
    const userMemberLink = await prisma.userMemberLink.create({
      data: {
        userId: session.user.id,
        leagueMemberId: memberId,
        linkedBy: session.user.id,
        approvedBy: session.user.id, // Auto-approve for now
        status: 'APPROVED'
      },
      include: {
        member: {
          include: {
            seasons: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Profile claimed successfully",
      link: userMemberLink
    });

  } catch (error) {
    console.error("Profile claim error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}