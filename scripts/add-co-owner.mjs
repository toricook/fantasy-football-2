// Load environment variables from .env file
import 'dotenv/config'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addCoOwner() {
  const sourceOwnerName = process.argv[2] // The owner whose seasons to copy
  const targetOwnerName = process.argv[3] // The co-owner to add seasons to
  const years = process.argv[4]?.split(',') || [] // Comma-separated years
  const confirm = process.argv[5]

  if (!sourceOwnerName || !targetOwnerName || years.length === 0) {
    console.log("❌ Please provide all required parameters")
    console.log("Usage: node scripts/add-co-owner.mjs \"Source Owner\" \"Co-Owner\" \"year1,year2,year3\" --confirm")
    console.log("Example: node scripts/add-co-owner.mjs \"Rowan\" \"Devan\" \"2023,2024,2025\" --confirm")
    return
  }

  try {
    // Find both members
    const sourceMember = await prisma.leagueMember.findFirst({
      where: {
        displayName: sourceOwnerName
      },
      include: {
        seasons: {
          where: {
            year: { in: years }
          }
        }
      }
    })

    const targetMember = await prisma.leagueMember.findFirst({
      where: {
        displayName: targetOwnerName
      },
      include: {
        seasons: true
      }
    })

    if (!sourceMember) {
      console.log(`❌ Source member "${sourceOwnerName}" not found`)
      return
    }

    if (!targetMember) {
      console.log(`❌ Target member "${targetOwnerName}" not found`)
      return
    }

    console.log(`🔍 Found source member: ${sourceMember.displayName}`)
    console.log(`🔍 Found target member: ${targetMember.displayName}`)
    console.log(`📅 Years to copy: ${years.join(', ')}`)
    console.log(`📊 Source has ${sourceMember.seasons.length} matching seasons`)

    if (sourceMember.seasons.length === 0) {
      console.log(`❌ Source member has no seasons for the specified years`)
      return
    }

    console.log(`\nSeasons to copy:`)
    sourceMember.seasons.forEach(season => {
      console.log(`  ${season.year}: ${season.teamName || 'No team name'} (${season.wins || 0}-${season.losses || 0}) Rank: ${season.finalRank || 'N/A'}`)
    })

    // Check if target already has any of these seasons
    const existingSeasons = targetMember.seasons.filter(s => years.includes(s.year))
    if (existingSeasons.length > 0) {
      console.log(`\n⚠️  Target member already has seasons for:`)
      existingSeasons.forEach(season => {
        console.log(`  ${season.year}: ${season.teamName || 'No team name'}`)
      })
    }

    if (confirm !== '--confirm') {
      console.log(`\n⚠️  Add --confirm to proceed`)
      console.log(`This will copy the seasons to "${targetOwnerName}" as a co-owner`)
      return
    }

    // Copy seasons
    let copiedCount = 0
    let skippedCount = 0

    for (const season of sourceMember.seasons) {
      // Check if target already has this season
      const existingSeason = await prisma.season.findFirst({
        where: {
          leagueMemberId: targetMember.id,
          year: season.year
        }
      })

      if (existingSeason) {
        console.log(`⏭️  Skipping ${season.year} - target already has this season`)
        skippedCount++
        continue
      }

      // Create new season for target member
      await prisma.season.create({
        data: {
          leagueMemberId: targetMember.id,
          year: season.year,
          sleeperLeagueId: season.sleeperLeagueId,
          teamName: season.teamName,
          finalRank: season.finalRank,
          wins: season.wins,
          losses: season.losses,
          ties: season.ties,
          totalPoints: season.totalPoints,
        }
      })

      console.log(`✅ Copied ${season.year}: ${season.teamName || 'No team name'}`)
      copiedCount++
    }

    // Update target member to be active if they weren't before
    if (!targetMember.isCurrentlyActive && years.includes('2025')) {
      await prisma.leagueMember.update({
        where: { id: targetMember.id },
        data: { isCurrentlyActive: true }
      })
      console.log(`✅ Marked ${targetOwnerName} as currently active`)
    }

    console.log(`\n🎉 Co-owner setup complete!`)
    console.log(`📊 Summary:`)
    console.log(`   ✅ Seasons copied: ${copiedCount}`)
    console.log(`   ⏭️  Seasons skipped: ${skippedCount}`)

  } catch (error) {
    console.error("❌ Error adding co-owner:", error)
  } finally {
    await prisma.$disconnect()
  }
}

addCoOwner()