// scripts/debug-league-object.mjs
import 'dotenv/config'
import SleeperAPI from 'sleeper-api-client'

const sleeper = new SleeperAPI()

async function debugLeagueObject() {
  try {
    // Use your 2024 league ID that we know has divisions
    const leagueId = process.env.LAST_SEASON_LEAGUE_ID || "1124817707527573504"
    
    console.log(`🔍 Debugging league object for: ${leagueId}\n`)
    
    const league = await sleeper.getLeague(leagueId)
    
    console.log('📋 Full league object:')
    console.log(JSON.stringify(league, null, 2))
    
    console.log('\n🔍 Looking for division keys:')
    Object.keys(league).forEach(key => {
      if (key.toLowerCase().includes('div')) {
        console.log(`${key}: ${league[key]}`)
      }
    })
    
    console.log('\n🔍 All league object keys:')
    console.log(Object.keys(league))
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugLeagueObject()