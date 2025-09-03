"use client";

import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { urlFor, type NewsArticle } from '@/lib/sanity';
import { Calendar, ArrowLeft, User, Tag, Share2 } from 'lucide-react';

const categoryColors = {
  league: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  trade: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  injury: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  waiver: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  tips: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

interface ArticlePageProps {
  article: NewsArticle;
}

export default function ArticlePage({ article }: ArticlePageProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link href="/news">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {article.featuredImage && (
            <div className="relative h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden mb-8">
              <img
                src={urlFor(article.featuredImage).width(1200).height(600).url()}
                alt={article.featuredImage.alt || article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <Badge className={`${categoryColors[article.category as keyof typeof categoryColors]} text-sm`}>
                  {article.category}
                </Badge>
              </div>
            </div>
          )}

          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* Article Header */}
              <header className="mb-8">
                {!article.featuredImage && (
                  <div className="mb-4">
                    <Badge className={categoryColors[article.category as keyof typeof categoryColors]}>
                      {article.category}
                    </Badge>
                  </div>
                )}
                
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                  {article.title}
                </h1>
                
                {article.excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-border pb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{article.author}</span>
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <div className="flex gap-1 flex-wrap">
                        {article.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </header>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
<PortableText 
  value={article.content}
  components={{
    block: {
      normal: ({children}) => <p className="mb-4">{children}</p>,
      h1: ({children}) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
      h2: ({children}) => <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>,
      h3: ({children}) => <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>,
      blockquote: ({children}) => (
        <blockquote className="border-l-4 border-primary pl-6 py-2 my-6 bg-muted/30 rounded-r-lg">
          <div className="italic text-muted-foreground">{children}</div>
        </blockquote>
      ),
    },
    list: {
      bullet: ({children}) => (
        <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
          {children}
        </ul>
      ),
      number: ({children}) => (
        <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({children}) => (
        <li className="mb-1 leading-relaxed">{children}</li>
      ),
      number: ({children}) => (
        <li className="mb-1 leading-relaxed">{children}</li>
      ),
    },
    marks: {
      strong: ({children}) => <strong className="font-bold">{children}</strong>,
      em: ({children}) => <em className="italic">{children}</em>,
      link: ({value, children}) => {
        const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
        return (
          <a 
            href={value?.href} 
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className="text-primary underline hover:no-underline"
          >
            {children}
          </a>
        );
      },
    },
  }}
/>
              </div>

              {/* Article Footer */}
              <footer className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Published by <span className="font-medium">{article.author}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href="/news">
                      <Button variant="outline" size="sm">
                        More Articles
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" size="sm">
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </footer>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}
