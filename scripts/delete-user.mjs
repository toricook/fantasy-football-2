// scripts/delete-user.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUser() {
  const email = process.argv[2] // Get email from command line

  if (!email) {
    console.log("❌ Please provide an email address")
    console.log("Usage: node scripts/delete-user.mjs user@example.com")
    return
  }

  try {
    console.log(`🔍 Looking for user with email: ${email}`)

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberLinks: {
          include: {
            member: {
              select: {
                displayName: true
              }
            }
          }
        },
        accounts: true,
        sessions: true
      }
    })

    if (!user) {
      console.log(`❌ No user found with email: ${email}`)
      return
    }

    console.log(`\n📋 Found user:`)
    console.log(`   👤 Name: ${user.displayName || user.name}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   🆔 ID: ${user.id}`)
    console.log(`   🔗 Member Links: ${user.memberLinks.length}`)
    console.log(`   🔑 Auth Accounts: ${user.accounts.length}`)
    console.log(`   📅 Sessions: ${user.sessions.length}`)

    if (user.memberLinks.length > 0) {
      console.log(`   🏈 Claimed Profiles:`)
      user.memberLinks.forEach(link => {
        console.log(`      - ${link.member.displayName} (Status: ${link.status})`)
      })
    }

    // Confirm deletion
    console.log(`\n⚠️  This will permanently delete:`)
    console.log(`   - User account`)
    console.log(`   - All auth sessions`)
    console.log(`   - All member links (profile claims)`)
    console.log(`   - All NextAuth accounts`)
    console.log(`\n🔄 Starting deletion...`)

    // Delete in correct order to avoid foreign key constraints
    
    // 1. Delete sessions first
    if (user.sessions.length > 0) {
      await prisma.session.deleteMany({
        where: { userId: user.id }
      })
      console.log(`   ✅ Deleted ${user.sessions.length} sessions`)
    }

    // 2. Delete auth accounts
    if (user.accounts.length > 0) {
      await prisma.account.deleteMany({
        where: { userId: user.id }
      })
      console.log(`   ✅ Deleted ${user.accounts.length} auth accounts`)
    }

    // 3. Delete member links
    if (user.memberLinks.length > 0) {
      await prisma.userMemberLink.deleteMany({
        where: { userId: user.id }
      })
      console.log(`   ✅ Deleted ${user.memberLinks.length} member links`)
    }

    // 4. Finally delete the user
    await prisma.user.delete({
      where: { id: user.id }
    })

    console.log(`\n🎉 User ${email} has been completely deleted!`)
    console.log(`👍 Your friend can now register again with the same email.`)

  } catch (error) {
    console.error("❌ Error deleting user:", error)
    
    if (error.code === 'P2003') {
      console.log("\n💡 This might be a foreign key constraint error.")
      console.log("   Some data might still be referencing this user.")
    }
  } finally {
    await prisma.$disconnect()
  }
}

deleteUser()