// app/news/[slug]/loading.tsx - Individual article loading
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import { ArrowLeft, Share2, Calendar, User, Tag } from "lucide-react";

export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
            </div>
            
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto">
          {/* Featured Image Placeholder */}
          <div className="relative h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden mb-8 bg-muted animate-pulse">
            <div className="absolute bottom-6 left-6">
              <div className="h-6 w-16 bg-muted-foreground/20 animate-pulse rounded"></div>
            </div>
          </div>

          <div className="border-0 shadow-none">
            <div className="p-0">
              {/* Article Header */}
              <header className="mb-8">
                <div className="mb-4">
                  <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                </div>
                
                {/* Title */}
                <div className="space-y-2 mb-4">
                  <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-10 w-3/4 bg-muted animate-pulse rounded"></div>
                </div>
                
                {/* Excerpt */}
                <div className="space-y-2 mb-6">
                  <div className="h-5 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-5 w-5/6 bg-muted animate-pulse rounded"></div>
                  <div className="h-5 w-2/3 bg-muted animate-pulse rounded"></div>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-sm border-b border-border pb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-1 flex-wrap">
                      <div className="h-4 w-12 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-10 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
              </header>

              {/* Article Content Loading */}
              <div className="space-y-6">
                {/* Loading Message */}
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-sm">Loading article...</p>
                </div>

                {/* Content Paragraphs */}
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-4/5 bg-muted animate-pulse rounded"></div>
                  </div>
                ))}

                {/* Quote block placeholder */}
                <div className="border-l-4 border-primary pl-6 py-2 my-6 bg-muted/30 rounded-r-lg">
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>

                {/* More content paragraphs */}
                {[...Array(4)].map((_, i) => (
                  <div key={`second-${i}`} className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
                  </div>
                ))}

                {/* Image placeholder */}
                <figure className="my-8">
                  <div className="h-64 bg-muted animate-pulse rounded-lg shadow-md w-full"></div>
                  <div className="text-center mt-2">
                    <div className="h-3 w-48 bg-muted animate-pulse rounded mx-auto"></div>
                  </div>
                </figure>
              </div>

              {/* Article Footer */}
              <footer className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                  
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 w-28 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}