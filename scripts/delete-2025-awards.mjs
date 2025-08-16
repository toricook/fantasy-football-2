import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function delete2025Awards() {
  try {
    console.log('🗑️ Deleting 2025 awards...')
    
    const deleted = await prisma.award.deleteMany({
      where: { season: '2025' }
    })
    
    console.log(`✅ Deleted ${deleted.count} awards for 2025 season`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

delete2025Awards()