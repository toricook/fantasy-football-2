import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import ArchiveDisplay from "@/components/ArchiveDisplay";
import { prisma } from "@/lib/prisma";

// Add performance settings
export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

interface SeasonTeam {
  year: string;
  memberName: string;
  teamName: string | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
  totalPoints: number | null;
  finalRank: number | null;
  division?: string | null;
}

interface YearlyData {
  year: string;
  leagueName?: string;
  hasDivisions: boolean;
  divisions: {
    [divisionName: string]: SeasonTeam[];
  } | null;
  teams: SeasonTeam[]; // For non-division leagues
  champion: SeasonTeam | null;
}

async function getArchiveData(): Promise<YearlyData[]> {
  try {
    console.log('Fetching archive data...');
    
    // Get all seasons with member data, excluding current season (2025)
    const seasons = await prisma.season.findMany({
      where: {
        year: { not: '2025' }
      },
      include: {
        member: {
          select: {
            displayName: true
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { finalRank: 'asc' }
      ]
    });

    console.log(`Found ${seasons.length} total seasons`);

    // Optional: Load historical data ONLY for league names (if you want custom names)
    const fs = await import('fs');
    const path = await import('path');
    
    let historicalData: any = { manualSeasons: {} };
    try {
      const dataPath = path.join(process.cwd(), 'data', 'historical-members.json');
      if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        historicalData = JSON.parse(fileContent);
      }
    } catch (error) {
      console.log('Could not load historical data file:', error);
    }

    // Group seasons by year
    const seasonsByYear = seasons.reduce((acc, season) => {
      if (!acc[season.year]) {
        acc[season.year] = [];
      }
      acc[season.year].push({
        year: season.year,
        memberName: season.member.displayName,
        teamName: season.teamName,
        wins: season.wins,
        losses: season.losses,
        ties: season.ties,
        totalPoints: season.totalPoints,
        finalRank: season.finalRank,
        division: season.division
      });
      return acc;
    }, {} as { [year: string]: SeasonTeam[] });

    // Convert to yearly data format
    const yearlyData: YearlyData[] = Object.entries(seasonsByYear).map(([year, teams]) => {
      // Check if any team has division data
      const hasDivisions = teams.some(team => team.division !== null);
      
      let divisions: { [divisionName: string]: SeasonTeam[] } | null = null;

      if (hasDivisions) {
        // Group teams by division using database division field
        divisions = {};
        
        teams.forEach(team => {
          const divisionName = team.division || 'Unknown';
          if (!divisions![divisionName]) {
            divisions![divisionName] = [];
          }
          divisions![divisionName].push(team);
        });

        // Sort teams within each division by final rank
        Object.keys(divisions).forEach(divisionName => {
          divisions![divisionName].sort((a, b) => {
            if (a.finalRank && b.finalRank) {
              return a.finalRank - b.finalRank;
            }
            if (a.finalRank && !b.finalRank) return -1;
            if (!a.finalRank && b.finalRank) return 1;
            return 0;
          });
        });
      }

      // Sort all teams by final rank for champion detection and non-division display
      const sortedTeams = [...teams].sort((a, b) => {
        if (a.finalRank && b.finalRank) {
          return a.finalRank - b.finalRank;
        }
        if (a.finalRank && !b.finalRank) return -1;
        if (!a.finalRank && b.finalRank) return 1;
        return 0;
      });

      // Find the champion (rank 1)
      const champion = sortedTeams.find(team => team.finalRank === 1) || null;

      return {
        year,
        leagueName: historicalData.manualSeasons?.[year]?.leagueName || undefined,
        hasDivisions,
        divisions,
        teams: sortedTeams, // Use sorted teams for non-division leagues
        champion
      };
    });

    // Sort by year descending (most recent first)
    yearlyData.sort((a, b) => parseInt(b.year) - parseInt(a.year));

    console.log(`Processed data for ${yearlyData.length} years`);
    return yearlyData;

  } catch (error) {
    console.error('Error fetching archive data:', error);
    return [];
  }
}

export default async function ArchivePage() {
  const archiveData = await getArchiveData();

  console.log('Archive data being passed to component:', JSON.stringify(archiveData, null, 2));


  return (
    <div>
      <Navbar />
      <ArchiveDisplay archiveData={archiveData} />
      <Footer />
    </div>
  );
}