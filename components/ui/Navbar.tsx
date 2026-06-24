'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { revokeSession } from '@/lib/actions';
import { User } from '@/types';
import { LayoutDashboard, LogOut, Mic } from 'lucide-react';
import Image from 'next/image';

export default function Navbar({ user }: { user: User }) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleSignOut = async () => {
    await revokeSession();
    router.push('/sign-in');
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-white border-b border-surface-200">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="font-semibold text-lg tracking-tight text-ink">
          Vox<span className="text-brand-600">Tutor</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-brand-50 text-brand-700'
                : 'text-ink-secondary hover:text-ink hover:bg-surface-100'
            }`}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-ink">{user.name.split(' ')[0]}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-ghost text-ink-secondary gap-1.5 text-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
