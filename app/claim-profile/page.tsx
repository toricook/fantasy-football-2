import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma'; // Use the singleton
import { redirect } from 'next/navigation';
import ClaimProfileForm from "@/components/ClaimProfileForm";

async function getClaimableProfiles() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user already has a claimed profile
  const userWithLinks = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberLinks: {
        where: { status: 'APPROVED' },
        include: { member: true }
      }
    }
  });

  if (userWithLinks?.memberLinks.length) {
    // User already has a claimed profile, redirect to home
    redirect('/');
  }

  try {
    // Get all league members that aren't already claimed by active users
    const unclaimedMembers = await prisma.leagueMember.findMany({
      where: {
        leagueId: session.user.leagueId,
        userLinks: {
          none: {
            status: 'APPROVED'
          }
        }
      },
      include: {
        seasons: {
          where: {
            year: { not: "2025" } // Exclude current season preseason data
          },
          orderBy: { year: 'desc' }
        }
      },
      orderBy: { displayName: 'asc' }
    });

    return {
      user: session.user,
      unclaimedMembers
    };
  } catch (error) {
    console.error('Error fetching claimable profiles:', error);
    redirect('/login');
  }
}

export default async function ClaimProfilePage() {
  const { user, unclaimedMembers } = await getClaimableProfiles();

  return (
    <div className="min-h-screen bg-background">
      <ClaimProfileForm user={user} unclaimedMembers={unclaimedMembers} />
    </div>
  );
}