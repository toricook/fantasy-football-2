import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import MembersDirectory from "@/components/MembersDirectory";
import { prisma } from "@/lib/prisma"; // Use singleton client
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

// Add timeout and performance settings
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

async function getLeagueMembers() {
  try {
    // Use Promise.all to run queries in parallel for better performance
    const [members, awards, users] = await Promise.all([
      // Get members
      prisma.leagueMember.findMany({
        include: {
          seasons: {
            orderBy: { year: 'desc' }
          }
        },
        orderBy: { displayName: 'asc' }
      }),
      
      // Get awards
      prisma.award.findMany({
        where: {
          winnerId: { not: null }
        },
        orderBy: [
          { season: 'desc' },
          { name: 'asc' }
        ]
      }),
      
      // Get users
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          bio: true,
          birthdayMonth: true,
          birthdayDay: true,
          favoriteTeam: true,
          memberLinks: {
            where: { status: 'APPROVED' },
            select: {
              leagueMemberId: true
            }
          }
        }
      })
    ]);

    // Create a map of member ID to user profile
    const memberToUserMap = new Map();
    users.forEach(user => {
      user.memberLinks.forEach(link => {
        memberToUserMap.set(link.leagueMemberId, {
          bio: user.bio,
          birthdayMonth: user.birthdayMonth,
          birthdayDay: user.birthdayDay,
          favoriteTeam: user.favoriteTeam
        });
      });
    });

    // Helper function to format birthday
    const formatBirthday = (month: number | null, day: number | null) => {
      if (!month || !day) return null;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${monthNames[month - 1]} ${day}`;
    };

    // Create a map of member ID to awards
    const memberToAwardsMap = new Map();
    awards.forEach(award => {
      if (!memberToAwardsMap.has(award.winnerId)) {
        memberToAwardsMap.set(award.winnerId, []);
      }
      memberToAwardsMap.get(award.winnerId).push({
        id: award.id,
        name: award.name,
        icon: award.icon,
        season: award.season
      });
    });

    // Map members with user profile data
    const mapMember = (member: any) => {
      const userProfile = memberToUserMap.get(member.id);
      const memberAwards = memberToAwardsMap.get(member.id) || [];
      
      return {
        id: member.id,
        name: member.displayName,
        isCurrentlyActive: member.isCurrentlyActive,
        seasons: member.seasons.map((season: any) => ({
          year: season.year,
          teamName: season.teamName,
          wins: season.wins,
          losses: season.losses,
          ties: season.ties,
          finalRank: season.finalRank,
          totalPoints: season.totalPoints
        })),
        awards: memberAwards,
        bio: userProfile?.bio || null,
        birthday: userProfile ? formatBirthday(userProfile.birthdayMonth, userProfile.birthdayDay) : null,
        favoriteTeam: userProfile?.favoriteTeam || null
      };
    };

    const currentMembers = members.filter(member => member.isCurrentlyActive).map(mapMember);
    const historicalMembers = members.filter(member => !member.isCurrentlyActive).map(mapMember);

    return {
      currentMembers,
      historicalMembers
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { currentMembers: [], historicalMembers: [] };
  }
  // Remove the prisma.$disconnect() since we're using a singleton
}

export default async function MembersPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  if (!session?.user?.leagueId) {
    redirect('/login')
  }
  
  if (!session?.user?.claimedMemberId) {
    redirect('/claim-profile')
  }

  const { currentMembers, historicalMembers } = await getLeagueMembers();

  return (
    <div>
      <Navbar />
      <MembersDirectory 
        currentMembers={currentMembers}
        historicalMembers={historicalMembers}
      />
      <Footer />
    </div>
  );
}