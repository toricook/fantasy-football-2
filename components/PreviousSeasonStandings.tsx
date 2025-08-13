"use client";

import { useState, useEffect } from 'react';
import SleeperAPI from 'sleeper-api-client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PreviousSeasonStandingsProps {
  currentLeagueId: string;
  previousLeagueId: string;
}

interface TeamMapping {
  rank: number;
  teamName: string;
  owners: string[]; // Array of owner names
  userIds: string[]; // Array of user IDs
  isReturning: boolean;
  previousRecord?: string;
  previousPoints?: number;
}

export default function PreviousSeasonStandings({ 
  currentLeagueId, 
  previousLeagueId 
}: PreviousSeasonStandingsProps) {
  const [rankings, setRankings] = useState<TeamMapping[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonInfo, setSeasonInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchAndMapTeams() {
      try {
        setLoading(true);
        const sleeper = new SleeperAPI();
        
        // Get current season teams, previous season standings, and NFL state
        const [currentUsers, currentRosters, previousStandings, nflState] = await Promise.all([
          sleeper.getUsersByLeague(currentLeagueId),
          sleeper.getRostersByLeague(currentLeagueId),
          sleeper.getLeagueStandings(previousLeagueId),
          sleeper.getNflState()
        ]);

        setSeasonInfo(nflState);

        // Get previous season data
        const previousTeams = await sleeper.getUsersByLeague(previousLeagueId);
        const previousRosters = await sleeper.getRostersByLeague(previousLeagueId);

        // Create user lookup maps
        const currentUserMap = new Map();
        currentUsers.forEach(user => {
          currentUserMap.set(user.user_id, user);
        });

        const previousUserMap = new Map();
        previousTeams.forEach(user => {
          previousUserMap.set(user.user_id, user);
        });

        // Create previous season standings by roster_id
        const previousStandingsByRoster = new Map();
        previousStandings.forEach(team => {
          previousStandingsByRoster.set(team.roster_id, {
            rank: team.rank,
            record: `${team.settings.wins}-${team.settings.losses}${team.settings.ties > 0 ? `-${team.settings.ties}` : ''}`,
            points: team.settings.fpts_total
          });
        });

        // Helper function to get all owner IDs for a roster (including co-owners)
        const getAllOwnerIds = (roster: any) => {
          const ownerIds = [roster.owner_id];
          if (roster.co_owners && Array.isArray(roster.co_owners)) {
            ownerIds.push(...roster.co_owners);
          }
          return ownerIds;
        };

        // Helper function to check if two owner sets are the same
        const sameOwnerSet = (set1: string[], set2: string[]) => {
          const sorted1 = [...set1].sort();
          const sorted2 = [...set2].sort();
          return sorted1.length === sorted2.length && sorted1.every((id, index) => id === sorted2[index]);
        };

        // Map current rosters to previous season performance
        const returningTeams: TeamMapping[] = [];
        const newTeams: TeamMapping[] = [];

        currentRosters.forEach(currentRoster => {
          const currentOwnerIds = getAllOwnerIds(currentRoster);
          const currentOwnerNames = currentOwnerIds
            .map(id => currentUserMap.get(id)?.display_name || currentUserMap.get(id)?.username || 'Unknown')
            .filter(name => name !== 'Unknown');

          // Find team name (prefer team_name from primary owner)
          const primaryOwner = currentUserMap.get(currentRoster.owner_id);
          const teamName = primaryOwner?.metadata?.team_name || 
                          primaryOwner?.display_name || 
                          currentOwnerNames[0] || 
                          'Unknown Team';

          // Try to find matching previous roster with same ownership
          let matchingPreviousRoster = null;
          for (const previousRoster of previousRosters) {
            const previousOwnerIds = getAllOwnerIds(previousRoster);
            if (sameOwnerSet(currentOwnerIds, previousOwnerIds)) {
              matchingPreviousRoster = previousRoster;
              break;
            }
          }

          const teamMapping: TeamMapping = {
            rank: 0, // Will be set later
            teamName,
            owners: currentOwnerNames,
            userIds: currentOwnerIds,
            isReturning: !!matchingPreviousRoster,
            previousRecord: undefined,
            previousPoints: undefined
          };

          if (matchingPreviousRoster) {
            const previousData = previousStandingsByRoster.get(matchingPreviousRoster.roster_id);
            if (previousData) {
              teamMapping.rank = previousData.rank;
              teamMapping.previousRecord = previousData.record;
              teamMapping.previousPoints = previousData.points;
              returningTeams.push(teamMapping);
            } else {
              // Shouldn't happen, but treat as new if we can't find standings
              newTeams.push(teamMapping);
            }
          } else {
            newTeams.push(teamMapping);
          }
        });

        // Sort returning teams by their previous season rank
        returningTeams.sort((a, b) => a.rank - b.rank);

        // Shuffle new teams randomly
        const shuffledNewTeams = [...newTeams].sort(() => Math.random() - 0.5);

        // Assign ranks: returning teams keep relative order, new teams go to bottom
        const finalRankings: TeamMapping[] = [];
        let currentRank = 1;

        // Add returning teams first
        returningTeams.forEach(team => {
          finalRankings.push({ ...team, rank: currentRank++ });
        });

        // Add new teams at the bottom
        shuffledNewTeams.forEach(team => {
          finalRankings.push({ ...team, rank: currentRank++ });
        });

        setRankings(finalRankings);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (currentLeagueId && previousLeagueId) {
      fetchAndMapTeams();
    }
  }, [currentLeagueId, previousLeagueId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading Rankings...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Preseason Rankings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rankings.map((team) => (
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
          </div>
        ))}
      </CardContent>
    </Card>
  );
}