import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";

export default function MembersLoading() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 w-96 bg-muted animate-pulse rounded"></div>
        </div>

        {/* Current Members Loading */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-muted animate-pulse rounded"></div>
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-5 w-8 bg-muted animate-pulse rounded ml-2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-6 animate-pulse">
                <div className="h-6 w-32 bg-muted rounded mb-4"></div>
                <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                <div className="h-4 w-16 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded"></div>
                  <div className="h-3 w-3/4 bg-muted rounded"></div>
                  <div className="h-3 w-1/2 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}