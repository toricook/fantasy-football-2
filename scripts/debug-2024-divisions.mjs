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
      // Filter out incomplete teams first
      const completeTeams = teams.filter(team => 
        team.finalRank !== null && team.wins !== null
      );
      
      // Then check if any of the complete teams have divisions
      const hasDivisions = completeTeams.some(team => 
        team.division && 
        team.division.trim() !== '' && 
        team.division.toLowerCase() !== 'unknown'
      );
      
      console.log(`${year}: completeTeams = ${completeTeams.length}, hasDivisions = ${hasDivisions}`);
      console.log(`${year}: division values:`, completeTeams.map(t => `${t.memberName}: "${t.division}"`));
      
      let divisions: { [divisionName: string]: SeasonTeam[] } | null = null;

      if (hasDivisions) {
        // Group complete teams by division
        divisions = {};
        
        completeTeams.forEach(team => {
          if (team.division && team.division.trim() !== '') {
            const divisionName = team.division.trim();
            
            if (!divisions![divisionName]) {
              divisions![divisionName] = [];
            }
            divisions![divisionName].push(team);
          }
        });

        // Only keep divisions if we actually have teams in them
        if (Object.keys(divisions).length === 0) {
          divisions = null;
          console.log(`${year}: No valid divisions found, falling back to regular standings`);
        } else {
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

          console.log(`${year}: created divisions:`, Object.keys(divisions));
        }
      }

      // Sort all complete teams by final rank for champion detection and non-division display
      const sortedTeams = [...completeTeams].sort((a, b) => {
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
        hasDivisions: divisions !== null, // Update this based on whether we actually have divisions
        divisions,
        teams: sortedTeams, // Use sorted complete teams
        champion
      };
    });

    // Sort by year descending (most recent first)
    yearlyData.sort((a, b) => parseInt(b.year) - parseInt(a.year));

    console.log(`Processed data for ${yearlyData.length} years`);
    console.log('Final yearlyData:', JSON.stringify(yearlyData, null, 2));
    
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