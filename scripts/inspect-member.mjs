// Load environment variables from .env file
import 'dotenv/config'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function inspectMember() {
  const memberName = process.argv[2] // Get name from command line

  if (!memberName) {
    console.log("❌ Please provide a member name")
    console.log("Usage: node scripts/inspect-member.mjs \"Real Name\"")
    return
  }

  try {
    console.log(`🔍 Searching for members with name containing: "${memberName}"\n`)

    // Find all members with similar names
    const members = await prisma.leagueMember.findMany({
      where: {
        displayName: {
          contains: memberName,
          mode: 'insensitive'
        }
      },
      include: {
        seasons: {
          orderBy: { year: 'desc' }
        }
      }
    })

    console.log(`📊 Found ${members.length} matching members:\n`)

    members.forEach((member, index) => {
      console.log(`${index + 1}. Member: "${member.displayName}"`)
      console.log(`   ID: ${member.id}`)
      console.log(`   Source: ${member.source}`)
      console.log(`   Active: ${member.isCurrentlyActive}`)
      console.log(`   Sleeper ID: ${member.sleeperUserId || 'None'}`)
      console.log(`   Seasons: ${member.seasons.length}`)
      
      if (member.seasons.length > 0) {
        member.seasons.forEach(season => {
          console.log(`     ${season.year}: ${season.teamName || 'No team name'} (${season.wins || 0}-${season.losses || 0})`)
        })
      } else {
        console.log(`     No seasons found`)
      }
      console.log('')
    })

    // Also search for any seasons with team names containing the member name
    console.log(`🔍 Searching for teams with names containing: "${memberName}"\n`)
    
    const seasonsWithSimilarTeamNames = await prisma.season.findMany({
      where: {
        teamName: {
          contains: memberName,
          mode: 'insensitive'
        }
      },
      include: {
        member: true
      },
      orderBy: { year: 'desc' }
    })

    if (seasonsWithSimilarTeamNames.length > 0) {
      console.log(`📅 Found ${seasonsWithSimilarTeamNames.length} seasons with similar team names:`)
      seasonsWithSimilarTeamNames.forEach(season => {
        console.log(`   ${season.year}: "${season.teamName}" owned by "${season.member.displayName}"`)
      })
    } else {
      console.log(`📅 No seasons found with team names containing "${memberName}"`)
    }

  } catch (error) {
    console.error("❌ Error inspecting member:", error)
  } finally {
    await prisma.$disconnect()
  }
}

inspectMember()