import { notFound } from 'next/navigation';
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import { client, type NewsArticle } from '@/lib/sanity';
import ArticlePage from '@/components/ArticlePage';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getArticle(slug: string): Promise<NewsArticle | null> {
  try {
    const article = await client.fetch(`
      *[_type == "newsArticle" && slug.current == $slug && isPublished == true][0] {
        _id,
        title,
        slug,
        excerpt,
        featuredImage,
        content,
        category,
        tags,
        author,
        publishedAt
      }
    `, { slug });
    
    console.log('=== INDIVIDUAL ARTICLE FETCH ===');
    console.log('Slug:', slug);
    console.log('Found:', !!article);
    if (article) {
      console.log('Title:', article.title);
    }
    
    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default async function ArticlePageRoute({ params }: ArticlePageProps) {
  const { slug } = await params; // Await params here
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <Navbar />
      <ArticlePage article={article} />
      <Footer />
    </div>
  );
}