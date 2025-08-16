"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Calendar, Crown, Medal, Target } from "lucide-react";

interface SeasonTeam {
  year: string;
  memberNames: string[]; // Changed to array for co-owners
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
  teams: SeasonTeam[];
  champion: SeasonTeam | null;
}

interface ArchiveDisplayProps {
  archiveData: YearlyData[];
}

function formatRecord(wins: number | null, losses: number | null, ties: number | null): string {
  if (wins === null || losses === null) return 'N/A';
  const baseRecord = `${wins}-${losses}`;
  return ties && ties > 0 ? `${baseRecord}-${ties}` : baseRecord;
}

function formatPoints(points: number | null): string {
  if (points === null) return 'N/A';
  return points.toFixed(1);
}

function getRankBadgeVariant(rank: number | null) {
  if (!rank) return 'outline';
  if (rank === 1) return 'default'; // Gold for champion
  if (rank <= 3) return 'secondary'; // Silver for top 3
  return 'outline';
}

function getRankIcon(rank: number | null) {
  if (!rank) return null;
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-600" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-500" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
  return null;
}

function formatOwners(memberNames: string[]): string {
  if (memberNames.length === 1) {
    return memberNames[0];
  }
  if (memberNames.length === 2) {
    return memberNames.join(' & ');
  }
  // For 3+ owners (rare case)
  return memberNames.slice(0, -1).join(', ') + ' & ' + memberNames[memberNames.length - 1];
}

function StandingsTable({ teams, title }: { teams: SeasonTeam[]; title?: string }) {
  return (
    <div className="space-y-2">
      {title && (
        <h4 className="font-semibold text-lg text-primary">{title}</h4>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead className="w-[300px]">Team</TableHead>
            <TableHead className="w-[250px]">Owner(s)</TableHead>
            <TableHead className="w-20 text-center">Record</TableHead>
            <TableHead className="w-24 text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow 
              key={`${team.memberNames.join('-')}-${index}`}
              className={team.finalRank === 1 ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {getRankIcon(team.finalRank)}
                  <Badge 
                    variant={getRankBadgeVariant(team.finalRank)}
                    className="text-xs"
                  >
                    #{team.finalRank || '?'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {team.teamName || 'No team name'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {team.finalRank === 1 && <Crown className="w-4 h-4 text-yellow-600" />}
                  <span>
                    {formatOwners(team.memberNames)}
                  </span>
                  {team.memberNames.length > 1 && (
                    <Badge variant="outline" className="text-xs">
                      Co-owned
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="font-mono text-sm">
                  {formatRecord(team.wins, team.losses, team.ties)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-mono text-sm">
                  {formatPoints(team.totalPoints)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function YearCard({ yearData }: { yearData: YearlyData }) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <div>
              <CardTitle className="text-2xl">{yearData.year} Season</CardTitle>
              {yearData.leagueName && (
                <p className="text-muted-foreground text-sm mt-1">
                  {yearData.leagueName}
                </p>
              )}
            </div>
          </div>
          
          {yearData.champion && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Champion
              </div>
              <div className="text-sm text-muted-foreground">
                {formatOwners(yearData.champion.memberNames)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatRecord(yearData.champion.wins, yearData.champion.losses, yearData.champion.ties)} • {formatPoints(yearData.champion.totalPoints)} pts
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {yearData.hasDivisions && yearData.divisions ? (
          // Show division-based standings
          <div className="space-y-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" />
              <h3 className="text-xl font-semibold">Final Standings by Division</h3>
            </div>
            
            {Object.entries(yearData.divisions).map(([divisionName, divisionTeams]) => (
              <StandingsTable 
                key={divisionName}
                teams={divisionTeams}
                title={divisionName}
              />
            ))}
          </div>
        ) : (
          // Show league-wide standings
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" />
              <h3 className="text-xl font-semibold">Final Standings</h3>
            </div>
            
            <StandingsTable teams={yearData.teams} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ArchiveDisplay({ archiveData }: ArchiveDisplayProps) {
  if (archiveData.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <h1 className="text-3xl font-bold">League Archive</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Historical league standings and champions
          </p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No archive data available</h2>
            <p className="text-muted-foreground">
              Historical league data will appear here once seasons are completed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8" />
          <h1 className="text-3xl font-bold">League Archive</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Historical league standings and champions from past seasons
        </p>
        
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {archiveData.length} Season{archiveData.length !== 1 ? 's' : ''}
          </Badge>
          
          <div className="text-sm text-muted-foreground">
            {archiveData[0]?.year} - {archiveData[archiveData.length - 1]?.year}
          </div>
        </div>
      </div>

      {/* Archive Data */}
      <div>
        {archiveData.map((yearData) => (
          <YearCard key={yearData.year} yearData={yearData} />
        ))}
      </div>

      {/* Footer Summary */}
      <Card className="mt-8 bg-muted/30">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">League History Summary</h3>
            <p className="text-sm text-muted-foreground">
              {archiveData.length} seasons completed • {' '}
              {archiveData.reduce((total, year) => total + year.teams.length, 0)} total team records • {' '}
              Champions from {archiveData[archiveData.length - 1]?.year} to {archiveData[0]?.year}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}