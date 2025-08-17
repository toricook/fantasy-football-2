"use client";

import { useState, useEffect } from 'react';
import SleeperAPI from 'sleeper-api-client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Crown } from "lucide-react";

interface PlayoffSettings {
  playoff_teams: number;
  playoff_weeks: number;
  playoff_start_week: number;
  playoff_type: number;
}

interface TeamData {
  rank: number;
  roster_id: number;
  owner_id: string;
  user?: {
    user_id: string;
    display_name: string;
    username: string;
    metadata?: {
      team_name?: string;
    };
  };
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts_total: number;
    fpts_against_total: number;
    division?: number;
  };
}

interface DivisionGroup {
  [divisionName: string]: TeamData[];
}

interface PreseasonDivisionGroup {
  [divisionName: string]: TeamMapping[];
}

interface PlayoffPictureProps {
  leagueId: string;
  previousSeasonLeagueId?: string;
}

export default function PlayoffPicture({ leagueId, previousSeasonLeagueId }: PlayoffPictureProps) {
  const [playoffSettings, setPlayoffSettings] = useState<PlayoffSettings | null>(null);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [divisions, setDivisions] = useState<DivisionGroup>({});
  const [hasDivisions, setHasDivisions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonInfo, setSeasonInfo] = useState<any>(null);
  
  // Preseason states
  const [isPreseason, setIsPreseason] = useState<boolean | null>(null);
  const [preseasonRankings, setPreseasonRankings] = useState<TeamMapping[]>([]);
  const [preseasonDivisions, setPreseasonDivisions] = useState<PreseasonDivisionGroup>({});
  const [hasPreseasonDivisions, setHasPreseasonDivisions] = useState(false);

  useEffect(() => {
    async function fetchAllData() {
      if (!leagueId) return;
      
      try {
        setLoading(true);
        setError(null);

        const sleeper = new SleeperAPI();
        
        // Always get playoff settings and basic league data
        const [playoffData, currentStandings] = await Promise.all([
          sleeper.getPlayoffFormat(leagueId),
          sleeper.getLeagueStandings(leagueId)
        ]);

        setPlayoffSettings(playoffData.playoffSettings);
        setSeasonInfo(playoffData.seasonInfo);

        // Determine if it's preseason using multiple checks
        const isPreseasonByState = playoffData.seasonInfo.season_type === 'pre' || playoffData.seasonInfo.season_type === 'off';
        const isPreseasonByPoints = currentStandings.every(team => 
          !team.settings.fpts_total || team.settings.fpts_total === 0 || isNaN(team.settings.fpts_total)
        );
        
        const preseasonCheck = isPreseasonByState || isPreseasonByPoints;
        setIsPreseason(preseasonCheck);

        if (preseasonCheck && previousSeasonLeagueId) {
          // It's preseason and we have previous season ID - fetch preseason rankings
          const [currentUsers, currentRosters, previousStandings, previousUsers, previousRosters, league] = await Promise.all([
            sleeper.getUsersByLeague(leagueId),
            sleeper.getRostersByLeague(leagueId),
            sleeper.getLeagueStandings(previousSeasonLeagueId),
            sleeper.getUsersByLeague(previousSeasonLeagueId),
            sleeper.getRostersByLeague(previousSeasonLeagueId),
            sleeper.getLeague(leagueId) // Get current league for division info
          ]);

          // Process preseason rankings (same logic as PreviousSeasonStandings)
          const currentUserMap = new Map();
          currentUsers.forEach(user => {
            currentUserMap.set(user.user_id, user);
          });

          const previousStandingsByRoster = new Map();
          previousStandings.forEach(team => {
            previousStandingsByRoster.set(team.roster_id, {
              rank: team.rank,
              record: `${team.settings.wins}-${team.settings.losses}${team.settings.ties > 0 ? `-${team.settings.ties}` : ''}`,
              points: team.settings.fpts_total
            });
          });

          // Helper functions for owner matching
          const getAllOwnerIds = (roster: any) => {
            const ownerIds = [roster.owner_id];
            if (roster.co_owners && Array.isArray(roster.co_owners)) {
              ownerIds.push(...roster.co_owners);
            }
            return ownerIds;
          };

          const sameOwnerSet = (set1: string[], set2: string[]) => {
            const sorted1 = [...set1].sort();
            const sorted2 = [...set2].sort();
            return sorted1.length === sorted2.length && sorted1.every((id, index) => id === sorted2[index]);
          };

          // Create preseason rankings
          const returningTeams: TeamMapping[] = [];
          const newTeams: TeamMapping[] = [];

          currentRosters.forEach(currentRoster => {
            const currentOwnerIds = getAllOwnerIds(currentRoster);
            const currentOwnerNames = currentOwnerIds
              .map(id => currentUserMap.get(id)?.display_name || currentUserMap.get(id)?.username || 'Unknown')
              .filter(name => name !== 'Unknown');

            const primaryOwner = currentUserMap.get(currentRoster.owner_id);
            const teamName = primaryOwner?.metadata?.team_name || 
                            primaryOwner?.display_name || 
                            currentOwnerNames[0] || 
                            'Unknown Team';

            // Find matching previous roster
            let matchingPreviousRoster = null;
            for (const previousRoster of previousRosters) {
              const previousOwnerIds = getAllOwnerIds(previousRoster);
              if (sameOwnerSet(currentOwnerIds, previousOwnerIds)) {
                matchingPreviousRoster = previousRoster;
                break;
              }
            }

            const teamMapping: TeamMapping = {
              rank: 0,
              teamName,
              owners: currentOwnerNames,
              userIds: currentOwnerIds,
              isReturning: !!matchingPreviousRoster,
              previousRecord: undefined,
              previousPoints: undefined,
              roster_id: currentRoster.roster_id,
              division: currentRoster.settings?.division // Add current division info
            };

            if (matchingPreviousRoster) {
              const previousData = previousStandingsByRoster.get(matchingPreviousRoster.roster_id);
              if (previousData) {
                teamMapping.rank = previousData.rank;
                teamMapping.previousRecord = previousData.record;
                teamMapping.previousPoints = previousData.points;
                returningTeams.push(teamMapping);
              } else {
                newTeams.push(teamMapping);
              }
            } else {
              newTeams.push(teamMapping);
            }
          });

          // Sort and assign final ranks
          returningTeams.sort((a, b) => a.rank - b.rank);
          const shuffledNewTeams = [...newTeams].sort(() => Math.random() - 0.5);

          const finalRankings: TeamMapping[] = [];
          let currentRank = 1;

          returningTeams.forEach(team => {
            finalRankings.push({ ...team, rank: currentRank++ });
          });

          shuffledNewTeams.forEach(team => {
            finalRankings.push({ ...team, rank: currentRank++ });
          });

          setPreseasonRankings(finalRankings);

          // Check if current league has divisions and group preseason rankings by division
          const divisionNames: { [key: number]: string } = {};
          let hasDivisionsInLeague = false;
          
          if (league.metadata) {
            for (let i = 1; i <= 10; i++) {
              const divisionKey = `division_${i}`;
              if (league.metadata[divisionKey]) {
                divisionNames[i] = league.metadata[divisionKey];
                hasDivisionsInLeague = true;
              }
            }
          }

          // Check if any teams have division assignments
          const teamsWithDivisions = finalRankings.filter(team => 
            team.division && 
            typeof team.division === 'number' && 
            team.division > 0
          );

          if (hasDivisionsInLeague && teamsWithDivisions.length > 0) {
            // Group preseason rankings by division
            const preseasonDivisionGroups: PreseasonDivisionGroup = {};
            
            finalRankings.forEach(team => {
              if (team.division && typeof team.division === 'number') {
                const divisionNumber = team.division;
                const divisionName = divisionNames[divisionNumber] || `Division ${divisionNumber}`;
                
                if (!preseasonDivisionGroups[divisionName]) {
                  preseasonDivisionGroups[divisionName] = [];
                }
                preseasonDivisionGroups[divisionName].push(team);
              }
            });

            // Sort teams within each division by preseason rank
            Object.keys(preseasonDivisionGroups).forEach(divisionName => {
              preseasonDivisionGroups[divisionName].sort((a, b) => a.rank - b.rank);
            });

            setPreseasonDivisions(preseasonDivisionGroups);
            setHasPreseasonDivisions(true);
          } else {
            setHasPreseasonDivisions(false);
          }

        } else {
          // Regular season - use current standings and divisions
          const league = await sleeper.getLeague(leagueId);
          setTeams(currentStandings);

          // Extract division names from league metadata
          const divisionNames: { [key: number]: string } = {};
          let hasDivisionsInLeague = false;
          
          if (league.metadata) {
            for (let i = 1; i <= 10; i++) {
              const divisionKey = `division_${i}`;
              if (league.metadata[divisionKey]) {
                divisionNames[i] = league.metadata[divisionKey];
                hasDivisionsInLeague = true;
              }
            }
          }

          // Check if any teams have division assignments
          const teamsWithDivisions = currentStandings.filter(team => 
            team.settings.division && 
            typeof team.settings.division === 'number' && 
            team.settings.division > 0
          );

          if (hasDivisionsInLeague && teamsWithDivisions.length > 0) {
            // Group teams by division
            const divisionGroups: DivisionGroup = {};
            
            currentStandings.forEach(team => {
              if (team.settings.division && typeof team.settings.division === 'number') {
                const divisionNumber = team.settings.division;
                const divisionName = divisionNames[divisionNumber] || `Division ${divisionNumber}`;
                
                if (!divisionGroups[divisionName]) {
                  divisionGroups[divisionName] = [];
                }
                divisionGroups[divisionName].push(team);
              }
            });

            // Sort teams within each division by rank
            Object.keys(divisionGroups).forEach(divisionName => {
              divisionGroups[divisionName].sort((a, b) => a.rank - b.rank);
            });

            setDivisions(divisionGroups);
            setHasDivisions(true);
          } else {
            setHasDivisions(false);
          }
        }

      } catch (err: any) {
        console.error('Error fetching data:', err);
        const errorMessage = err.message || 'Failed to fetch playoff data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (leagueId) {
      fetchAllData();
    }
  }, [leagueId, previousSeasonLeagueId]);

  // Playoff bracket generation functions
  const generatePlayoffStructure = () => {
    if (!playoffSettings) return null;

    const { playoff_teams, playoff_weeks, playoff_start_week } = playoffSettings;
    
    if (playoff_teams === 6 && playoff_weeks === 3) {
      return generate6TeamStructure(playoff_start_week);
    } else if (playoff_teams === 4 && playoff_weeks === 2) {
      return generate4TeamStructure(playoff_start_week);
    } else if (playoff_teams === 8 && playoff_weeks === 3) {
      return generate8TeamStructure(playoff_start_week);
    }
    
    return generateGenericStructure(playoff_teams, playoff_weeks, playoff_start_week);
  };

  const generate6TeamStructure = (startWeek: number) => {
    return (
      <div className="grid grid-cols-3 gap-6">
        {/* Week 1 - Wild Card */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Week {startWeek}
          </h3>
          <div className="text-xs text-center text-muted-foreground mb-3">Wild Card</div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">3rd seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">6th seed</div>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">4th seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">5th seed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week 2 - Semifinals */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Week {startWeek + 1}
          </h3>
          <div className="text-xs text-center text-muted-foreground mb-3">Semifinals</div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">1st seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">3rd vs 6th winner</div>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">2nd seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">4th vs 5th winner</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week 3 - Championship */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Week {startWeek + 2}
          </h3>
          <div className="text-xs text-center text-yellow-700 dark:text-yellow-300 mb-3 font-medium">Championship</div>
          
          <div className="flex justify-center">
            <div className="border-2 border-yellow-500/30 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 w-full max-w-48">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">Semifinal Winner 1</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">Semifinal Winner 2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generate4TeamStructure = (startWeek: number) => {
    return (
      <div className="grid grid-cols-2 gap-6">
        {/* Week 1 - Semifinals */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Week {startWeek}
          </h3>
          <div className="text-xs text-center text-muted-foreground mb-3">Semifinals</div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">1st seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">4th seed</div>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">2nd seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">3rd seed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week 2 - Championship */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Week {startWeek + 1}
          </h3>
          <div className="text-xs text-center text-yellow-700 dark:text-yellow-300 mb-3 font-medium">Championship</div>
          
          <div className="flex justify-center">
            <div className="border-2 border-yellow-500/30 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 w-full max-w-48">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">Semifinal Winner 1</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">Semifinal Winner 2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generate8TeamStructure = (startWeek: number) => {
    return (
      <div className="grid grid-cols-3 gap-6">
        {/* Week 1 - Quarterfinals */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Week {startWeek}
          </h3>
          <div className="text-xs text-center text-muted-foreground mb-3">Quarterfinals</div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">1st seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">8th seed</div>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">2nd seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">7th seed</div>
              </div>
            </div>

            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">3rd seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">6th seed</div>
              </div>
            </div>

            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">4th seed</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">5th seed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week 2 - Semifinals */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Week {startWeek + 1}
          </h3>
          <div className="text-xs text-center text-muted-foreground mb-3">Semifinals</div>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">QF Winner 1</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">QF Winner 2</div>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 bg-muted/20">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">QF Winner 3</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">QF Winner 4</div>
              </div>
            </div>
          </div>
        </div>

        {/* Week 3 - Championship */}
        <div className="space-y-4">
          <h3 className="font-semibold text-center flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Week {startWeek + 2}
          </h3>
          <div className="text-xs text-center text-yellow-700 dark:text-yellow-300 mb-3 font-medium">Championship</div>
          
          <div className="flex justify-center">
            <div className="border-2 border-yellow-500/30 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 w-full max-w-48">
              <div className="space-y-2 text-center">
                <div className="bg-background border rounded p-2 text-sm">Semifinal Winner 1</div>
                <div className="text-xs text-muted-foreground">vs</div>
                <div className="bg-background border rounded p-2 text-sm">Semifinal Winner 2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateGenericStructure = (teams: number, weeks: number, startWeek: number) => {
    return (
      <div className="text-center p-8">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Playoff Format</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{teams} teams make playoffs</p>
          <p>{weeks} weeks of playoffs</p>
          <p>Starts Week {startWeek}</p>
        </div>
      </div>
    );
  };

  // Division standings helper functions
  const getTeamName = (team: TeamData) => {
    return team.user?.metadata?.team_name || 
           team.user?.display_name || 
           team.user?.username || 
           'Unknown Team';
  };

  const getOwnerName = (team: TeamData) => {
    return team.user?.display_name || 
           team.user?.username || 
           'Unknown Owner';
  };

  const formatRecord = (team: TeamData) => {
    const { wins, losses, ties } = team.settings;
    return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return 'default';
    if (rank <= 3) return 'secondary';
    return 'outline';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-3 h-3 text-yellow-600" />;
    if (rank === 2) return <Trophy className="w-3 h-3 text-gray-500" />;
    if (rank === 3) return <Trophy className="w-3 h-3 text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading Playoff Picture...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const playoffStructure = generatePlayoffStructure();
  const divisionNames = Object.keys(divisions);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Playoff Picture
          </div>
          {playoffSettings && (
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {playoffSettings.playoff_teams} teams
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {playoffSettings.playoff_weeks} weeks
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[calc(50vh-80px)] space-y-6">
        {/* Section 1: Playoff Bracket */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Playoff Bracket
          </h3>
          {playoffStructure || (
            <div className="text-center p-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm">Playoff bracket will be displayed here once league settings are loaded.</p>
            </div>
          )}
        </div>

        {/* Section 2: Division Standings */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            {isPreseason ? 'Preseason Rankings' : (hasDivisions ? 'Division Standings' : 'League Standings')}
            {isPreseason && (
              <Badge variant="secondary" className="text-xs ml-2">
                {seasonInfo?.season_type === 'pre' ? 'Preseason' : 'Offseason'}
              </Badge>
            )}
            {!isPreseason && hasDivisions && (
              <Badge variant="outline" className="text-xs ml-2">
                {Object.keys(divisions).length} divisions
              </Badge>
            )}
            {isPreseason && hasPreseasonDivisions && (
              <Badge variant="outline" className="text-xs ml-2">
                {Object.keys(preseasonDivisions).length} divisions
              </Badge>
            )}
          </h3>
          
          {isPreseason ? (
            hasPreseasonDivisions ? (
              // Preseason with divisions - show divisional view with preseason rankings
              <div className={`grid gap-4 ${Object.keys(preseasonDivisions).length === 2 ? 'grid-cols-2' : Object.keys(preseasonDivisions).length === 3 ? 'grid-cols-3' : Object.keys(preseasonDivisions).length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
                {Object.keys(preseasonDivisions).map(divisionName => (
                  <div key={divisionName} className="space-y-3">
                    <h4 className="font-semibold text-sm text-center text-primary border-b pb-1">
                      {divisionName}
                    </h4>
                    <div className="space-y-2">
                      {preseasonDivisions[divisionName].map((team, index) => (
                        <div 
                          key={team.roster_id || team.userIds.join('-')}
                          className={`p-2 rounded-lg border text-center ${
                            team.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                            index === 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                            team.isReturning ? 'bg-muted/30' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Badge variant={team.rank === 1 ? 'default' : team.rank <= 3 ? 'secondary' : 'outline'} className="text-xs">
                              {team.rank === 1 && <Crown className="w-3 h-3 text-yellow-600 mr-1" />}
                              {team.rank}
                            </Badge>
                            {index === 0 && team.rank !== 1 && (
                              <Badge variant="secondary" className="text-xs">
                                DIV
                              </Badge>
                            )}
                            {!team.isReturning && (
                              <Badge variant="outline" className="text-xs">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="font-medium text-xs mb-1">{team.teamName}</div>
                          <div className="text-xs text-muted-foreground mb-1">{team.owners.join(' & ')}</div>
                          {team.isReturning && team.previousRecord && (
                            <div className="text-xs text-muted-foreground">
                              <div>Last: {team.previousRecord}</div>
                              {team.previousPoints && (
                                <div>{team.previousPoints.toFixed(1)} pts</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Preseason without divisions - show regular list
              <div className="space-y-2">
                {preseasonRankings.map((team) => (
                  <div 
                    key={team.userIds.join('-')}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      team.isReturning 
                        ? 'bg-muted/30 hover:bg-muted/50' 
                        : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                        team.isReturning 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                      }`}>
                        {team.rank}
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {team.teamName}
                          {!team.isReturning && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              NEW
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {team.owners.join(' & ')}
                        </div>
                      </div>
                    </div>
                    {team.isReturning && team.previousRecord && (
                      <div className="text-right text-xs text-muted-foreground">
                        <div>Last season: {team.previousRecord}</div>
                        {team.previousPoints && (
                          <div>{team.previousPoints.toFixed(1)} pts</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : !hasDivisions ? (
            // No divisions, show regular standings
            <div className="space-y-2">
              {teams.map((team, index) => (
                <div 
                  key={team.roster_id}
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    team.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={getRankBadgeVariant(team.rank)} className="text-xs min-w-[2rem] justify-center">
                      {getRankIcon(team.rank)}
                      {team.rank}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">{getTeamName(team)}</div>
                      <div className="text-xs text-muted-foreground">{getOwnerName(team)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatRecord(team)}</div>
                    <div className="text-xs text-muted-foreground">{team.settings.fpts_total.toFixed(1)} pts</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Has divisions, show divisional view
            <div className={`grid gap-4 ${Object.keys(divisions).length === 2 ? 'grid-cols-2' : Object.keys(divisions).length === 3 ? 'grid-cols-3' : Object.keys(divisions).length === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
              {Object.keys(divisions).map(divisionName => (
                <div key={divisionName} className="space-y-3">
                  <h4 className="font-semibold text-sm text-center text-primary border-b pb-1">
                    {divisionName}
                  </h4>
                  <div className="space-y-2">
                    {divisions[divisionName].map((team, index) => (
                      <div 
                        key={team.roster_id}
                        className={`p-2 rounded-lg border text-center ${
                          team.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                          index === 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Badge variant={getRankBadgeVariant(team.rank)} className="text-xs">
                            {getRankIcon(team.rank)}
                            {team.rank}
                          </Badge>
                          {index === 0 && team.rank !== 1 && (
                            <Badge variant="secondary" className="text-xs">
                              DIV
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium text-xs mb-1">{getTeamName(team)}</div>
                        <div className="text-xs text-muted-foreground mb-1">{getOwnerName(team)}</div>
                        <div className="text-xs">
                          <div className="font-medium">{formatRecord(team)}</div>
                          <div className="text-muted-foreground">{team.settings.fpts_total.toFixed(1)} pts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}