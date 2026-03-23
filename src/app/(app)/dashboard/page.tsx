'use client';

import { MessageCard } from '@/src/components/messageCard';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { Switch } from '@/src/components/ui/switch';
import { toast } from 'sonner';
import { ApiResponse } from '@/src/types/ApiResponse';
import { AcceptMessageSchema } from '@/src/schemas/acceptMessageSchema';
import { Message } from '@/src/model/User';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import tempMessages from '@/messages.json';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>(
    tempMessages.map((msg, idx) => ({
      id: `temp-${idx}`,
      content: msg.content,
      createdAt: new Date(),
    } as Message))
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState<string>('');

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== messageId));
  };

  const { data: session, status } = useSession();
  const user: User = session?.user;

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const res = await axios.get<ApiResponse>('/api/get-accept-messages');
      setValue('acceptMessages', res.data.isAcceptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.responseMessage ?? 'Failed to fetch message settings');
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(async (showToast = false) => {
    setIsLoading(true);
    try {
      const res = await axios.get<ApiResponse>('/api/get-messages');
      if (res.data.success && res.data.messages) {
        setMessages(res.data.messages);
        if (showToast) toast.success('Messages refreshed');
      } else {
        if (showToast) toast.error(res.data.responseMessage || 'Failed to fetch messages');
      }
    } catch (error) {
      if (showToast) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(axiosError.response?.data.responseMessage ?? 'Failed to fetch messages');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSwitchChange = async () => {
    const newValue = !acceptMessages;
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: newValue,
      });
      setValue('acceptMessages', newValue);
      toast.success(
        newValue
          ? 'You are now accepting messages'
          : 'You are no longer accepting messages'
      );
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.responseMessage ?? 'Failed to update message settings');
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied to clipboard');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8">

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Dashboard</h1>

        {/* Copy Link */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Copy Your Unique Link</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={profileUrl}
              disabled
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white focus:outline-none"
            />
            <Button
              onClick={copyToClipboard}
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              Copy
            </Button>
          </div>
        </div>

        {/* Accept Messages Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="text-sm text-gray-700">
            Accept Messages: <span className={acceptMessages ? 'text-gray-900 font-medium' : 'text-gray-500'}>{acceptMessages ? 'On' : 'Off'}</span>
          </span>
        </div>

        <Separator className="my-5" />

        {/* Messages Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMessages(true)}
            disabled={isLoading}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>

        {/* Messages Grid */}
        {messages.length > 0 ? (
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
          <p className="text-sm text-gray-400 text-center py-16">No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;