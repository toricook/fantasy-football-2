// app/news/loading.tsx - News page loading
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import { Newspaper, ArrowLeft, Calendar, User, Tag } from "lucide-react";

export default function NewsLoading() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-muted-foreground" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-6 w-16 bg-muted animate-pulse rounded ml-2"></div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center mb-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading news articles...</p>
        </div>

        {/* Articles Loading */}
        <div className="grid gap-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              {/* Featured Image for first article */}
              {index === 0 && (
                <div className="relative h-48 sm:h-64 bg-muted animate-pulse">
                  <div className="absolute bottom-4 left-4">
                    <div className="h-6 w-16 bg-muted-foreground/20 animate-pulse rounded"></div>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="space-y-4">
                  {/* Article Header */}
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="block group mb-2">
                          <div className="h-6 w-full bg-muted animate-pulse rounded mb-2"></div>
                          <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
                        </div>
                        
                        {/* Excerpt */}
                        <div className="space-y-2 mt-2">
                          <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                      
                      {/* Category badge for articles without featured images */}
                      {index > 0 && (
                        <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                      )}
                    </div>

                    {/* Meta information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <div className="flex gap-1">
                          <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                          <div className="h-4 w-8 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Article Content Preview */}
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-4/5 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-3/5 bg-muted animate-pulse rounded"></div>
                    
                    <div className="mt-4">
                      <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show that more content is loading */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin"></div>
            Loading more articles...
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}