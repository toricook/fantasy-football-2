// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' })

// Load environment variables from .env file
require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupLeague() {
  try {
    // Replace these with your actual values
    const leagueData = {
      code: "DEMO-2025-TEST", // Change this to whatever you want
      name: "Demo Fantasy League",
      currentSleeperLeagueId: process.env.LEAGUE_ID || "your_current_league_id",
      historicalSleeperLeagueIds: [
        process.env.LAST_SEASON_LEAGUE_ID || "your_previous_league_id"
      ],
      commissionerUserIds: [], // We'll add this later when commissioner creates account
      allowNewRegistrations: true,
      requireCommissionerApproval: false,
    }

    const league = await prisma.league.create({
      data: leagueData
    })

    console.log("✅ League created successfully!")
    console.log("📝 League Code:", league.code)
    console.log("🆔 League ID:", league.id)
    console.log("📋 Use this code to register: " + league.code)

  } catch (error) {
    console.error("❌ Error creating league:", error)
  } finally {
    await prisma.$disconnect()
  }
}

setupLeague()