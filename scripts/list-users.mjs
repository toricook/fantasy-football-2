// scripts/list-users.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    // Get all users with their league info
    const users = await prisma.user.findMany({
      include: {
        league: {
          select: {
            name: true,
            code: true
          }
        },
        memberLinks: {
          include: {
            member: {
              select: {
                displayName: true,
                isCurrentlyActive: true
              }
            }
          },
          where: {
            status: 'APPROVED'
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { joinedAt: 'asc' }
      ]
    })

    if (users.length === 0) {
      console.log("📭 No users registered yet")
      console.log("🎯 Share your league code with members to get started!")
      return
    }

    console.log(`👥 Found ${users.length} registered user(s):\n`)

    // Group by league
    const usersByLeague = {}
    users.forEach(user => {
      const leagueName = user.league?.name || 'No League'
      if (!usersByLeague[leagueName]) {
        usersByLeague[leagueName] = []
      }
      usersByLeague[leagueName].push(user)
    })

    Object.entries(usersByLeague).forEach(([leagueName, leagueUsers]) => {
      console.log(`🏈 League: ${leagueName}`)
      if (leagueUsers[0].league?.code) {
        console.log(`📝 Code: ${leagueUsers[0].league.code}`)
      }
      console.log(`👤 Members (${leagueUsers.length}):`)

      leagueUsers.forEach((user, index) => {
        const status = user.isActive ? '✅' : '❌'
        const role = user.role === 'COMMISSIONER' ? '👑' : '👤'
        const joinDate = user.joinedAt.toLocaleDateString()
        
        console.log(`   ${index + 1}. ${status} ${role} ${user.displayName || user.name}`)
        console.log(`      📧 ${user.email}`)
        console.log(`      📅 Joined: ${joinDate}`)
        
        // Show linked fantasy profiles
        if (user.memberLinks.length > 0) {
          const linkedProfiles = user.memberLinks.map(link => link.member.displayName).join(', ')
          console.log(`      🔗 Linked to: ${linkedProfiles}`)
        } else {
          console.log(`      🔗 No fantasy profile claimed yet`)
        }
        console.log('')
      })
      console.log('')
    })

    // Summary stats
    const activeUsers = users.filter(u => u.isActive).length
    const commissioners = users.filter(u => u.role === 'COMMISSIONER').length
    const usersWithProfiles = users.filter(u => u.memberLinks.length > 0).length

    console.log(`📊 Summary:`)
    console.log(`   👥 Total users: ${users.length}`)
    console.log(`   ✅ Active users: ${activeUsers}`)
    console.log(`   👑 Commissioners: ${commissioners}`)
    console.log(`   🔗 Users with claimed profiles: ${usersWithProfiles}`)
    console.log(`   ⏳ Users pending profile claim: ${users.length - usersWithProfiles}`)

  } catch (error) {
    console.error("❌ Error listing users:", error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()