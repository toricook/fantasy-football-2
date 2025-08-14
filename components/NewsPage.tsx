"use client";

import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { urlFor, type NewsArticle } from '@/lib/sanity';
import { Calendar, ArrowLeft, Newspaper, User, Tag } from 'lucide-react';

const categoryColors = {
  league: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  trade: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  injury: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  waiver: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  tips: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

interface NewsPageProps {
  articles: NewsArticle[];
}

export default function NewsPage({ articles }: NewsPageProps) {
  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Newspaper className="w-8 h-8" />
            <h1 className="text-3xl font-bold">League News</h1>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No news articles yet</h2>
            <p className="text-muted-foreground">Check back later for league updates!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8" />
          <h1 className="text-3xl font-bold">League News</h1>
          <Badge variant="outline" className="ml-2">
            {articles.length} article{articles.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Articles */}
      <div className="grid gap-8">
        {articles.map((article, index) => (
          <Card key={article._id} className="overflow-hidden">
            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative h-48 sm:h-64">
                <img
                  src={urlFor(article.featuredImage).width(800).height(400).url()}
                  alt={article.featuredImage.alt || article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <Badge className={categoryColors[article.category as keyof typeof categoryColors]}>
                    {article.category}
                  </Badge>
                </div>
              </div>
            )}

            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Article Header */}
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <Link 
                        href={`/news/${article.slug.current}`}
                        className="block group"
                      >
                        <h2 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">
                          {article.title}
                        </h2>
                      </Link>
                      
                      {article.excerpt && (
                        <p className="text-muted-foreground leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    
                    {/* Category badge for articles without featured images */}
                    {!article.featuredImage && (
                      <Badge className={categoryColors[article.category as keyof typeof categoryColors]}>
                        {article.category}
                      </Badge>
                    )}
                  </div>

                  {/* Meta information */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={article.publishedAt}>
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>

                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <div className="flex gap-1">
                          {article.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Article Content Preview */}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <PortableText 
                    value={article.content.slice(0, 3)} // Show first 3 blocks as preview
                    components={{
                      block: {
                        normal: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        h1: ({children}) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                        h2: ({children}) => <h4 className="text-md font-semibold mb-2">{children}</h4>,
                        h3: ({children}) => <h5 className="text-sm font-medium mb-1">{children}</h5>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-primary pl-4 italic my-2">{children}</blockquote>,
                      },
                      marks: {
                        strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                        em: ({children}) => <em className="italic">{children}</em>,
                        link: ({children, value}) => (
                          <a href={value.href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      },
                      types: {
                        image: ({value}) => (
                          <div className="my-4">
                            <img
                              src={urlFor(value).width(600).url()}
                              alt={value.alt || ''}
                              className="rounded-lg"
                            />
                          </div>
                        ),
                      },
                    }}
                  />
                  
                  {article.content.length > 3 && (
                    <div className="mt-4">
                      <Link href={`/news/${article.slug.current}`}>
                        <Button variant="outline" size="sm">
                          Read Full Article →
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}