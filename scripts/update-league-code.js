// scripts/update-league-code.js
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateLeagueCode() {
  try {
    // Show current leagues
    const leagues = await prisma.league.findMany({
      select: {
        id: true,
        code: true,
        name: true
      }
    })

    if (leagues.length === 0) {
      console.log("❌ No leagues found in database")
      return
    }

    console.log("📋 Current leagues:")
    leagues.forEach((league, index) => {
      console.log(`${index + 1}. ${league.name} - Code: ${league.code}`)
    })

    // TODO: Replace this with your desired new code
    const NEW_LEAGUE_CODE = "BEARS-FF-2025"  // ⚠️ CHANGE THIS!


    // Check if new code already exists
    const existingLeague = await prisma.league.findUnique({
      where: { code: NEW_LEAGUE_CODE.toUpperCase() }
    })

    if (existingLeague) {
      console.log(`❌ League code "${NEW_LEAGUE_CODE}" already exists`)
      return
    }

    // Update the first league (or change this logic if you have multiple)
    const leagueToUpdate = leagues[0]
    
    const updatedLeague = await prisma.league.update({
      where: { id: leagueToUpdate.id },
      data: { code: NEW_LEAGUE_CODE.toUpperCase() }
    })

    console.log(`\n✅ League code updated successfully!`)
    console.log(`📝 Old Code: ${leagueToUpdate.code}`)
    console.log(`📝 New Code: ${updatedLeague.code}`)
    console.log(`\n🎯 Share this code with your league members: ${updatedLeague.code}`)

  } catch (error) {
    console.error("❌ Error updating league code:", error)
  } finally {
    await prisma.$disconnect()
  }
}

updateLeagueCode()