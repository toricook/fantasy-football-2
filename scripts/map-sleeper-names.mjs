// Load environment variables from .env file
import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function mapSleeperNames() {
  try {
    // Read the mapping file
    const mappingPath = path.join(__dirname, '..', 'data', 'sleeper-name-mapping.json')
    
    if (!fs.existsSync(mappingPath)) {
      console.log("❌ Mapping file not found at:", mappingPath)
      console.log("📝 Create the file data/sleeper-name-mapping.json first")
      return
    }

    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))
    const nameMap = mappingData.sleeperDisplayNameToRealName

    console.log(`📝 Found ${Object.keys(nameMap).length} name mappings`)

    // Get all Sleeper members
    const sleeperMembers = await prisma.leagueMember.findMany({
      where: {
        source: 'SLEEPER'
      },
      include: {
        seasons: true
      }
    })

    console.log(`👥 Found ${sleeperMembers.length} Sleeper members`)

    let updatedCount = 0
    let mergedCount = 0

    for (const sleeperMember of sleeperMembers) {
      const sleeperDisplayName = sleeperMember.displayName
      const realName = nameMap[sleeperDisplayName]

      if (!realName) {
        console.log(`   ⏭️  No mapping found for: ${sleeperDisplayName}`)
        continue
      }

      console.log(`\n🔄 Processing: ${sleeperDisplayName} → ${realName}`)

      // Check if there's already a manual member with this real name
      const existingManualMember = await prisma.leagueMember.findFirst({
        where: {
          displayName: realName,
          source: 'MANUAL'
        },
        include: {
          seasons: true
        }
      })

      if (existingManualMember) {
        console.log(`   🤝 Found existing manual member "${realName}" - merging seasons`)
        
        // Move all seasons from Sleeper member to manual member
        const seasonsToMove = sleeperMember.seasons

        for (const season of seasonsToMove) {
          // Check if this season already exists for the manual member
          const existingSeason = await prisma.season.findFirst({
            where: {
              leagueMemberId: existingManualMember.id,
              year: season.year
            }
          })

          if (existingSeason) {
            console.log(`     ⚠️  Season ${season.year} already exists for ${realName} - updating with Sleeper data`)
            await prisma.season.update({
              where: { id: existingSeason.id },
              data: {
                sleeperLeagueId: season.sleeperLeagueId,
                teamName: season.teamName || existingSeason.teamName,
                finalRank: season.finalRank || existingSeason.finalRank,
                wins: season.wins || existingSeason.wins,
                losses: season.losses || existingSeason.losses,
                ties: season.ties || existingSeason.ties,
                totalPoints: season.totalPoints || existingSeason.totalPoints,
              }
            })
          } else {
            console.log(`     ➕ Moving season ${season.year} to ${realName}`)
            await prisma.season.update({
              where: { id: season.id },
              data: {
                leagueMemberId: existingManualMember.id
              }
            })
          }
        }

        // Update the manual member with Sleeper info
        await prisma.leagueMember.update({
          where: { id: existingManualMember.id },
          data: {
            sleeperUserId: sleeperMember.sleeperUserId,
            isCurrentlyActive: sleeperMember.isCurrentlyActive || existingManualMember.isCurrentlyActive
          }
        })

        // Delete the now-empty Sleeper member
        await prisma.leagueMember.delete({
          where: { id: sleeperMember.id }
        })

        mergedCount++
        console.log(`   ✅ Merged ${sleeperDisplayName} into existing ${realName}`)

      } else {
        // No existing manual member, just update the Sleeper member's name
        await prisma.leagueMember.update({
          where: { id: sleeperMember.id },
          data: {
            displayName: realName
          }
        })

        updatedCount++
        console.log(`   ✅ Updated ${sleeperDisplayName} → ${realName}`)
      }
    }

    console.log("\n🎉 Name mapping complete!")
    console.log(`📊 Summary:`)
    console.log(`   📝 Names updated: ${updatedCount}`)
    console.log(`   🤝 Members merged: ${mergedCount}`)
    console.log(`   🎯 Total processed: ${updatedCount + mergedCount}`)

    // Show unmapped names
    const unmappedMembers = await prisma.leagueMember.findMany({
      where: {
        source: 'SLEEPER',
        displayName: {
          notIn: Object.values(nameMap)
        }
      }
    })

    if (unmappedMembers.length > 0) {
      console.log(`\n⚠️  Unmapped Sleeper members remaining:`)
      unmappedMembers.forEach(member => {
        console.log(`   - ${member.displayName}`)
      })
    }

  } catch (error) {
    console.error("❌ Error mapping names:", error)
  } finally {
    await prisma.$disconnect()
  }
}

mapSleeperNames()