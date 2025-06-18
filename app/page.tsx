"use client";

import Standings from "@/components/Standings";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
    <h1 className="text-3xl font-bold mb-8 text-center">My Fantasy Football League</h1>

    {/* Top Bar */}
    <div className="bg-gray-100 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Latest Announcement</h2>
    </div>

    
    <div className="grid gap-6" style={{gridTemplateColumns: '1fr 2fr 1fr'}}>
      {/* Left Column */}
      <Standings leagueId="1124817707527573504"/>

      {/* Middle Column */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">News Feed</h2>
        <p>This might be recent matchups or news.</p>
        <p>Another line of placeholder text here.</p>
      </div>

      {/* Right Column */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Upcoming Matches</h2>
        <p>This could be upcoming games or league info.</p>
        <p>More placeholder content for testing.</p>
      </div>
    </div>
  </div>
  );
}
