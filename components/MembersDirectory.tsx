"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Calendar, User, Target } from "lucide-react";

interface Award {
  id: string;
  name: string;
  icon: string;
  season: string;
}

interface Season {
  year: string;
  teamName: string | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
  finalRank: number | null;
  totalPoints: number | null;
}

interface Member {
  id: string;
  name: string;
  isCurrentlyActive: boolean;
  seasons: Season[];
  awards?: Award[];
}

interface MembersDirectoryProps {
  currentMembers: Member[];
  historicalMembers: Member[];
}

function MemberCard({ member }: { member: Member }) {
  const currentYear = "2025" // You can make this dynamic if needed
  const totalSeasons = member.seasons.length;
  const years = member.seasons.map(s => s.year).sort();
  const yearRange = years.length > 0 ? 
    (years.length === 1 ? years[0] : `${years[years.length - 1]}-${years[0]}`) : 
    'No seasons';

  // Separate current and historical seasons
  const currentSeason = member.seasons.find(s => s.year === currentYear);
  const historicalSeasons = member.seasons.filter(s => s.year !== currentYear);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{member.name}</span>
          {member.isCurrentlyActive && (
            <Badge variant="default" className="text-xs">
              Active
            </Badge>
          )}
        </CardTitle>
        
        {/* Current Season Team Name - prominently displayed */}
        {currentSeason && currentSeason.teamName && (
          <div className="text-center py-2">
            <div className="text-sm text-muted-foreground mb-1">{currentYear} Season</div>
            <div className="text-lg font-medium text-primary bg-primary/10 rounded-lg py-2 px-3">
              {currentSeason.teamName}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{yearRange}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{totalSeasons} season{totalSeasons !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {/* Awards Line - replaces championships and career stats */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Awards</h4>
          {member.awards && member.awards.length > 0 ? (
            <div className="flex flex-wrap gap-1 text-xl">
              {member.awards.map((award, index) => (
                <span 
                  key={award.id} 
                  title={`${award.name} (${award.season})`}
                  className="cursor-help hover:scale-110 transition-transform"
                >
                  {award.icon}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No awards yet
            </p>
          )}
        </div>

        {/* Season Details - only historical seasons */}
        {historicalSeasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Previous Seasons:</h4>
            <div className="space-y-1.5">
              {historicalSeasons
                .sort((a, b) => parseInt(b.year) - parseInt(a.year)) // Sort by year descending
                .map((season, index) => (
                <div key={`${season.year}-${index}`} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium min-w-[3rem]">{season.year}</span>
                    <span className="text-muted-foreground">
                      {season.teamName || 'No team name'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {season.wins !== null && season.losses !== null && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {season.wins}-{season.losses}{season.ties ? `-${season.ties}` : ''}
                      </span>
                    )}
                    {season.finalRank && (
                      <Badge 
                        variant={season.finalRank === 1 ? "default" : "outline"} 
                        className="text-xs"
                      >
                        #{season.finalRank}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show message if only current season and no historical data */}
        {historicalSeasons.length === 0 && currentSeason && (
          <div className="text-center text-sm text-muted-foreground py-2">
            First season in the league!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MembersDirectory({ currentMembers, historicalMembers }: MembersDirectoryProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">League Members</h1>
        <p className="text-muted-foreground">
          Current and historical members of the fantasy football league
        </p>
      </div>

      {/* Current Members */}
      {currentMembers.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Current Members</h2>
            <Badge variant="outline" className="ml-2">
              {currentMembers.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* Historical Members */}
      {historicalMembers.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Historical Members</h2>
            <Badge variant="outline" className="ml-2">
              {historicalMembers.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historicalMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {currentMembers.length === 0 && historicalMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Members Found</h3>
          <p className="text-muted-foreground">
            No league members have been added yet.
          </p>
        </div>
      )}
    </div>
  );
}