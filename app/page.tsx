import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import SmartStandings from '@/components/SmartStandings';
import SmartMatchups from "@/components/SmartMatchups";
import Announcements from "@/components/Announcements";
import News from "@/components/News";
import PlayoffPicture from "@/components/PlayoffPicture";
import { client } from '@/lib/sanity';
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'


export const revalidate = 60;

const leagueId = process.env.LEAGUE_ID!;
const previousLeagueId = process.env.LAST_SEASON_LEAGUE_ID!;

async function getAnnouncements() {
  try {
    const announcements = await client.fetch(`
      *[_type == "announcement" && isActive == true && publishedAt <= now() && (expiresAt == null || expiresAt > now())] | order(priority desc, publishedAt desc) [0...3] {
        _id,
        title,
        content,
        priority,
        publishedAt,
        expiresAt
      }
    `)
    return announcements;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

async function getRecentNews() {
  try {
    const currentSeason = new Date().getFullYear().toString();
    const news = await client.fetch(`
      *[_type == "newsArticle" && isPublished == true && season == $currentSeason] | order(publishedAt desc) [0...8] {
        _id,
        title,
        slug,
        featuredImage,
        content,
        category,
        author,
        publishedAt,
        season
      }
    `, { currentSeason })
    
    return news;
  } catch (error) {
    console.error('Error fetching current season news:', error);
    return [];
  }
}

export default async function HomePage() {

  const session = await auth()
  
  if (!session?.user?.leagueId) {
    redirect('/login')
  }
  
  if (!session?.user?.claimedMemberId) {
    redirect('/claim-profile')
  }

  const [announcements, recentNews] = await Promise.all([
    getAnnouncements(),
    getRecentNews()
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Commissioner Announcements - Full Width */}
      <div className="container mx-auto px-4 py-6">
        <Announcements announcements={announcements} />
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6">
          
          {/* Left Column - Standings */}
          <div className="order-1 lg:order-1">
            <SmartStandings 
              leagueId={leagueId} 
              previousSeasonLeagueId={previousLeagueId}
            />
          </div>

          {/* Middle Column - News and Playoff Picture */}
          <div className="order-2 lg:order-2 space-y-6">
            {/* News Section */}
            <div>
              <News articles={recentNews} showViewAll={true} />
            </div>
            
            {/* Playoff Picture Section */}
            <div>
              <PlayoffPicture 
                leagueId={leagueId} 
                previousSeasonLeagueId={previousLeagueId}
              />
            </div>
          </div>

          {/* Right Column - Matchups */}
          <div className="order-3 lg:order-3">
            <SmartMatchups leagueId={leagueId} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
