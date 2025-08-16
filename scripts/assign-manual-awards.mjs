// scripts/assign-manual-awards.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const prisma = new PrismaClient()

async function assignManualAwards() {
  try {
    console.log('🎖️ Creating and assigning manual awards...')

    // Read manual awards data
    const dataPath = path.join(__dirname, '..', 'data', 'manual-awards.json')
    if (!fs.existsSync(dataPath)) {
      console.log("❌ Manual awards JSON file not found at:", dataPath)
      console.log("📝 Create the file data/manual-awards.json first")
      return
    }

    const manualData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

    let totalCreated = 0
    let totalAssigned = 0
    let errors = 0

    // Process each season
    for (const [season, seasonAwards] of Object.entries(manualData.manualAwards)) {
      console.log(`\n📅 Processing ${season} manual awards...`)

      for (const [awardName, awardData] of Object.entries(seasonAwards)) {
        // Handle both single winner (string) and multiple winners (array)
        const winnerList = Array.isArray(awardData.winners) ? awardData.winners : [awardData.winners]

        // Create award records for each winner - all with the same name
        for (const winnerName of winnerList) {
          // Find the league member
          const member = await prisma.leagueMember.findFirst({
            where: { displayName: winnerName }
          })

          if (!member) {
            console.log(`   ⚠️  Member "${winnerName}" not found`)
            errors++
            continue
          }

          try {
            // Create the award record (same name for everyone)
            const award = await prisma.award.create({
              data: {
                name: awardName, // Keep original name, no numbers
                description: awardData.description,
                icon: awardData.icon,
                season: season,
                winnerId: member.id
              }
            })

            console.log(`   🏆 ${award.icon} ${awardName} → ${winnerName}`)
            totalCreated++
            totalAssigned++

          } catch (error) {
            console.log(`   ❌ Failed to create/assign "${awardName}" to ${winnerName}: ${error.message}`)
            errors++
          }
        }

        // Special handling for multiple winners display
        if (winnerList.length > 1) {
          console.log(`   📝 Note: "${awardName}" awarded to ${winnerList.length} people: ${winnerList.join(', ')}`)
        }
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Manual awards created: ${totalCreated}`)
    console.log(`   🏆 Winners assigned: ${totalAssigned}`)
    console.log(`   ❌ Errors: ${errors}`)

    // Show final award summary
    console.log('\n🏆 All Awards Summary:')
    const allAwards = await prisma.award.findMany({
      where: { winnerId: { not: null } },
      include: {
        winner: true
      },
      orderBy: [
        { season: 'desc' },
        { name: 'asc' }
      ]
    })

    const awardsBySeason = allAwards.reduce((acc, award) => {
      if (!acc[award.season]) {
        acc[award.season] = []
      }
      acc[award.season].push(award)
      return acc
    }, {})

    for (const [season, awards] of Object.entries(awardsBySeason)) {
      console.log(`\n${season}:`)
      
      // Group awards by name to show multiple winners together
      const groupedAwards = awards.reduce((acc, award) => {
        if (!acc[award.name]) {
          acc[award.name] = []
        }
        acc[award.name].push(award)
        return acc
      }, {})

      for (const [awardName, awardGroup] of Object.entries(groupedAwards)) {
        if (awardGroup.length === 1) {
          const award = awardGroup[0]
          const winnerName = award.winner?.displayName || 'No winner'
          console.log(`   ${award.icon} ${awardName}: ${winnerName}`)
        } else {
          const winners = awardGroup.map(award => 
            award.winner?.displayName || 'No winner'
          )
          console.log(`   ${awardGroup[0].icon} ${awardName}: ${winners.join(', ')} (${awardGroup.length} winners)`)
        }
      }
    }

    console.log('\n🎉 All manual awards created and assigned!')

  } catch (error) {
    console.error("❌ Error assigning manual awards:", error)
  } finally {
    await prisma.$disconnect()
  }
}

assignManualAwards()