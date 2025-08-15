import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import SmartStandings from '@/components/SmartStandings';
import SmartMatchups from "@/components/SmartMatchups";
import Announcements from "@/components/Announcements";
import News from "@/components/News";
import { client } from '@/lib/sanity';
import { Debug } from "@prisma/client/runtime/library";
import DebugSession from "@/components/DebugSession";
import { auth } from "@/lib/auth";

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
    console.log('=== ANNOUNCEMENTS FETCH ===');
    console.log('Count:', announcements.length);
    console.log('Data:', announcements);
    return announcements;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

async function getRecentNews() {
  try {
    const news = await client.fetch(`
      *[_type == "newsArticle" && isPublished == true] | order(publishedAt desc) [0...8] {
        _id,
        title,
        slug,
        excerpt,
        featuredImage,
        category,
        author,
        publishedAt
      }
    `)
    console.log('=== NEWS FETCH ===');
    console.log('Count:', news.length);
    console.log('Data:', news);
    return news;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function HomePage() {
  console.log('=== HOMEPAGE SERVER RENDER ===');
  console.log('Fetching content...');

  // ADD THIS DEBUG SECTION
  const session = await auth();
  console.log('SESSION DEBUG:', {
    userId: session?.user?.id,
    email: session?.user?.email,
    leagueId: session?.user?.leagueId,
    claimedMemberId: session?.user?.claimedMemberId,
    claimedMemberName: session?.user?.claimedMemberName,
    role: session?.user?.role
  });
  const [announcements, recentNews] = await Promise.all([
    getAnnouncements(),
    getRecentNews()
  ]);

  console.log('=== FINAL RESULTS ===');
  console.log('Announcements:', announcements.length);
  console.log('News articles:', recentNews.length);

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

          {/* Middle Column - News */}
          <div className="order-2 lg:order-2">
            <News articles={recentNews} showViewAll={true} />
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