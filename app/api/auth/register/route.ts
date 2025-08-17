import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, leagueCode } = await request.json()

    // Validate required fields
    if (!email || !password || !leagueCode) {
      return NextResponse.json(
        { error: "Email, password, and league code are required" },
        { status: 400 }
      )
    }

    // Check if league code exists
    const league = await prisma.league.findUnique({
      where: { code: leagueCode.toUpperCase() }
    })

    if (!league) {
      return NextResponse.json(
        { error: "Invalid league code" },
        { status: 400 }
      )
    }

    // Check if league allows new registrations
    if (!league.allowNewRegistrations) {
      return NextResponse.json(
        { error: "This league is not accepting new registrations" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user without displayName - they'll get their name from claiming a profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email, // Temporary name, will be overridden when they claim a profile
        leagueId: league.id,
        isActive: true,
        role: "MEMBER",
      }
    })

    // Return success (don't send password or sensitive data)
    return NextResponse.json({
      message: "Account created successfully! Please claim your league profile after logging in.",
      user: {
        id: user.id,
        email: user.email,
        leagueId: user.leagueId,
      }
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}