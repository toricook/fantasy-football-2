"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Calendar, Users, CheckCircle, AlertCircle, User } from 'lucide-react';

interface Season {
  year: string;
  teamName: string | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
  finalRank: number | null;
  totalPoints: number | null;
}

interface LeagueMember {
  id: string;
  displayName: string;
  source: string;
  seasons: Season[];
}

interface ClaimProfileFormProps {
  user: any;
  unclaimedMembers: LeagueMember[];
}

export default function ClaimProfileForm({ user, unclaimedMembers }: ClaimProfileFormProps) {
  const router = useRouter();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async () => {
    if (!selectedMemberId) {
      setError('Please select a profile to claim');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/claim-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: selectedMemberId
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to claim profile');
      }

      // Success! Redirect to home page
      router.push('/');
      router.refresh(); // Refresh to update auth state

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const selectedMember = unclaimedMembers.find(m => m.id === selectedMemberId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Claim Your Profile</h1>
          <p className="text-muted-foreground text-lg">
            Welcome to the league! Please select your profile from the list below to link your account 
            with your fantasy football history.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {unclaimedMembers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Profiles Available</h3>
              <p className="text-muted-foreground">
                All league member profiles have been claimed. Please contact your commissioner.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            
            {/* Member Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unclaimedMembers.map((member) => {
                const isSelected = selectedMemberId === member.id;
                const totalSeasons = member.seasons.length;
                const championships = member.seasons.filter(s => s.finalRank === 1).length;
                const totalWins = member.seasons.reduce((sum, s) => sum + (s.wins || 0), 0);
                const totalLosses = member.seasons.reduce((sum, s) => sum + (s.losses || 0), 0);
                const recentSeasons = member.seasons.slice(0, 3);

                return (
                  <Card 
                    key={member.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedMemberId(member.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{member.displayName}</CardTitle>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{totalSeasons} season{totalSeasons !== 1 ? 's' : ''}</span>
                        {championships > 0 && (
                          <>
                            <Trophy className="h-4 w-4 text-yellow-600" />
                            <span>{championships} championship{championships !== 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      
                      {/* Quick Stats */}
                      {totalSeasons > 0 && (
                        <div className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Career Record:</span>
                            <span className="font-medium">{totalWins}-{totalLosses}</span>
                          </div>
                          {(() => {
                            const bestFinish = Math.min(...member.seasons.filter(s => s.finalRank).map(s => s.finalRank!));
                            return bestFinish !== Infinity ? (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Best Finish:</span>
                                <span className="font-medium">#{bestFinish}</span>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {/* Recent Seasons */}
                      {recentSeasons.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-2">Recent Seasons:</h4>
                          <div className="space-y-1">
                            {recentSeasons.map((season, index) => (
                              <div key={`${season.year}-${index}`} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{season.year}</span>
                                  <span className="text-muted-foreground truncate">
                                    {season.teamName || 'No team name'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {season.wins !== null && season.losses !== null && (
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                      {season.wins}-{season.losses}{season.ties ? `-${season.ties}` : ''}
                                    </span>
                                  )}
                                  {season.finalRank && (
                                    <Badge 
                                      variant={season.finalRank === 1 ? "default" : "outline"} 
                                      className="text-xs h-5"
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

                      {totalSeasons === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          No season history available
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Selected Profile Details */}
            {selectedMember && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Selected: {selectedMember.displayName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    By claiming this profile, you'll gain access to all the fantasy history and 
                    statistics associated with {selectedMember.displayName}. This action cannot be undone.
                  </p>
                  
                  <Button 
                    onClick={handleClaim} 
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? 'Claiming Profile...' : `Claim ${selectedMember.displayName}'s Profile`}
                  </Button>
                </CardContent>
              </Card>
            )}

            {!selectedMember && (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Select a profile above to continue
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}