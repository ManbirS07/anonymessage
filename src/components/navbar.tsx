'use client'
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            AnonyMessage
          </a>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-gray-500 hidden md:block">
                  Welcome,{' '}
                  <span className="font-semibold text-gray-800">
                    {user?.username || user?.email}
                  </span>
                </span>
                <Button
                  onClick={() => signOut()}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/sign-in">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
