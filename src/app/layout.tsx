import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import AuthProvider from '@/src/context/AuthProvider';
import { Instrument_Serif, DM_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/navbar';

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AnonyMessage',
  description: 'Anonymous feedback platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className="font-body">
        <AuthProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}