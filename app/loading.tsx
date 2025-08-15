import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import { Megaphone, Newspaper, Users, Calendar } from "lucide-react";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Commissioner Announcements - Full Width */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          <div className="border rounded-xl p-6 bg-muted/20">
            <div className="text-center mb-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded mx-auto"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-muted-foreground" />
                <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="mt-3 pt-2 border-t border-current/10">
              <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6">
          
          {/* Left Column - Standings */}
          <div className="order-1 lg:order-1">
            <div className="border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-muted animate-pulse rounded"></div>
                  <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="h-5 w-12 bg-muted animate-pulse rounded"></div>
              </div>
              
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-muted animate-pulse rounded-full"></div>
                      <div>
                        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 w-12 bg-muted animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-8 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - News */}
          <div className="order-2 lg:order-2">
            <div className="border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-muted-foreground" />
                  <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              </div>
              
              <div className="space-y-4">
                {/* Featured article */}
                <div className="space-y-3 border-b border-border pb-4">
                  <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-5 w-3/4 bg-muted animate-pulse rounded"></div>
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded"></div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                      <span className="text-muted-foreground">•</span>
                      <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
                
                {/* Other articles */}
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`space-y-2 ${i < 3 ? 'border-b border-border pb-4' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="h-4 w-full bg-muted animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-muted animate-pulse rounded mb-1"></div>
                        <div className="h-3 w-1/2 bg-muted animate-pulse rounded"></div>
                      </div>
                      <div className="h-5 w-12 bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                      <span className="text-muted-foreground">•</span>
                      <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Matchups */}
          <div className="order-3 lg:order-3">
            <div className="border rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
              </div>
              
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                      <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
                    </div>

                    <div className="space-y-3">
                      {/* Team 1 */}
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                        <div>
                          <div className="h-4 w-24 bg-muted animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 w-12 bg-muted animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-8 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>

                      {/* VS divider */}
                      <div className="text-center text-xs text-muted-foreground font-medium">
                        VS
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                        <div>
                          <div className="h-4 w-20 bg-muted animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-14 bg-muted animate-pulse rounded"></div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 w-12 bg-muted animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-8 bg-muted animate-pulse rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}