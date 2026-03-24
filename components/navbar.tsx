'use client'
import { useSession, signOut } from 'next-auth/react';
import { User } from 'next-auth';
import { useRouter } from 'next/navigation';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;
  const router = useRouter();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-indigo-500/20"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 50%, rgba(15,23,42,0.95) 100%)',
        boxShadow: '0 1px 40px 0 rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.08)',
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex justify-between items-center h-16">
          <a href="/"
            className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent"
          >
            AnonyMessage
          </a>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="font-body text-sm text-slate-400 hidden md:block">
                  Welcome,{' '}
                  <span className="font-semibold text-slate-100">
                    {user?.username}
                  </span>
                </span>
                <button
                  onClick={() => signOut()}
                  className="font-body bg-white/5 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400/60 text-white text-sm px-5 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-[0_0_16px_rgba(99,102,241,0.3)]"
                >
                  Logout
                </button>
              </>
            ) : (
                <button onClick={() => router.push("/auth/sign-in")} className="font-body bg-indigo-500 hover:bg-indigo-400 text-white text-sm px-5 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
                  Login
                </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;