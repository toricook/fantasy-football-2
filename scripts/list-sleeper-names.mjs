import 'dotenv/config'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listSleeperNames() {
  try {
    const sleeperMembers = await prisma.leagueMember.findMany({
      where: {
        source: 'SLEEPER'
      },
      include: {
        seasons: {
          orderBy: { year: 'asc' }
        }
      },
      orderBy: { displayName: 'asc' }
    })

    console.log(`📋 Found ${sleeperMembers.length} Sleeper members:\n`)

    sleeperMembers.forEach(member => {
      const seasons = member.seasons.map(s => s.year).join(', ')
      console.log(`"${member.displayName}": "REAL_NAME_HERE", // Seasons: ${seasons}`)
    })

    console.log(`\n📝 Copy the above into your sleeper-name-mapping.json file`)
    console.log(`🔧 Replace "REAL_NAME_HERE" with actual names`)

  } catch (error) {
    console.error("❌ Error listing names:", error)
  } finally {
    await prisma.$disconnect()
  }
}

listSleeperNames()