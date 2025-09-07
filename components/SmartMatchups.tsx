"use client";

import { useState, useEffect } from 'react';
import SleeperAPI from 'sleeper-api-client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SmartMatchupsProps {
  leagueId: string;
}

interface ScoreboardMatchup {
  matchup_number: number;
  matchup_id: number;
  team1: {
    name: string;
    points: string;
    roster_id: number;
    user: any;
    starters: string[];
    players_points: Record<string, number>;
  };
  team2: {
    name: string;
    points: string;
    roster_id: number;
    user: any;
    starters: string[];
    players_points: Record<string, number>;
  } | null;
  winner: 'team1' | 'team2' | 'tie' | null;
}

export default function SmartMatchups({ leagueId }: SmartMatchupsProps) {
  const [matchups, setMatchups] = useState<ScoreboardMatchup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonInfo, setSeasonInfo] = useState<any>(null);
  const [isPreseason, setIsPreseason] = useState<boolean>(false);

  // Simple function to determine matchup status
  const getMatchupStatus = (matchup: ScoreboardMatchup) => {
    // If there's a winner, the game is finished
    if (matchup.winner) {
      return {
        status: 'final',
        text: 'Final',
        variant: 'default' as const
      };
    }

    // Check if any points have been scored (game has started)
    const team1Points = parseFloat(matchup.team1.points) || 0;
    const team2Points = parseFloat(matchup.team2?.points || '0') || 0;
    
    if (team1Points > 0 || team2Points > 0) {
      return {
        status: 'live',
        text: 'Live',
        variant: 'destructive' as const
      };
    }

    // No points scored yet, game is upcoming
    return {
      status: 'upcoming',
      text: 'Upcoming',
      variant: 'outline' as const
    };
  };

  useEffect(() => {
    async function fetchMatchupsData() {
      try {
        setLoading(true);
        const sleeper = new SleeperAPI();
        
        // Get NFL state first
        const nflState = await sleeper.getNflState();
        setSeasonInfo(nflState);

        // Check if it's preseason
        const isPreseasonByState = nflState.season_type === 'pre' || nflState.season_type === 'off';
        setIsPreseason(isPreseasonByState);

        // If it's regular season, fetch matchups for current week
        if (!isPreseasonByState && nflState.week) {
          try {
            const weekMatchups = await sleeper.getMatchupScoreboard(leagueId, nflState.week);
            setMatchups(weekMatchups);
          } catch (matchupError) {
            console.warn('Could not fetch matchups:', matchupError);
            // Don't set error state, just show empty matchups
            setMatchups([]);
          }
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch matchups data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (leagueId) {
      fetchMatchupsData();
    }
  }, [leagueId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading Matchups...
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

  // Render preseason message
  if (isPreseason) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Matchups
            <Badge variant="secondary" className="text-xs">
              {seasonInfo?.season_type === 'pre' ? 'Preseason' : 'Offseason'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">
            <div className="text-6xl mb-4">🏈</div>
            <p className="text-sm font-medium mb-2">Season hasn't started yet!</p>
            <p className="text-xs">Matchups will appear once the regular season begins.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render regular season matchups
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Week {seasonInfo?.week || '?'} Matchups
          <Badge variant="outline" className="text-xs">
            {seasonInfo?.season_type === 'regular' ? 'Regular Season' : 
             seasonInfo?.season_type === 'post' ? 'Playoffs' : 'Season'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matchups.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <p className="text-sm">No matchups available for this week.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchups.map((matchup) => (
              <div 
                key={matchup.matchup_id}
                className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    Matchup {matchup.matchup_number}
                  </Badge>
                  
                  <div className="flex gap-2">
                    {/* Game Status Badge */}
                    {(() => {
                      const statusInfo = getMatchupStatus(matchup);
                      return (
                        <Badge 
                          variant={statusInfo.variant}
                          className="text-xs"
                        >
                          {statusInfo.text}
                        </Badge>
                      );
                    })()}
                    
                    {/* Winner Badge - only show if there's a winner */}
                    {matchup.winner && (
                      <Badge 
                        variant={matchup.winner === 'tie' ? 'secondary' : 'default'} 
                        className="text-xs"
                      >
                        {matchup.winner === 'tie' ? 'Tie' : 
                         matchup.winner === 'team1' ? `${matchup.team1.name} Wins` : 
                         `${matchup.team2?.name} Wins`}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Team 1 */}
                  <div className={`flex items-center justify-between p-3 rounded ${
                    matchup.winner === 'team1' ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' :
                    matchup.winner === 'team2' ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' :
                    'bg-muted/20'
                  }`}>
                    <div>
                      <div className="font-medium text-sm">{matchup.team1.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {matchup.team1.user?.username || 'Unknown'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{matchup.team1.points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>

                  {/* VS divider */}
                  <div className="text-center text-xs text-muted-foreground font-medium">
                    VS
                  </div>

                  {/* Team 2 or Bye */}
                  {matchup.team2 ? (
                    <div className={`flex items-center justify-between p-3 rounded ${
                      matchup.winner === 'team2' ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' :
                      matchup.winner === 'team1' ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' :
                      'bg-muted/20'
                    }`}>
                      <div>
                        <div className="font-medium text-sm">{matchup.team2.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {matchup.team2.user?.username || 'Unknown'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{matchup.team2.points}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded">
                      <div className="text-sm font-medium">BYE WEEK</div>
                      <div className="text-xs">No opponent this week</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}