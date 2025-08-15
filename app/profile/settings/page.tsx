import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";
import ProfileSettingsForm from '@/components/ProfileSettingsForm';


const prisma = new PrismaClient();

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
        birthdayMonth: true,
        birthdayDay: true,
        favoriteTeam: true,
        bio: true,
      }
    });

    if (!user) {
      redirect('/login');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    redirect('/login');
  }
}

export default async function ProfileSettingsPage() {
  const user = await getCurrentUser();

  return (
    <div>
      <Navbar />
      <ProfileSettingsForm user={user} />
      <Footer />
    </div>
  );
}