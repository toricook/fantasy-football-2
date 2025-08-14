import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import NewsPage from "@/components/NewsPage";
import { client, type NewsArticle } from '@/lib/sanity';

async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const news = await client.fetch(`
      *[_type == "newsArticle" && isPublished == true] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        featuredImage,
        category,
        tags,
        author,
        publishedAt,
        content
      }
    `)
    console.log('=== ALL NEWS FETCH ===');
    console.log('Count:', news.length);
    console.log('Articles:', news.map((article: NewsArticle) => ({ title: article.title, category: article.category })));
    return news;
  } catch (error) {
    console.error('Error fetching all news:', error);
    return [];
  }
}

export default async function NewsPageRoute() {
  const allNews = await getAllNews();

  return (
    <div>
      <Navbar />
      <NewsPage articles={allNews} />
      <Footer />
    </div>
  );
}