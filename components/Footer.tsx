// components/Footer.tsx
import { ApiStatus } from "./ApiStatus";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t mt-8">
      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left side - Copyright and attribution */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear} toricook</span>
            <span className="hidden sm:inline">•</span>
            <span>Powered by 
              <a 
                href="https://docs.sleeper.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground hover:underline ml-1"
              >
                Sleeper API
              </a>
            </span>
          </div>

          {/* Center - Status indicator */}
          <div className="flex items-center gap-2">
            <ApiStatus />
          </div>

          {/* Right side - Links */}
          <div className="flex items-center gap-4 text-sm">
            <a 
              href="https://github.com/toricook/sleeper-api-client" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Use my Sleeper API client library!
            </a>
            <span className="text-muted-foreground">•</span>
            <a 
              href="https://github.com/toricook/fantasy-football-2/issues/new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Report a bug
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}