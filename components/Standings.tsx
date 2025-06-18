// components/Standings.tsx
import { useState, useEffect } from 'react';
import SleeperAPI, { StandingTeam } from 'sleeper-api-client';

interface StandingsProps {
  leagueId: string;
}

export default function Standings({ leagueId }: StandingsProps) {
  const [standings, setStandings] = useState<StandingTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        const sleeper = new SleeperAPI();
        const standings = await sleeper.getLeagueStandings(leagueId);
        setStandings(standings);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (leagueId) {
      fetchStandings();
    }
  }, [leagueId]);

  if (loading) return <div>Loading standings...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">League Standings</h2>
      <ol>
        {standings.map((team) => (
          <li key={team.roster_id}>
            <span className="rank">#{team.rank}</span>{' '}
            <span className="team-name">
              {team.user?.display_name || team.user?.metadata?.team_name || 'Unknown'}
            </span>{' '}
            <span className="record">
              ({team.settings.wins}-{team.settings.losses}
              {team.settings.ties > 0 && `-${team.settings.ties}`})
            </span>{' '}
            <span className="points">
              {team.settings.fpts_total} pts
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}