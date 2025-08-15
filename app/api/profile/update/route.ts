import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, birthdayMonth, birthdayDay, favoriteTeam, bio } = body;

    // Validate birthday if provided
    const hasMonth = birthdayMonth !== null && birthdayMonth !== undefined;
    const hasDay = birthdayDay !== null && birthdayDay !== undefined;
    
    if ((hasMonth && !hasDay) || (!hasMonth && hasDay)) {
      return NextResponse.json(
        { error: "Both birthday month and day must be provided together, or both left empty" },
        { status: 400 }
      );
    }

    if (hasMonth) {
      if (birthdayMonth < 1 || birthdayMonth > 12) {
        return NextResponse.json(
          { error: "Birthday month must be between 1 and 12" },
          { status: 400 }
        );
      }
    }

    if (hasDay) {
      if (birthdayDay < 1 || birthdayDay > 31) {
        return NextResponse.json(
          { error: "Birthday day must be between 1 and 31" },
          { status: 400 }
        );
      }
    }

    // Additional birthday validation
    if (hasMonth && hasDay) {
      // Check for valid days in specific months
      const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (birthdayDay > daysInMonth[birthdayMonth - 1]) {
        return NextResponse.json(
          { error: "Invalid day for the selected month" },
          { status: 400 }
        );
      }
    }

    // Validate bio length
    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: "Bio cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName || null,
        birthdayMonth: birthdayMonth,
        birthdayDay: birthdayDay,
        favoriteTeam: favoriteTeam || null,
        bio: bio || null,
      },
      select: {
        id: true,
        displayName: true,
        birthdayMonth: true,
        birthdayDay: true,
        favoriteTeam: true,
        bio: true,
      }
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}