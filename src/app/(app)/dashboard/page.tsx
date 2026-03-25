'use client';

import { MessageCard } from '@/components/messageCard';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ApiResponse } from '@/src/types/ApiResponse';
import { AcceptMessageSchema } from '@/src/schemas/acceptMessageSchema';
import { Message } from '@/src/model/User';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Copy, Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import tempMessages from '@/messages.json';
import { useRouter } from 'next/navigation';

function UserDashboard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [sendToUsername, setSendToUsername] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);

  // delete messages
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
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
  const fetchMessages = useCallback(async (showToast = false) => {
    setIsLoading(true);
    try {
      const res = await axios.get<ApiResponse>('/api/get-messages');
      if (res.data.success && res.data.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
        if (showToast) toast.success('Messages refreshed');
        
      } else {
        const shaped = tempMessages.map((m, i) => ({
          id: `temp-${i}`,
          content: m.content,
          createdAt: new Date(),
        })) as unknown as Message[];
        setMessages(shaped);
      }
    } catch {
      const shaped = tempMessages.map((m, i) => ({
        id: `temp-${i}`,
        content: m.content,
        createdAt: new Date(),
      })) as unknown as Message[];
      setMessages(shaped);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${user.username}`);
    }
  }, [user?.username]);


useEffect(() => {
  if (status === 'authenticated') {
    fetchMessages();
    fetchAcceptMessages();
  }
}, [status, fetchMessages, fetchAcceptMessages]);

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
    <div className="min-h-screen bg-slate-900 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-5xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="font-body text-slate-400 text-sm">Manage your anonymous messages and settings.</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Your unique link</p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 font-mono truncate">
              {profileUrl || 'Loading...'}
            </div>
            <button
              onClick={copyToClipboard}
              className="font-body bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm whitespace-nowrap"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>

          <div className="border-t border-slate-700/50 mb-5" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-semibold text-slate-200">Accept Messages</p>
              <p className="font-body text-xs text-slate-500 mt-0.5">
                {acceptMessages ? 'People can send you anonymous messages' : 'You are not accepting messages right now'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-body text-xs font-bold px-2.5 py-1 rounded-full border ${
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
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-violet-900/40 border border-indigo-500/30 backdrop-blur-sm rounded-2xl p-8 mb-6 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-indigo-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-violet-500/20 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center">
            <h3 className="font-display text-2xl font-bold text-white mb-2 text-center">Send Messages</h3>
            <p className="font-body text-slate-300 text-sm mb-6 text-center"> Enter a username to send them an anonymous message</p>
            <div className="w-full max-w-md flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter username..."
                value={sendToUsername}
                onChange={(e) => setSendToUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckUsernameAndRedirect()}
                className="font-body bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
              />
              <button
                onClick={handleCheckUsernameAndRedirect}
                disabled={isCheckingUsername}
                className="font-body bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 text-white rounded-xl px-8 py-2.5 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
              >

                {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin" />}
                Send 
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Messages</h2>
            <p className="font-body text-xs text-slate-500 mt-0.5">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => fetchMessages(true)}
            disabled={isLoading}
            className="font-body flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white rounded-xl text-sm font-medium px-4 py-2 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
            <p className="font-body text-slate-400 text-sm">Loading your messages...</p>
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
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl text-center">
            <p className="font-body text-slate-500 text-sm">No messages yet.</p>
            <p className="font-body text-slate-600 text-xs mt-1">Share your link to start receiving messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;