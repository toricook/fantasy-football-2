"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { urlFor, type NewsArticle } from '@/lib/sanity';
import { Calendar, ArrowRight, Newspaper, User } from 'lucide-react';

const categoryColors = {
  league: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  trade: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  injury: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  waiver: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  tips: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

interface NewsProps {
  articles: NewsArticle[];
  showViewAll?: boolean;
}

// Helper function to create snippet from content
function createSnippet(content: any, length: number = 150): string {
  if (!content || !Array.isArray(content)) return '';
  
  // Extract text from Sanity's portable text format
  const textBlocks = content
    .filter(block => block._type === 'block' && block.children)
    .flatMap(block => block.children)
    .filter(child => child._type === 'span' && child.text)
    .map(child => child.text)
    .join(' ');
  
  if (textBlocks.length <= length) return textBlocks;
  
  // Find the last complete word before the length limit
  const truncated = textBlocks.substring(0, length);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

export default function News({ articles, showViewAll = true }: NewsProps) {
  if (articles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground">
            <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No news articles yet</p>
            <p className="text-xs mt-1">Check back later for updates!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Latest News
          </div>
          {showViewAll && (
            <Link href="/news">
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {articles.map((article, index) => (
          <div 
            key={article._id}
            className={`space-y-3 ${index < articles.length - 1 ? 'pb-4 border-b' : ''}`}
          >
            {/* Featured image for first article only */}
            {index === 0 && article.featuredImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img 
                  src={urlFor(article.featuredImage).url()}
                  alt={article.featuredImage.alt || article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2">
                  <Badge className={categoryColors[article.category as keyof typeof categoryColors]}>
                    {article.category}
                  </Badge>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {/* Title */}
              <Link 
                href={`/news/${article.slug.current}`}
                className="block group"
              >
                <h3 className="font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
              </Link>
              
              {/* Article snippet/excerpt */}
              {(() => {
                
                const snippet = createSnippet(article.content, 120);
                
                return snippet ? (
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {snippet}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground leading-relaxed text-red-500">
                    [Debug: No content - Keys: {Object.keys(article).join(', ')}]
                  </div>
                );
              })()}
              
              {/* Meta information */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{article.author}</span>
                </div>
                
                <Link 
                  href={`/news/${article.slug.current}`}
                  className="text-primary hover:underline ml-auto"
                >
                  Read more →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}