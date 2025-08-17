// scripts/debug-login.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function debugLogin() {
  try {
    // Get all users to see what we have
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        password: true,
        isActive: true,
        role: true
      }
    })

    if (users.length === 0) {
      console.log("❌ No users found in database")
      return
    }

    console.log(`👥 Found ${users.length} user(s):\n`)

    users.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.displayName || user.email}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🔑 Has password: ${user.password ? 'Yes' : 'No'}`)
      console.log(`   🔒 Password starts with: ${user.password ? user.password.substring(0, 10) + '...' : 'N/A'}`)
      console.log(`   ✅ Active: ${user.isActive}`)
      console.log(`   👑 Role: ${user.role}`)
      console.log('')
    })

    // Test password hashing
    console.log("🧪 Testing password hashing...")
    const testPassword = "test123"
    const hashedTest = await bcrypt.hash(testPassword, 12)
    const isValidTest = await bcrypt.compare(testPassword, hashedTest)
    
    console.log(`   📝 Test password: "${testPassword}"`)
    console.log(`   🔒 Hashed version: ${hashedTest.substring(0, 20)}...`)
    console.log(`   ✅ Hash verification: ${isValidTest ? 'Working' : 'BROKEN'}`)

    // Prompt for manual password test
    console.log("\n🔍 To test your specific password:")
    console.log("1. Edit this script")
    console.log("2. Replace YOUR_EMAIL and YOUR_PASSWORD below")
    console.log("3. Run the script again\n")

    // TODO: Replace these with your actual credentials
    const YOUR_EMAIL = "torigcook@gmail.com"  // ⚠️ CHANGE THIS
    const YOUR_PASSWORD = "Pipes@6980md"  // ⚠️ CHANGE THIS

    if (YOUR_EMAIL !== "your-email@example.com" && YOUR_PASSWORD !== "your-actual-password") {
      console.log("🔍 Testing your credentials...")
      
      const user = await prisma.user.findUnique({
        where: { email: YOUR_EMAIL }
      })

      if (!user) {
        console.log(`❌ No user found with email: ${YOUR_EMAIL}`)
      } else {
        console.log(`✅ User found: ${user.displayName}`)
        
        if (!user.password) {
          console.log("❌ User has no password set!")
        } else {
          const isValid = await bcrypt.compare(YOUR_PASSWORD, user.password)
          console.log(`🔑 Password check: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
          
          if (!isValid) {
            console.log("🔧 This suggests the password was hashed incorrectly during registration")
          }
        }
      }
    }

  } catch (error) {
    console.error("❌ Error debugging login:", error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin()