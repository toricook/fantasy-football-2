// scripts/update-2025-team-names.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import SleeperAPI from 'sleeper-api-client'

const prisma = new PrismaClient()
const sleeper = new SleeperAPI()

async function update2025TeamNames() {
  try {
    console.log('🔄 Updating 2025 team names from Sleeper...')
    
    const currentLeagueId = process.env.LEAGUE_ID
    if (!currentLeagueId) {
      console.log('❌ LEAGUE_ID not found in environment')
      return
    }

    // Get current Sleeper data
    const [users, rosters] = await Promise.all([
      sleeper.getUsersByLeague(currentLeagueId),
      sleeper.getRostersByLeague(currentLeagueId)
    ])

    console.log(`📥 Found ${users.length} users in Sleeper`)

    let updatedCount = 0

    for (const user of users) {
      // Find the corresponding member in our database
      const member = await prisma.leagueMember.findFirst({
        where: {
          sleeperUserId: user.user_id,
          isCurrentlyActive: true
        },
        include: {
          seasons: {
            where: { year: '2025' }
          }
        }
      })

      if (!member) {
        console.log(`⚠️  No member found for Sleeper user: ${user.display_name}`)
        continue
      }

      // Get team name from Sleeper
      const newTeamName = user.metadata?.team_name || null
      const currentTeamName = member.seasons[0]?.teamName || null

      // Only update if team name changed
      if (newTeamName !== currentTeamName) {
        await prisma.season.upsert({
          where: {
            leagueMemberId_year: {
              leagueMemberId: member.id,
              year: '2025'
            }
          },
          update: {
            teamName: newTeamName
          },
          create: {
            leagueMemberId: member.id,
            year: '2025',
            sleeperLeagueId: currentLeagueId,
            teamName: newTeamName
          }
        })

        console.log(`✅ Updated ${member.displayName}: "${currentTeamName}" → "${newTeamName}"`)
        updatedCount++
      } else {
        console.log(`   ${member.displayName}: No change (${currentTeamName})`)
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} team names`)

  } catch (error) {
    console.error('❌ Error updating team names:', error)
  } finally {
    await prisma.$disconnect()
  }
}

update2025TeamNames()