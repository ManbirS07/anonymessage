'use client';
import { MessageCard } from '@/src/app/components/messageCard';
import { Switch } from '@/src/app/components/ui/switch';
import { toast } from 'sonner';
import { ApiResponse } from '@/src/types/ApiResponse';
import { AcceptMessageSchema } from '@/src/schemas/acceptMessageSchema';
import { Message } from '@/src/model/User';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Copy, Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

function UserDashboard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [sendToUsername, setSendToUsername] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [messagesPerPage, setMessagesPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPrevPage] = useState<boolean>(false);

  // delete messages
  const handleDeleteMessage = (messageId: string) => {
    const exists = messages.some((m) => m.id === messageId);
    if (!exists) return;

    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    setTotalMessages((total) => Math.max(0, total - 1));
  };

  const { data: session, status } = useSession();
  const user: User = session?.user;

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
    defaultValues: { acceptMessages: false },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  //check if the user is accepting messages or not
  const fetchAcceptMessages = useCallback(async (isRetry = false) => {
  setIsSwitchLoading(true);
  try {
    const res = await axios.get<ApiResponse>('/api/accept-messages');
    setValue('acceptMessages', res.data.isAcceptingMessages ?? false);
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    toast.error(axiosError.response?.data.responseMessage ?? 'Failed to fetch message settings');
  } finally {
    setIsSwitchLoading(false);
  }
}, [setValue]);

  //fetch messages for the user
  //PAGINATION
  //whenever the currentPage or messagesPerPage changes, we need to fetch the messages for that page and page size
  const fetchMessages = useCallback(async (showToast = false) => {
    setIsLoading(true);

    try {
      const res = await axios.get<ApiResponse>(`/api/get-messages?page=${currentPage}&pageSize=${messagesPerPage}`);
      if (res.data.success) {
        setMessages(res.data.messages ?? []);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
        setTotalMessages(res.data.pagination?.totalMessages ?? 0);
        setHasNextPage(res.data.pagination?.hasNextPage ?? false);
        setHasPrevPage(res.data.pagination?.hasPrevPage ?? false);

        if (showToast) toast.success('Messages refreshed');
      }
    } catch(error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.responseMessage ?? 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, messagesPerPage]);

  //handle status change of the switch for accepting messages
  const handleSwitchChange = async () => {
    const newValue = !acceptMessages;
    try {
      await axios.post<ApiResponse>('/api/accept-messages', { acceptMessages: newValue });
      setValue('acceptMessages', newValue);
      if (newValue) {
        toast.success('You are now accepting messages');
      } else {
        toast.error('You are no longer accepting messages');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.responseMessage ?? 'Failed to update settings');
    }
  };

  useEffect(() => {
    if (user?.username) {
      const configuredBaseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
      const baseUrl = configuredBaseUrl || window.location.origin;
      setProfileUrl(`${baseUrl}/u/${user.username}`);
    }
  }, [user?.username]);


useEffect(() => {
  if (status === 'authenticated') {
    fetchMessages();
    fetchAcceptMessages();
  }
}, [status, fetchMessages, fetchAcceptMessages]);

//whenever the messagesPerPage changes, we need to reset the current page to 1, because if we are on page 5 and we change the page size to 20, there might not be a page 5 anymore
useEffect(() => {
  setCurrentPage(1);
}, [messagesPerPage]);

  //copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Link copied!');
  };

  //handle checking username and redirecting
  const handleCheckUsernameAndRedirect = async () => {
    if (!sendToUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsCheckingUsername(true);
    try {
      const res = await axios.post<ApiResponse>('/api/check-username-exists', {
        username: sendToUsername,
      });

      if (res.data.success) {
        router.push(`/u/${sendToUsername}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.responseMessage ?? 'Username not found');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-slate-900">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.16),transparent_36%),radial-gradient(circle_at_92%_18%,rgba(59,130,246,0.2),transparent_38%),radial-gradient(circle_at_40%_88%,rgba(6,182,212,0.14),transparent_35%),linear-gradient(160deg,#041025_0%,#071330_48%,#020617_100%)]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 right-4 h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-[130px]" />
        <div className="absolute bottom-[-120px] left-[-80px] h-[420px] w-[420px] rounded-full bg-sky-600/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl leading-tight font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-sky-200 mb-2">Your Dashboard</h1>
          <p className="font-body text-slate-300 text-sm">Manage your anonymous messages and settings.</p>
        </div>

        <div className="bg-white/[0.08] border border-white/20 backdrop-blur-xl rounded-3xl p-6 mb-6 shadow-[0_20px_60px_rgba(8,47,73,0.35)]">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/70 mb-3">Your unique link</p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-slate-950/45 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono truncate">
              {profileUrl || 'Loading...'}
            </div>
            <button
              onClick={copyToClipboard}
              className="font-body bg-cyan-200/90 text-slate-950 hover:bg-cyan-100 rounded-xl px-5 py-3 text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm whitespace-nowrap"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>

          <div className="border-t border-white/10 mb-5" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-slate-100">Accept Messages</p>
              <p className="font-body text-xs text-slate-300 mt-0.5">
                {acceptMessages ? 'People can send you anonymous messages' : 'You are not accepting messages right now'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-body text-xs font-bold px-3 py-1 rounded-full border ${
                acceptMessages
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-700/50 text-slate-500 border-slate-700'
              }`}>
                {acceptMessages ? 'ON' : 'OFF'}
              </span>
              <Switch
                {...register('acceptMessages')}
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Send Message Block */}
        <div className="bg-gradient-to-r from-cyan-950/45 via-sky-900/40 to-blue-950/45 border border-cyan-300/25 backdrop-blur-xl rounded-3xl p-8 mb-6 relative overflow-hidden shadow-[0_16px_50px_rgba(8,47,73,0.35)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-cyan-400/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-sky-500/20 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <h3 className="font-display text-2xl font-bold text-white mb-2 text-center">Send Messages</h3>
            <p className="font-body text-slate-200 text-sm mb-6 text-center"> Enter a username to send them an anonymous message</p>
            <div className="w-full max-w-md flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter username..."
                value={sendToUsername}
                onChange={(e) => setSendToUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckUsernameAndRedirect()}
                className="font-body bg-slate-950/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-300/20 transition-all duration-200"
              />
              <button
                onClick={handleCheckUsernameAndRedirect}
                disabled={isCheckingUsername}
                className="font-body bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 text-slate-950 rounded-xl px-8 py-3 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
              >

                {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin" />}
                Send 
              </button>
            </div>
          </div>
        </div>

       {/* Messages header */}
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-cyan-100 to-slate-100 bg-clip-text text-transparent">
      Messages
    </h2>
    <p className="font-display text-xm text-slate-100 mt-1 tracking-wide">
      <span className="text-cyan-300 font-semibold">{totalMessages}</span> total message{totalMessages !== 1 ? 's' : ''}
    </p>
  </div>
  <button
    onClick={() => fetchMessages(true)}
    disabled={isLoading}
    className="font-body flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-300/30 hover:border-cyan-200/60 text-cyan-200 hover:text-cyan-100 rounded-xl text-sm font-medium px-4 py-2.5 transition-all duration-200 disabled:opacity-50"
  >
    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
    Refresh
  </button>
</div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.06] border border-dashed border-white/15 rounded-3xl backdrop-blur-md">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300 mb-3" />
            <p className="font-body text-slate-200 text-sm">Loading your messages...</p>
          </div>
        ) : messages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.06] border border-dashed border-white/15 rounded-3xl text-center backdrop-blur-md">
            <p className="font-display text-xl text-slate-100">No messages yet.</p>
            <p className="font-body text-slate-300 text-sm mt-1">Share your link to start receiving messages.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {/* Pagination */}
<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/[0.07] border border-white/15 backdrop-blur-xl rounded-3xl px-5 py-4 shadow-[0_12px_36px_rgba(8,47,73,0.3)]">
  <div className="flex items-center gap-3">
    <span className="font-body text-sm text-slate-200">Show</span>
    <select
      value={messagesPerPage}
      onChange={(e) => setMessagesPerPage(Number(e.target.value))}
      className="font-body bg-slate-950/50 border border-white/20 hover:border-cyan-300/60 rounded-xl px-4 py-2 text-sm text-slate-100 outline-none cursor-pointer transition-all duration-200"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={20}>20</option>
    </select>
    <span className="font-body text-sm text-slate-200">per page</span>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
      disabled={!hasPrevPage || isLoading}
      className="font-display bg-slate-950/40 hover:bg-cyan-500/20 border border-white/15 hover:border-cyan-300/60 text-slate-300 hover:text-cyan-100 rounded-2xl text-lg font-medium px-5 py-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      ← Prev
    </button>

    <div className="flex items-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`font-display h-9 w-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
            page === currentPage
              ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30'
              : 'bg-slate-950/40 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white'
          }`}
        >
          {page}
        </button>
      ))}
    </div>

    <button
      onClick={() => setCurrentPage((prev) => prev + 1)}
      disabled={!hasNextPage || isLoading}
      className="font-display bg-slate-950/40 hover:bg-cyan-500/20 border border-white/15 hover:border-cyan-300/60 text-slate-300 hover:text-cyan-100 rounded-2xl text-lg font-medium px-5 py-2 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      Next →
    </button>
  </div>
</div>
      </div>
    </div>
  );
}

export default UserDashboard;