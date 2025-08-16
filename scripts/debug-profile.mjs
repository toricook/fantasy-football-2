// scripts/debug-profile.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugProfile() {
  try {
    console.log('🔍 Debugging profile and member link data...\n')

    // 1. Check your user data
    console.log('=== YOUR USER DATA ===')
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        displayName: true,
        bio: true,
        birthdayMonth: true,
        birthdayDay: true,
        favoriteTeam: true,
        memberLinks: {
          include: {
            member: {
              select: {
                id: true,
                displayName: true
              }
            }
          }
        }
      }
    })

    users.forEach(user => {
      console.log(`User: ${user.displayName || user.email}`)
      console.log(`  Bio: ${user.bio || 'Not set'}`)
      console.log(`  Birthday: ${user.birthdayMonth && user.birthdayDay ? `${user.birthdayMonth}/${user.birthdayDay}` : 'Not set'}`)
      console.log(`  Favorite Team: ${user.favoriteTeam || 'Not set'}`)
      console.log(`  Member Links: ${user.memberLinks.length}`)
      user.memberLinks.forEach(link => {
        console.log(`    -> Linked to member: ${link.member.displayName} (status: ${link.status})`)
      })
      console.log('')
    })

    // 2. Check member data with links
    console.log('\n=== MEMBER DATA WITH USER LINKS ===')
    const members = await prisma.leagueMember.findMany({
      where: { isCurrentlyActive: true },
      include: {
        userLinks: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: {
                bio: true,
                birthdayMonth: true,
                birthdayDay: true,
                favoriteTeam: true,
                email: true
              }
            }
          }
        }
      }
    })

    members.forEach(member => {
      console.log(`Member: ${member.displayName}`)
      console.log(`  User Links: ${member.userLinks.length}`)
      if (member.userLinks.length > 0) {
        const userProfile = member.userLinks[0].user
        console.log(`    -> Linked to user: ${userProfile.email}`)
        console.log(`    -> Bio: ${userProfile.bio || 'Not set'}`)
        console.log(`    -> Birthday: ${userProfile.birthdayMonth && userProfile.birthdayDay ? `${userProfile.birthdayMonth}/${userProfile.birthdayDay}` : 'Not set'}`)
        console.log(`    -> Favorite Team: ${userProfile.favoriteTeam || 'Not set'}`)
      } else {
        console.log(`    -> No linked user profile`)
      }
      console.log('')
    })

    // 3. Check what the members page query would return
    console.log('\n=== WHAT MEMBERS PAGE SEES ===')
    const membersPageData = await prisma.leagueMember.findMany({
      where: { isCurrentlyActive: true },
      include: {
        seasons: {
          orderBy: { year: 'desc' }
        },
        wonAwards: {
          orderBy: [
            { season: 'desc' },
            { name: 'asc' }
          ]
        },
        userLinks: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: {
                bio: true,
                birthdayMonth: true,
                birthdayDay: true,
                favoriteTeam: true
              }
            }
          }
        }
      },
      orderBy: { displayName: 'asc' }
    })

    membersPageData.forEach(member => {
      const userProfile = member.userLinks[0]?.user || null
      console.log(`Member: ${member.displayName}`)
      console.log(`  Would show bio: ${userProfile?.bio || 'NO'}`)
      console.log(`  Would show birthday: ${userProfile?.birthdayMonth && userProfile?.birthdayDay ? 'YES' : 'NO'}`)
      console.log(`  Would show favorite team: ${userProfile?.favoriteTeam || 'NO'}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugProfile()