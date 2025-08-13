"use client";

import { useState, useEffect } from 'react';
import SleeperAPI from 'sleeper-api-client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PreviousSeasonStandings from './PreviousSeasonStandings';

interface SmartStandingsProps {
  leagueId: string;
  previousSeasonLeagueId?: string; // Optional previous season league ID
}

interface PreseasonRanking {
  rank: number;
  teamName: string;
  ownerName: string;
  prediction: string;
  reasoning: string;
}

export default function SmartStandings({ leagueId, previousSeasonLeagueId }: SmartStandingsProps) {
  const [isPreseason, setIsPreseason] = useState<boolean | null>(null);
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonInfo, setSeasonInfo] = useState<any>(null);

  useEffect(() => {
    async function checkSeasonAndFetchData() {
      try {
        setLoading(true);
        const sleeper = new SleeperAPI();
        
        // Get NFL state and league standings in parallel
        const [nflState, leagueStandings] = await Promise.all([
          sleeper.getNflState(),
          sleeper.getLeagueStandings(leagueId)
        ]);

        setSeasonInfo(nflState);
        setStandings(leagueStandings);

        // Determine if it's preseason using multiple checks
        const isPreseasonByState = nflState.season_type === 'pre' || nflState.season_type === 'off';
        const isPreseasonByPoints = leagueStandings.every(team => 
          !team.settings.fpts_total || team.settings.fpts_total === 0 || isNaN(team.settings.fpts_total)
        );
        
        // It's preseason if either check indicates so
        setIsPreseason(isPreseasonByState || isPreseasonByPoints);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (leagueId) {
      checkSeasonAndFetchData();
    }
  }, [leagueId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading...
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

  // Render preseason rankings from previous season
  if (isPreseason && previousSeasonLeagueId) {
    return (
      <PreviousSeasonStandings 
        currentLeagueId={leagueId}
        previousLeagueId={previousSeasonLeagueId}
      />
    );
  }

  // Fallback to basic preseason message if no previous season ID provided
  if (isPreseason) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Preseason
            <Badge variant="secondary" className="text-xs">
              {seasonInfo?.season_type === 'pre' ? 'Preseason' : 'Offseason'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground">
            <p className="text-sm">Season hasn't started yet!</p>
            <p className="text-xs mt-2">Standings will appear once games begin.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render regular season standings
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          League Standings
          <Badge variant="outline" className="text-xs">
            Week {seasonInfo?.week || '?'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {standings.map((team) => (
            <div 
              key={team.roster_id}
              className="flex items-center justify-between p-2 hover:bg-muted/30 rounded transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  {team.rank}
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {team.user?.display_name || team.user?.metadata?.team_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {team.settings.wins}-{team.settings.losses}
                    {team.settings.ties > 0 && `-${team.settings.ties}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {team.settings.fpts_total?.toFixed(1) || '0.0'}
                </div>
                <div className="text-xs text-muted-foreground">pts</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}