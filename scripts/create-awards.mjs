// scripts/create-awards.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const prisma = new PrismaClient()

async function createAwards() {
  try {
    console.log('🏆 Creating calculated award templates for all seasons...')

    // Read award templates
    const dataPath = path.join(__dirname, '..', 'data', 'awards.json')
    if (!fs.existsSync(dataPath)) {
      console.log("❌ Awards JSON file not found at:", dataPath)
      console.log("📝 Create the file data/awards.json first")
      return
    }

    const awardsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

    // Get all seasons from league members
    const seasons = await prisma.season.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'asc' }
    })

    console.log(`\n📋 Found ${awardsData.awards.length} calculated award types`)
    console.log(`📅 Found ${seasons.length} seasons: ${seasons.map(s => s.year).join(', ')}`)

    let totalCreated = 0

    // Create each award type for each season
    for (const season of seasons) {
      console.log(`\n📅 Creating calculated awards for ${season.year}...`)

      for (const awardTemplate of awardsData.awards) {
        try {
          const award = await prisma.award.upsert({
            where: {
              name_season: {
                name: awardTemplate.name,
                season: season.year
              }
            },
            update: {
              description: awardTemplate.description,
              icon: awardTemplate.icon
            },
            create: {
              name: awardTemplate.name,
              description: awardTemplate.description,
              icon: awardTemplate.icon,
              season: season.year
            }
          })

          console.log(`   ✅ ${award.icon} ${award.name}`)
          totalCreated++
        } catch (error) {
          console.log(`   ❌ Failed to create "${awardTemplate.name}": ${error.message}`)
        }
      }
    }

    console.log(`\n📊 Summary: Created ${totalCreated} calculated award templates`)
    console.log('\n📝 Next steps:')
    console.log('1. Run: node scripts/calculate-awards.mjs (assigns winners to calculated awards)')
    console.log('2. Create data/manual-awards.json and run: node scripts/assign-manual-awards.mjs (creates and assigns manual awards)')

  } catch (error) {
    console.error("❌ Error creating awards:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createAwards()