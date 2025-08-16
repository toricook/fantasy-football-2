// update-coowner-divisions.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCoOwnerDivisions() {
  const sourceOwnerName = process.argv[2] // The owner whose season data to copy
  const targetOwnerName = process.argv[3] // The co-owner whose seasons to update
  const years = process.argv[4]?.split(',') || [] // Comma-separated years
  const confirm = process.argv[5]

  if (!sourceOwnerName || !targetOwnerName || years.length === 0) {
    console.log("❌ Please provide all required parameters")
    console.log("Usage: node update-coowner-divisions.mjs \"Source Owner\" \"Co-Owner\" \"year1,year2,year3\" --confirm")
    console.log("Example: node update-coowner-divisions.mjs \"Maya\" \"Jackson\" \"2023,2024\" --confirm")
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
        seasons: {
          where: {
            year: { in: years }
          }
        }
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
    console.log(`📅 Years to update: ${years.join(', ')}`)

    console.log(`\nSource seasons:`)
    sourceMember.seasons.forEach(season => {
      console.log(`  ${season.year}: ${season.teamName || 'No team name'} (${season.wins || 0}-${season.losses || 0}) Rank: ${season.finalRank || 'N/A'} Division: "${season.division}"`)
    })

    console.log(`\nTarget current seasons:`)
    targetMember.seasons.forEach(season => {
      console.log(`  ${season.year}: ${season.teamName || 'No team name'} (${season.wins || 0}-${season.losses || 0}) Rank: ${season.finalRank || 'N/A'} Division: "${season.division}"`)
    })

    if (confirm !== '--confirm') {
      console.log(`\n⚠️  Add --confirm to proceed`)
      console.log(`This will update "${targetOwnerName}"'s seasons with ALL data from "${sourceOwnerName}" including divisions`)
      return
    }

    // Update seasons
    let updatedCount = 0

    for (const sourceYear of years) {
      const sourceSeason = sourceMember.seasons.find(s => s.year === sourceYear)
      const targetSeason = targetMember.seasons.find(s => s.year === sourceYear)

      if (!sourceSeason) {
        console.log(`⚠️  Source doesn't have season ${sourceYear} - skipping`)
        continue
      }

      if (!targetSeason) {
        console.log(`⚠️  Target doesn't have season ${sourceYear} - skipping`)
        continue
      }

      // Update the target season with ALL source data including division
      await prisma.season.update({
        where: { id: targetSeason.id },
        data: {
          sleeperLeagueId: sourceSeason.sleeperLeagueId,
          teamName: sourceSeason.teamName,
          finalRank: sourceSeason.finalRank,
          wins: sourceSeason.wins,
          losses: sourceSeason.losses,
          ties: sourceSeason.ties,
          totalPoints: sourceSeason.totalPoints,
          division: sourceSeason.division, // ← This is the key addition
        }
      })

      console.log(`✅ Updated ${sourceYear}: ${sourceSeason.teamName || 'No team name'} (${sourceSeason.wins || 0}-${sourceSeason.losses || 0}) Division: "${sourceSeason.division}"`)
      updatedCount++
    }

    // Update target member to be active if they weren't before
    if (!targetMember.isCurrentlyActive && years.includes('2025')) {
      await prisma.leagueMember.update({
        where: { id: targetMember.id },
        data: { isCurrentlyActive: true }
      })
      console.log(`✅ Marked ${targetOwnerName} as currently active`)
    }

    console.log(`\n🎉 Co-owner division update complete!`)
    console.log(`📊 Summary: Updated ${updatedCount} seasons with division data`)

  } catch (error) {
    console.error("❌ Error updating co-owner divisions:", error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCoOwnerDivisions()