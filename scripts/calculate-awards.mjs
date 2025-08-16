// scripts/calculate-awards.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function calculateAwards() {
  try {
    console.log('🧮 Calculating awards from season data...')

    // Get all seasons
    const seasons = await prisma.season.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'asc' }
    })

    let totalAssigned = 0

    for (const seasonData of seasons) {
      const year = seasonData.year
      console.log(`\n📅 Calculating awards for ${year}...`)

      // Get all seasons for this year with member data
      const yearSeasons = await prisma.season.findMany({
        where: { year },
        include: {
          member: true
        }
      })

      if (yearSeasons.length === 0) {
        console.log(`   ⚠️  No season data found for ${year}`)
        continue
      }

      let seasonAssigned = 0

      // 1. Calculate League Champion (finalRank = 1)
      const champion = yearSeasons.find(s => s.finalRank === 1)
      if (champion) {
        await assignAward('League Champion', year, champion.member.id, champion.member.displayName)
        seasonAssigned++
      }

      // 2. Calculate Points Leader (highest totalPoints)
      const pointsLeader = yearSeasons
        .filter(s => s.totalPoints !== null)
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))[0]
      if (pointsLeader) {
        await assignAward('Points Leader', year, pointsLeader.member.id, pointsLeader.member.displayName)
        seasonAssigned++
      }

      // 3. Calculate Toilet Bowl Champion (finalRank = 12, or highest finalRank)
      const toiletBowlChamp = yearSeasons
        .filter(s => s.finalRank !== null)
        .sort((a, b) => (b.finalRank || 0) - (a.finalRank || 0))[0] // Highest (worst) rank
      if (toiletBowlChamp) {
        await assignAward('Toilet Bowl Champion', year, toiletBowlChamp.member.id, toiletBowlChamp.member.displayName)
        seasonAssigned++
      }

      console.log(`   ✅ Assigned ${seasonAssigned} calculated awards for ${year}`)
      totalAssigned += seasonAssigned
    }

    console.log(`\n📊 Summary: Assigned ${totalAssigned} calculated awards`)
    console.log('\n📝 Next: Create data/manual-awards.json for manual awards like Best Team Name')
    console.log('Then run: node scripts/assign-manual-awards.mjs')

  } catch (error) {
    console.error("❌ Error calculating awards:", error)
  } finally {
    await prisma.$disconnect()
  }
}

async function assignAward(awardName, season, memberId, memberName) {
  try {
    // Find the award
    const award = await prisma.award.findUnique({
      where: {
        name_season: {
          name: awardName,
          season: season
        }
      }
    })

    if (!award) {
      console.log(`   ⚠️  Award "${awardName}" not found for season ${season}`)
      return
    }

    // Assign the winner (now using memberId instead of userId)
    await prisma.award.update({
      where: { id: award.id },
      data: { winnerId: memberId }
    })

    console.log(`   🏆 ${award.icon} ${awardName} → ${memberName}`)

  } catch (error) {
    console.error(`   ❌ Failed to assign ${awardName}:`, error.message)
  }
}

calculateAwards()