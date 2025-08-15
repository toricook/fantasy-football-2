import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import MembersDirectory from "@/components/MembersDirectory";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getLeagueMembers() {
  try {
    const members = await prisma.leagueMember.findMany({
      include: {
        seasons: {
          orderBy: { year: 'desc' }
        }
      },
      orderBy: { displayName: 'asc' }
    });

    // Separate current and historical members
    const currentMembers = members.filter(member => member.isCurrentlyActive);
    const historicalMembers = members.filter(member => !member.isCurrentlyActive);

    return {
      currentMembers: currentMembers.map(member => ({
        id: member.id,
        name: member.displayName,
        isCurrentlyActive: member.isCurrentlyActive,
        seasons: member.seasons.map(season => ({
          year: season.year,
          teamName: season.teamName,
          wins: season.wins,
          losses: season.losses,
          ties: season.ties,
          finalRank: season.finalRank,
          totalPoints: season.totalPoints
        }))
      })),
      historicalMembers: historicalMembers.map(member => ({
        id: member.id,
        name: member.displayName,
        isCurrentlyActive: member.isCurrentlyActive,
        seasons: member.seasons.map(season => ({
          year: season.year,
          teamName: season.teamName,
          wins: season.wins,
          losses: season.losses,
          ties: season.ties,
          finalRank: season.finalRank,
          totalPoints: season.totalPoints
        }))
      }))
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { currentMembers: [], historicalMembers: [] };
  }
}

export default async function MembersPage() {
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