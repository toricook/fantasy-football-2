// app/news/page.tsx
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import SeasonalNewsPage from "@/components/SeasonalNewsPage";
import { client, type NewsArticle } from '@/lib/sanity';

const CURRENT_SEASON = new Date().getFullYear().toString();

// Define the SeasonData interface
interface SeasonData {
  season: string;
  count: number;
}

async function getCurrentSeasonNews(): Promise<NewsArticle[]> {
  try {
    const news = await client.fetch(`
      *[_type == "newsArticle" && season == $season && isPublished == true] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        featuredImage,
        category,
        tags,
        author,
        publishedAt,
        season,
        content
      }
    `, { season: CURRENT_SEASON })
    
    console.log('=== CURRENT SEASON NEWS FETCH ===');
    console.log('Season:', CURRENT_SEASON);
    console.log('Count:', news.length);
    console.log('Articles:', news.map((article: NewsArticle) => ({ 
      title: article.title, 
      category: article.category,
      season: (article as any).season 
    })));
    return news;
  } catch (error) {
    console.error('Error fetching current season news:', error);
    return [];
  }
}

async function getAvailableSeasons(): Promise<SeasonData[]> {
  try {
    const seasons = await client.fetch(`
      *[_type == "newsArticle" && isPublished == true] {
        season
      } | order(season desc)
    `);

    // Count articles per season and remove duplicates
    const seasonCounts: Record<string, number> = seasons.reduce((acc: Record<string, number>, article: any) => {
      const season = article.season || CURRENT_SEASON;
      acc[season] = (acc[season] || 0) + 1;
      return acc;
    }, {} as Record<string, number>); // Explicitly type the initial value

    // Convert to array and sort by year (newest first)
    const seasonData: SeasonData[] = Object.entries(seasonCounts)
      .map(([season, count]: [string, number]) => ({ 
        season, 
        count 
      }))
      .sort((a, b) => parseInt(b.season) - parseInt(a.season));

    console.log('=== AVAILABLE SEASONS ===');
    console.log('Seasons:', seasonData);
    
    return seasonData;
  } catch (error) {
    console.error('Error fetching available seasons:', error);
    return [{ season: CURRENT_SEASON, count: 0 }];
  }
}

export default async function NewsPageRoute() {
  const [currentSeasonNews, seasons] = await Promise.all([
    getCurrentSeasonNews(),
    getAvailableSeasons()
  ]);

  return (
    <div>
      <Navbar />
      <SeasonalNewsPage 
        initialArticles={currentSeasonNews}
        seasons={seasons}
        currentSeason={CURRENT_SEASON}
      />
      <Footer />
    </div>
  );
}