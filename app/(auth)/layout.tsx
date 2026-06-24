import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <nav className="h-16 flex items-center px-8 border-b border-surface-200 bg-white">
        <Link href="/" className="font-semibold text-lg tracking-tight text-ink">
          Vox<span className="text-brand-600">Tutor</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
