// scripts/check-division-data.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDivisionData() {
  try {
    console.log('🔍 Checking division data in database...\n')

    // Get all seasons excluding 2025, with member data
    const seasons = await prisma.season.findMany({
      where: {
        year: { not: '2025' }
      },
      include: {
        member: {
          select: {
            displayName: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { finalRank: 'asc' }
      ]
    })

    console.log(`Found ${seasons.length} total seasons`)

    // Group by year and show division info
    const seasonsByYear = seasons.reduce((acc, season) => {
      if (!acc[season.year]) {
        acc[season.year] = []
      }
      acc[season.year].push(season)
      return acc
    }, {})

    Object.entries(seasonsByYear).forEach(([year, yearSeasons]) => {
      console.log(`\n📅 ${year} Season:`)
      console.log(`   Total teams: ${yearSeasons.length}`)
      
      const divisionsInYear = [...new Set(yearSeasons.map(s => s.division).filter(Boolean))]
      console.log(`   Divisions found: ${divisionsInYear.length > 0 ? divisionsInYear.join(', ') : 'None'}`)
      
      if (divisionsInYear.length > 0) {
        divisionsInYear.forEach(division => {
          const teamsInDivision = yearSeasons.filter(s => s.division === division)
          console.log(`     ${division}: ${teamsInDivision.length} teams`)
          teamsInDivision.forEach(team => {
            console.log(`       - ${team.member.displayName} (Rank ${team.finalRank || '?'})`)
          })
        })
      } else {
        console.log(`   Sample teams:`)
        yearSeasons.slice(0, 3).forEach(team => {
          console.log(`     - ${team.member.displayName} (Rank ${team.finalRank || '?'}) Division: ${team.division || 'NULL'}`)
        })
      }
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDivisionData()