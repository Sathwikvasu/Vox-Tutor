import { getCurrentUser } from '@/lib/actions';
import { redirect } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar user={user} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
