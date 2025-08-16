"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { urlFor, type NewsArticle } from '@/lib/sanity';
import { Calendar, ArrowLeft, Newspaper, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SeasonData {
  season: string;
  count: number;
}

interface SeasonalNewsPageProps {
  initialArticles: NewsArticle[];
  seasons: SeasonData[];
  currentSeason: string;
}

export default function SeasonalNewsPage({ 
  initialArticles, 
  seasons, 
  currentSeason 
}: SeasonalNewsPageProps) {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch articles for a specific season
  const fetchSeasonArticles = async (season: string) => {
    if (season === selectedSeason) return; // Don't fetch if already selected

    setLoading(true);
    try {
      const response = await fetch(`/api/news/season/${season}`);
      if (response.ok) {
        const seasonArticles = await response.json();
        setArticles(seasonArticles);
        setSelectedSeason(season);
      }
    } catch (error) {
      console.error('Error fetching season articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Season Sidebar */}
      <div className={cn(
        "border-r transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-12" : "w-64"
      )}>
        <div className="sticky top-0 h-screen bg-background border-r">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="font-semibold text-lg">Seasons</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-8 w-8 p-0"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Season List */}
          <div className="p-2">
            {seasons.map((seasonData) => {
              const isSelected = seasonData.season === selectedSeason;
              const isCurrent = seasonData.season === currentSeason;
              
              return (
                <button
                  key={seasonData.season}
                  onClick={() => fetchSeasonArticles(seasonData.season)}
                  disabled={loading}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md mb-1 transition-colors",
                    "flex items-center justify-between",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/60",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                  title={sidebarCollapsed ? `${seasonData.season} (${seasonData.count} articles)` : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {sidebarCollapsed ? seasonData.season.slice(-2) : seasonData.season}
                    </span>
                    {isCurrent && !sidebarCollapsed && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {isCurrent && sidebarCollapsed && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        isSelected && "border-primary-foreground/30 text-primary-foreground/90"
                      )}
                    >
                      {seasonData.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Newspaper className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">
                    {selectedSeason} Season News
                  </h1>
                  <p className="text-muted-foreground">
                    {selectedSeason === currentSeason ? 'Latest news from the current season' : `News from the ${selectedSeason} season`}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="ml-2">
                {articles.length} article{articles.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading {selectedSeason} articles...</p>
            </div>
          )}

          {/* Articles */}
          {!loading && (
            <>
              {articles.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">No articles for {selectedSeason}</h2>
                    <p className="text-muted-foreground">
                      {selectedSeason === currentSeason 
                        ? "No news articles have been published yet this season."
                        : `No news articles found for the ${selectedSeason} season.`
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
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
                              </div>
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}