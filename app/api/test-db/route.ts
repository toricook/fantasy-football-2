import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Import Prisma inside the function to avoid build issues
    const { PrismaClient } = await import("@prisma/client")
    const prisma = new PrismaClient()
    
    console.log("Testing database connection...")
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 20))
    
    // Simple connection test
    await prisma.$connect()
    console.log("✅ Database connected successfully")
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Query executed successfully")
    
    // Test your specific table
    const leagueCount = await prisma.league.count()
    console.log(`✅ Found ${leagueCount} leagues`)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      status: "success",
      message: "Database connection working!",
      result,
      leagueCount
    })
    
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      details: {
        name: error instanceof Error ? error.name : "Unknown",
        code: (error as any)?.code,
        errno: (error as any)?.errno,
        stack: error instanceof Error ? error.stack : "No stack trace"
      }
    }, { status: 500 })
  }
}