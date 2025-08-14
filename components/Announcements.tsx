"use client";

import { PortableText } from '@portabletext/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Announcement } from '@/lib/sanity';
import { AlertCircle, Info, AlertTriangle, Megaphone } from 'lucide-react';

const priorityConfig = {
  low: { 
    icon: Info, 
    color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800', 
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
  },
  normal: { 
    icon: Megaphone, 
    color: 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800', 
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
  },
  high: { 
    icon: AlertTriangle, 
    color: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800', 
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
  },
  urgent: { 
    icon: AlertCircle, 
    color: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800', 
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
  },
};

interface AnnouncementsProps {
  announcements: Announcement[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  if (announcements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Commissioner Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">The commissioner is quiet... for now 🤔</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement, index) => {
        const config = priorityConfig[announcement.priority];
        const Icon = config.icon;
        
        // Fun commissioner messages based on priority
        const commissionerSays = {
          low: "Commissioner whispers 💬",
          normal: "Commissioner says 📢", 
          high: "Commissioner declares ⚡",
          urgent: "🚨 COMMISSIONER ALERT 🚨"
        };
        
        return (
          <Card key={announcement._id} className={`${config.color} border`}>
            <CardHeader>
              <div className="text-center mb-2">
                <span className="text-sm text-muted-foreground font-medium">
                  {commissionerSays[announcement.priority]}
                </span>
              </div>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="text-base font-semibold">
                    {announcement.title}
                  </span>
                </div>
                <Badge className={config.badge}>
                  {announcement.priority.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <PortableText 
                  value={announcement.content}
                  components={{
                    block: {
                      normal: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                      h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-md font-semibold mb-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
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
                  }}
                />
              </div>
              <div className="mt-3 pt-2 border-t border-current/10">
                <p className="text-xs text-muted-foreground">
                  Posted {new Date(announcement.publishedAt).toLocaleDateString()}
                  {announcement.expiresAt && (
                    <span> • Expires {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}