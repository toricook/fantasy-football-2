// scripts/debug-division-values.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugDivisionValues() {
  try {
    console.log('🔍 Debugging division values...\n')

    // Get 2024 season data (which should have divisions)
    const seasons2024 = await prisma.season.findMany({
      where: {
        year: '2024'
      },
      include: {
        member: {
          select: {
            displayName: true
          }
        }
      },
      orderBy: { finalRank: 'asc' }
    })

    console.log('📅 2024 Season Division Values:')
    seasons2024.forEach((season, index) => {
      console.log(`${index + 1}. ${season.member.displayName}:`)
      console.log(`   Division: "${season.division}" (type: ${typeof season.division})`)
      console.log(`   Is null: ${season.division === null}`)
      console.log(`   Is empty string: ${season.division === ''}`)
      console.log(`   Is undefined: ${season.division === undefined}`)
      console.log('')
    })

    // Check what the archive logic would see
    console.log('🔍 Archive Logic Test:')
    const hasDivisions = seasons2024.some(team => team.division !== null)
    console.log(`hasDivisions check: ${hasDivisions}`)
    
    if (hasDivisions) {
      const divisions = {}
      seasons2024.forEach(team => {
        const divisionName = team.division || 'Unknown'
        console.log(`${team.member.displayName} → Division: "${divisionName}"`)
        if (!divisions[divisionName]) {
          divisions[divisionName] = []
        }
        divisions[divisionName].push(team)
      })
      
      console.log('\nDivision groups created:')
      Object.keys(divisions).forEach(divisionName => {
        console.log(`  "${divisionName}": ${divisions[divisionName].length} teams`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugDivisionValues()