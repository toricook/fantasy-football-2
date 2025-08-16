// Load environment variables from .env file
import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
import SleeperAPI from 'sleeper-api-client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()
const sleeper = new SleeperAPI()

async function populateHistoricalMembers() {
  try {
    // Get your league from database
    const league = await prisma.league.findFirst()
    if (!league) {
      console.log("❌ No league found. Run setup-league.js first.")
      return
    }

    console.log(`📋 Populating members for league: ${league.name}`)

    // Read historical data from JSON file
    const dataPath = path.join(__dirname, '..', 'data', 'historical-members.json')
    
    if (!fs.existsSync(dataPath)) {
      console.log("❌ Historical members JSON file not found at:", dataPath)
      console.log("📝 Create the file data/historical-members.json first")
      return
    }

    const historicalData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

    // 1. Populate from Sleeper seasons
    if (historicalData.sleeperSeasons && historicalData.sleeperSeasons.length > 0) {
      console.log(`\n🏈 Processing ${historicalData.sleeperSeasons.length} Sleeper seasons...`)
      
      for (const season of historicalData.sleeperSeasons) {
        await populateFromSleeperLeague(
          league.id, 
          season.leagueId, 
          season.year,
          season.isCurrentSeason || false
        )
      }
    }

    // 2. Add manual historical seasons (new structure)
    if (historicalData.manualSeasons) {
      console.log(`\n📝 Processing manual seasons...`)
      for (const [year, seasonData] of Object.entries(historicalData.manualSeasons)) {
        await addManualSeason(league.id, year, seasonData)
      }
    }

    console.log("\n✅ Historical member population complete!")

    // Show summary
    const totalMembers = await prisma.leagueMember.count({
      where: { leagueId: league.id }
    })
    const totalSeasons = await prisma.season.count()
    
    console.log(`📊 Summary:`)
    console.log(`   👥 Total members: ${totalMembers}`)
    console.log(`   📅 Total seasons: ${totalSeasons}`)

  } catch (error) {
    console.error("❌ Error populating members:", error)
  } finally {
    await prisma.$disconnect()
  }
}


// Updated populateFromSleeperLeague function with proper division handling

async function populateFromSleeperLeague(leagueId, sleeperLeagueId, year, isCurrentSeason = false) {
  try {
    console.log(`\n📥 Fetching data for ${year} season (${sleeperLeagueId})...`)
    
    const [league, users, rosters, standings] = await Promise.all([
      sleeper.getLeague(sleeperLeagueId),
      sleeper.getUsersByLeague(sleeperLeagueId),
      sleeper.getRostersByLeague(sleeperLeagueId),
      sleeper.getLeagueStandings(sleeperLeagueId)
    ])

    console.log(`   Found ${users.length} users for ${year}`)

    // Extract division names from league metadata (where they're actually stored)
    const divisionNames = {};
    let hasDivisions = false;
    
    // Look for division_1, division_2, etc. in the league metadata
    if (league.metadata) {
      for (let i = 1; i <= 10; i++) { // Check up to 10 divisions
        const divisionKey = `division_${i}`;
        if (league.metadata[divisionKey]) {
          divisionNames[i] = league.metadata[divisionKey];
          hasDivisions = true;
        }
      }
    }
    
    // Also check if there's a divisions count in settings
    if (league.settings && league.settings.divisions) {
      console.log(`   📊 League has ${league.settings.divisions} divisions configured`);
    }

    if (hasDivisions) {
      console.log(`   🏆 Found divisions:`, divisionNames);
    } else {
      console.log(`   ⚠️  No divisions found in league settings`);
    }

    for (const user of users) {
      const roster = rosters.find(r => r.owner_id === user.user_id)
      const standing = standings.find(s => s.roster_id === roster?.roster_id)
      
      // Get division for this user's roster from standings
      let division = null;
      if (standing && standing.settings && standing.settings.division && hasDivisions) {
        const divisionNumber = standing.settings.division;
        division = divisionNames[divisionNumber] || `Division ${divisionNumber}`;
      }
      
      // Check if member already exists
      let member = await prisma.leagueMember.findFirst({
        where: {
          leagueId: leagueId,
          sleeperUserId: user.user_id
        }
      })

      if (member) {
        // Member exists, add this season to their record
        await prisma.season.upsert({
          where: {
            leagueMemberId_year: {
              leagueMemberId: member.id,
              year: year
            }
          },
          update: {
            sleeperLeagueId: sleeperLeagueId,
            teamName: user.metadata?.team_name || null,
            finalRank: standing?.rank || null,
            wins: standing?.settings.wins || null,
            losses: standing?.settings.losses || null,
            ties: standing?.settings.ties || null,
            totalPoints: standing?.settings.fpts_total || null,
            division: division, // Add real division info
          },
          create: {
            leagueMemberId: member.id,
            year: year,
            sleeperLeagueId: sleeperLeagueId,
            teamName: user.metadata?.team_name || null,
            finalRank: standing?.rank || null,
            wins: standing?.settings.wins || null,
            losses: standing?.settings.losses || null,
            ties: standing?.settings.ties || null,
            totalPoints: standing?.settings.fpts_total || null,
            division: division, // Add real division info
          }
        })
        
        // Update if this is current season
        if (isCurrentSeason) {
          await prisma.leagueMember.update({
            where: { id: member.id },
            data: { isCurrentlyActive: true }
          })
        }
        
        console.log(`   ✏️  Updated ${user.display_name || user.username} for ${year}${division ? ` (${division})` : ''}`)
      } else {
        // Create new member
        const systemUser = await prisma.user.findFirst({
          where: { role: 'COMMISSIONER' }
        })
        const createdBy = systemUser?.id || null

        member = await prisma.leagueMember.create({
          data: {
            leagueId: leagueId,
            displayName: user.display_name || user.username,
            sleeperUserId: user.user_id,
            source: 'SLEEPER',
            isCurrentlyActive: isCurrentSeason,
            seasons: {
              create: {
                year: year,
                sleeperLeagueId: sleeperLeagueId,
                teamName: user.metadata?.team_name || null,
                finalRank: standing?.rank || null,
                wins: standing?.settings.wins || null,
                losses: standing?.settings.losses || null,
                ties: standing?.settings.ties || null,
                totalPoints: standing?.settings.fpts_total || null,
                division: division, // Add real division info
              }
            }
          }
        })
        console.log(`   ➕ Added ${user.display_name || user.username} for ${year}${division ? ` (${division})` : ''}`)
      }
    }
  } catch (error) {
    console.error(`❌ Error fetching data for ${year}:`, error.message)
  }
}

async function addManualSeason(leagueId, year, seasonData) {
  console.log(`\n📝 Processing ${year} season: "${seasonData.leagueName}" with ${seasonData.teams.length} teams...`)
  
  if (seasonData.hasDivisions) {
    const divisions = [...new Set(seasonData.teams.map(t => t.division).filter(Boolean))]
    console.log(`   🏆 Divisions: ${divisions.join(', ')}`)
  }

  for (const teamData of seasonData.teams) {
    // Skip teams without owners filled in
    if (!teamData.owners || !Array.isArray(teamData.owners) || teamData.owners.length === 0) {
      console.log(`   ⏭️  Skipping ${teamData.teamName} - no owners specified`)
      continue
    }

    // Filter out empty owner names
    const validOwners = teamData.owners.filter(owner => owner && owner.trim() !== '')
    if (validOwners.length === 0) {
      console.log(`   ⏭️  Skipping ${teamData.teamName} - no valid owners specified`)
      continue
    }

    // Create a separate member record for each owner with the full season data
    for (const ownerName of validOwners) {
      const cleanOwnerName = ownerName.trim()
      
      // Check if member already exists for this owner
      let member = await prisma.leagueMember.findFirst({
        where: {
          leagueId: leagueId,
          displayName: cleanOwnerName
        }
      })

      if (member) {
        // Member exists, add this season to their record
        await prisma.season.upsert({
          where: {
            leagueMemberId_year: {
              leagueMemberId: member.id,
              year: year
            }
          },
          update: {
            teamName: teamData.teamName || null,
            finalRank: teamData.finalRank || null,
            wins: teamData.wins || null,
            losses: teamData.losses || null,
            ties: teamData.ties || null,
            totalPoints: teamData.pointsFor || null,
            division: teamData.division || null, // Add division from JSON
          },
          create: {
            leagueMemberId: member.id,
            year: year,
            teamName: teamData.teamName || null,
            finalRank: teamData.finalRank || null,
            wins: teamData.wins || null,
            losses: teamData.losses || null,
            ties: teamData.ties || null,
            totalPoints: teamData.pointsFor || null,
            division: teamData.division || null, // Add division from JSON
          }
        })
        console.log(`   ✏️  Updated ${cleanOwnerName} (${teamData.teamName}) for ${year}${teamData.division ? ` - ${teamData.division}` : ''}`)
      } else {
        // Create new member for this owner
        member = await prisma.leagueMember.create({
          data: {
            leagueId: leagueId,
            displayName: cleanOwnerName,
            source: 'MANUAL',
            isCurrentlyActive: false, // Manual entries are typically historical
            seasons: {
              create: {
                year: year,
                teamName: teamData.teamName || null,
                finalRank: teamData.finalRank || null,
                wins: teamData.wins || null,
                losses: teamData.losses || null,
                ties: teamData.ties || null,
                totalPoints: teamData.pointsFor || null,
                division: teamData.division || null, // Add division from JSON
              }
            }
          }
        })
        console.log(`   ➕ Added ${cleanOwnerName} (${teamData.teamName}) for ${year}${teamData.division ? ` - ${teamData.division}` : ''}`)
      }
    }
    
    // Log co-ownership info
    if (validOwners.length > 1) {
      console.log(`   👥 Co-owned team: ${teamData.teamName} by ${validOwners.join(', ')}`)
    }
  }
}

populateHistoricalMembers()