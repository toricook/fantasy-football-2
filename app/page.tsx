export default function HomePage() {
  return (
    <div>
      {/* Navigation */}
      <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
        Navbar Component
      </div>

      {/* Title */}
      <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
        Welcome to the League
      </div>

      {/* Commissioner Announcement */}
      <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
        CommissionerAnnouncement Component
      </div>

      {/* Main Layout Grid */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px', margin: '5px'}}>
        
        {/* Left Column - Standings */}
        <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
          Standings Component
        </div>

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
      <div style={{border: '1px solid black', padding: '10px', margin: '5px'}}>
        Footer Component
      </div>

    </div>
    
  );
}