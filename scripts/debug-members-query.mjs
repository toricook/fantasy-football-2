// scripts/debug-members-query.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugMembersQuery() {
  try {
    console.log("🔍 Debugging members page query...\n")

    // 1. Check ALL members
    console.log("=== ALL MEMBERS ===")
    const allMembers = await prisma.leagueMember.findMany({
      include: {
        seasons: {
          orderBy: { year: 'desc' }
        }
      },
      orderBy: { displayName: 'asc' }
    })

    console.log(`Found ${allMembers.length} total members:`)
    allMembers.forEach(member => {
      console.log(`  - ${member.displayName}`)
      console.log(`    🔸 Active: ${member.isCurrentlyActive}`)
      console.log(`    🔸 Source: ${member.source}`)
      console.log(`    🔸 Seasons: ${member.seasons.length}`)
      console.log(`    🔸 Latest season: ${member.seasons[0]?.year || 'None'}`)
      console.log('')
    })

    // 2. Check what the members page actually queries for
    console.log("\n=== MEMBERS PAGE QUERY (isCurrentlyActive: true) ===")
    const activeMembers = await prisma.leagueMember.findMany({
      where: { isCurrentlyActive: true },
      include: {
        seasons: {
          orderBy: { year: 'desc' }
        }
      },
      orderBy: { displayName: 'asc' }
    })

    console.log(`Found ${activeMembers.length} active members:`)
    activeMembers.forEach(member => {
      console.log(`  - ${member.displayName} (${member.seasons.length} seasons)`)
    })

    // 3. Check if any members have 2025 seasons (current season indicator)
    console.log("\n=== MEMBERS WITH 2025 SEASONS ===")
    const membersWithCurrentSeason = await prisma.leagueMember.findMany({
      where: {
        seasons: {
          some: {
            year: "2025"
          }
        }
      },
      include: {
        seasons: {
          where: { year: "2025" }
        }
      }
    })

    console.log(`Found ${membersWithCurrentSeason.length} members with 2025 seasons:`)
    membersWithCurrentSeason.forEach(member => {
      console.log(`  - ${member.displayName} (active: ${member.isCurrentlyActive})`)
    })

    // 4. Suggest fix if needed
    if (activeMembers.length === 0 && allMembers.length > 0) {
      console.log("\n🔧 SOLUTION:")
      console.log("Your members exist but none are marked as currently active.")
      console.log("Run this to fix:")
      console.log("UPDATE league_members SET is_currently_active = true WHERE source = 'SLEEPER' OR source = 'MANUAL';")
      
      console.log("\nOr run this script to auto-fix:")
      console.log("node scripts/fix-active-members.mjs")
    }

  } catch (error) {
    console.error("❌ Error debugging members:", error)
  } finally {
    await prisma.$disconnect()
  }
}

debugMembersQuery()