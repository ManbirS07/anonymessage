'use client';
import { Mail, ArrowRight } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/messages.json';
import { useRouter } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session;

  return (
    <main className="flex-grow flex flex-col items-center justify-center px-4 py-20 bg-slate-900 text-white relative overflow-hidden min-h-screen">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-900/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-300 mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Anonymous · Honest · Safe
        </div>

        {/* Heading */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
          Dive into the World of{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400">
            Anonymous Feedback
          </span>
        </h1>

        <p className="font-body text-slate-400 text-base md:text-lg mb-10 max-w-lg leading-relaxed">
          Share your unique link. Receive brutally honest messages — without anyone knowing who sent them.
        </p>

        {/* CTA */}
        {/* CTA — changes based on auth state */}
        <button
          onClick={() => router.push(isLoggedIn ? '/dashboard' : '/auth/sign-up')}
          className="font-body inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-xl shadow-indigo-500/30 hover:-translate-y-0.5 mb-16"
        >
          {isLoggedIn ? (
            <>
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              Get started — it's free
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Carousel — single centered card */}
        <div className="w-full">
          <p className="font-body text-xs uppercase tracking-widest text-slate-500 mb-5">
            What people are saying
          </p>
          <Carousel
            plugins={[Autoplay({ delay: 2500, stopOnInteraction: false })]}
            opts={{ loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-0">
              {messages.map((message, index) => (
                <CarouselItem key={index} className="basis-full pl-0 flex justify-center">
                  <div className="w-full max-w-lg bg-slate-800/60 border border-indigo-500/20 backdrop-blur-sm rounded-2xl p-6 text-left"
                    style={{ boxShadow: '0 0 30px rgba(99,102,241,0.08)' }}
                  >
                    <p className="font-body text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">
                      {message.title}
                    </p>
                    <div className="flex items-start gap-4">
                      <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-body text-slate-200 text-base leading-relaxed">
                          {message.content}
                        </p>
                        <p className="font-body text-slate-500 text-xs mt-3">
                          {message.received}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </main>
  );
}