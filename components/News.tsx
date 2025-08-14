"use client";

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { urlFor, type NewsArticle } from '@/lib/sanity';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';

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
            className={`space-y-3 ${index < articles.length - 1 ? 'border-b border-border pb-4' : ''}`}
          >
            {/* Featured article (first one) gets special treatment */}
            {index === 0 && article.featuredImage && (
              <div className="relative h-32 rounded-lg overflow-hidden">
                <img
                  src={urlFor(article.featuredImage).width(600).height(200).url()}
                  alt={article.featuredImage.alt || article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <Badge className={categoryColors[article.category as keyof typeof categoryColors]}>
                    {article.category}
                  </Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/news/${article.slug.current}`}
                    className="block group"
                  >
                    <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>
                  
                  {article.excerpt && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
                
                {/* Show category badge for non-featured articles */}
                {index > 0 && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs flex-shrink-0 ${categoryColors[article.category as keyof typeof categoryColors]}`}
                  >
                    {article.category}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString()}
                </time>
                <span>•</span>
                <span>{article.author}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}