import { useEffect, useState } from "react"

interface MatchupProps {
    leagueId: string,
    week: number
}

export function UpcomingMatchups({leagueId, week} : MatchupProps) {

    const [ matchups, setMatchups ] = useState([])
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    if (loading) return <div>Loading standings...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>Upcoming</div>
    )
}

export function CompletedMatchups({leagueId, week} : MatchupProps) {
    return (
        <div>Completed</div>
    )
}