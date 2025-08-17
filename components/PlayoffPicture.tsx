"use client";

import { useState, useEffect } from 'react';
import SleeperAPI from 'sleeper-api-client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users } from "lucide-react";

interface PlayoffSettings {
  playoff_teams: number;
  playoff_weeks: number;
  playoff_start_week: number;
  playoff_type: number; // 0 = standard bracket, 1 = round robin, etc.
}

interface PlayoffPictureProps {
  leagueId: string;
}

export default function PlayoffPicture({ leagueId }: PlayoffPictureProps) {
  const [playoffSettings, setPlayoffSettings] = useState<PlayoffSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasonInfo, setSeasonInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchLeagueSettings() {
      if (!leagueId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Call Sleeper API directly using the helper method
        const sleeper = new SleeperAPI();
        const playoffData = await sleeper.getPlayoffFormat(leagueId);

        setPlayoffSettings(playoffData.playoffSettings);
        setSeasonInfo(playoffData.seasonInfo);

      } catch (err: any) {
        console.error('Error fetching league settings:', err);
        const errorMessage = err.message || 'Failed to fetch playoff settings';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (leagueId) {
      fetchLeagueSettings();
    }
  }, [leagueId]);

  // Generate playoff structure based on settings
  const generatePlayoffStructure = () => {
    if (!playoffSettings) return null;

    const { playoff_teams, playoff_weeks, playoff_start_week } = playoffSettings;
    
    // Common playoff formats
    if (playoff_teams === 6 && playoff_weeks === 3) {
      return generate6TeamStructure(playoff_start_week);
    } else if (playoff_teams === 4 && playoff_weeks === 2) {
      return generate4TeamStructure(playoff_start_week);
    } else if (playoff_teams === 8 && playoff_weeks === 3) {
      return generate8TeamStructure(playoff_start_week);
    }
    
    // Default structure
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
          
          <div className="space-y-3">
            {[
              ['1st seed', '8th seed'],
              ['4th seed', '5th seed'],
              ['2nd seed', '7th seed'],
              ['3rd seed', '6th seed']
            ].map((matchup, i) => (
              <div key={i} className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 bg-muted/20">
                <div className="space-y-1 text-center">
                  <div className="bg-background border rounded p-1.5 text-xs">{matchup[0]}</div>
                  <div className="text-xs text-muted-foreground">vs</div>
                  <div className="bg-background border rounded p-1.5 text-xs">{matchup[1]}</div>
                </div>
              </div>
            ))}
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

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading Playoff Format...
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Playoff Format
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
      <CardContent className="overflow-auto max-h-[calc(50vh-80px)]">
        {playoffStructure || (
          <div className="text-center p-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm">Playoff format will be displayed here once league settings are loaded.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}