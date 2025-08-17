// scripts/debug-auth-flow.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function debugAuthFlow() {
  try {
    // TODO: Replace with your credentials
    const YOUR_EMAIL = "torigcook@gmail.com"  // ⚠️ CHANGE THIS
    const YOUR_PASSWORD = "Pipes@6980md"        // ⚠️ CHANGE THIS

    if (YOUR_EMAIL === "your-email@example.com") {
      console.log("❌ Please edit this script with your actual email and password")
      return
    }

    console.log(`🔍 Testing full auth flow for: ${YOUR_EMAIL}\n`)

    // Step 1: Find user
    const user = await prisma.user.findUnique({
      where: { email: YOUR_EMAIL },
      include: {
        league: true,
        memberLinks: {
          where: { status: 'APPROVED' },
          include: { member: true }
        }
      }
    })

    if (!user) {
      console.log("❌ Step 1 FAILED: User not found")
      return
    }
    console.log("✅ Step 1 PASSED: User found")
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   👤 Display Name: ${user.displayName}`)
    console.log(`   🆔 User ID: ${user.id}`)

    // Step 2: Check if user is active
    if (!user.isActive) {
      console.log("❌ Step 2 FAILED: User is not active")
      return
    }
    console.log("✅ Step 2 PASSED: User is active")

    // Step 3: Check password
    if (!user.password) {
      console.log("❌ Step 3 FAILED: User has no password set")
      return
    }

    const isValidPassword = await bcrypt.compare(YOUR_PASSWORD, user.password)
    if (!isValidPassword) {
      console.log("❌ Step 3 FAILED: Password is invalid")
      console.log(`   🔑 You entered: "${YOUR_PASSWORD}"`)
      console.log(`   🔒 Hash in DB: ${user.password.substring(0, 20)}...`)
      return
    }
    console.log("✅ Step 3 PASSED: Password is valid")

    // Step 4: Check league
    if (!user.leagueId) {
      console.log("❌ Step 4 FAILED: User has no league")
      return
    }
    console.log("✅ Step 4 PASSED: User has league")
    console.log(`   🏈 League: ${user.league?.name}`)
    console.log(`   📝 League Code: ${user.league?.code}`)

    // Step 5: Check member links (profile claiming)
    const claimedMember = user.memberLinks[0]?.member || null
    console.log("✅ Step 5: Profile claiming status")
    if (claimedMember) {
      console.log(`   🔗 Claimed profile: ${claimedMember.displayName}`)
    } else {
      console.log(`   ⏳ No profile claimed yet (this is okay for login)`)
    }

    console.log("\n🎉 All auth checks PASSED!")
    console.log("🤔 If login is still failing, the issue might be:")
    console.log("   1. Frontend form submission")
    console.log("   2. NextAuth configuration")
    console.log("   3. Session/JWT handling")
    console.log("   4. Browser/network issues")

    // Test exact NextAuth flow
    console.log("\n🧪 Testing exact NextAuth credential flow...")
    
    // This mimics what NextAuth does
    const credentials = {
      email: YOUR_EMAIL,
      password: YOUR_PASSWORD
    }

    if (!credentials?.email || !credentials?.password) {
      console.log("❌ Credentials check: Missing email or password")
      return
    }
    console.log("✅ Credentials check: Email and password provided")

    // This is the exact logic from your auth.ts
    const testUser = await prisma.user.findUnique({
      where: {
        email: credentials.email
      },
      include: {
        league: true,
        memberLinks: {
          where: { status: 'APPROVED' },
          include: { member: true }
        }
      }
    })

    if (!testUser) {
      console.log("❌ NextAuth flow: User not found")
      return
    }
    console.log("✅ NextAuth flow: User found")

    const isValidNextAuthPassword = await bcrypt.compare(
      credentials.password,
      testUser.password || ""
    )

    if (!isValidNextAuthPassword) {
      console.log("❌ NextAuth flow: Password check failed")
      return
    }
    console.log("✅ NextAuth flow: Password check passed")

    if (!testUser.isActive) {
      console.log("❌ NextAuth flow: User is not active")
      return
    }
    console.log("✅ NextAuth flow: User is active")

    console.log("\n🎯 NextAuth should return this user object:")
    const claimedMemberTest = testUser.memberLinks[0]?.member || null
    const returnUser = {
      id: testUser.id,
      email: testUser.email,
      name: testUser.displayName || testUser.name,
      leagueId: testUser.leagueId,
      role: testUser.role,
      claimedMemberId: claimedMemberTest?.id || null,
      claimedMemberName: claimedMemberTest?.displayName || null,
    }
    console.log(JSON.stringify(returnUser, null, 2))

  } catch (error) {
    console.error("❌ Error in auth flow:", error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuthFlow()