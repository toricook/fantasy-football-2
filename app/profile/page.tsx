import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Crown, Heart, User, Users } from 'lucide-react';

const prisma = new PrismaClient();

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

async function getCurrentUser() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { 
        id: session.user.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        role: true,
        birthdayMonth: true,
        birthdayDay: true,
        favoriteTeam: true,
        bio: true,
        joinedAt: true,
        league: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      redirect('/login');
    }

    // Use claimed member name from session, fallback to user data
    const displayName = session.user.claimedMemberName || user.displayName || user.name || 'Unknown User';

    return {
      ...user,
      displayName // Override with the claimed member name
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    redirect('/login');
  }
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  // displayName is now the claimed member name
  const displayName = user.displayName;
  const isCommissioner = user.role === 'COMMISSIONER';
  
  // Format birthday
  const formatBirthday = () => {
    if (!user.birthdayMonth || !user.birthdayDay) return null;
    return `${MONTH_NAMES[user.birthdayMonth - 1]} ${user.birthdayDay}`;
  };

  const birthday = formatBirthday();

  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{displayName}</h1>
              {isCommissioner && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Commissioner
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Your Profile</p>
          </div>

          {/* Main Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                About You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Bio Section */}
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Bio</h3>
                {user.bio ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{user.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    You haven't written a bio yet.
                  </p>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                
                {/* Birthday */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Birthday</p>
                    <p className="text-sm text-muted-foreground">
                      {birthday || 'Not set'}
                    </p>
                  </div>
                </div>

                {/* Favorite Team */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 dark:bg-red-950">
                    <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Favorite Team</p>
                    <p className="text-sm text-muted-foreground">
                      {user.favoriteTeam || 'Not set'}
                    </p>
                  </div>
                </div>

                {/* League */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 dark:bg-green-950">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">League</p>
                    <p className="text-sm text-muted-foreground">
                      {user.league?.name || 'No league'}
                    </p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.joinedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}