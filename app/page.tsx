import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import SmartStandings from './../components/SmartStandings';

const leagueId = process.env.LEAGUE_ID!;
const previousLeagueId = process.env.LAST_SEASON_LEAGUE_ID!;

export default function HomePage() {
  return (
    <div>
      {/* Navigation */}
      <Navbar />

      {/* Commissioner Announcement */}
      <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
        CommissionerAnnouncement Component
      </div>

      {/* Main Layout Grid */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px', margin: '5px'}}>
        
        {/* Left Column - Standings */}
        <SmartStandings 
          leagueId={leagueId} 
          previousSeasonLeagueId={previousLeagueId}
        />

        {/* Middle Column - News */}
        <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
            News Component
        </div>

        {/* Right Column - Matchups */}
      <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
        Matchups Component
      </div>
      </div>

      {/* Footer*/}
      <Footer />

    </div>
    
  );
}