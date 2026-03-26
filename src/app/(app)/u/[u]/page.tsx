'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { Loader2, Send, Sparkles, ArrowRight } from 'lucide-react';
import { ApiResponse } from '@/src/types/ApiResponse';

const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(1000, { message: 'Message cannot exceed 1000 characters' }),
});

type MessageForm = z.infer<typeof messageSchema>;

export default function PublicProfile() {
  const params = useParams();
  const router = useRouter();
  const username = params.u as string;

  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const content = watch('content');

  // Send message to the user
  const onSubmit = async (data: MessageForm) => {
    setIsSending(true);
    try {
      const res = await axios.post<ApiResponse>('/api/send-message', {
        username,
        message: data.content,
      });
      toast.success(res.data.responseMessage || 'Message sent!');
      setValue('content', '');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.responseMessage ?? 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Step 3 — Fetch AI suggested messages and parse the streamed response
  //how?
  // When user clicks "Suggest Messages", we send a request to our API route which calls the AI gateway to generate message suggestions. 
  // The response is streamed back as Server-Sent Events (SSE). 
  // We read the stream, parse the incoming data chunks, and update the UI with the suggestions in real-time.
  const handleSuggestMessages = async () => {
    setIsSuggesting(true);
    setSuggestedMessages([]);
    try {
      const res = await fetch('/api/suggest-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate message suggestions for sending an anonymous message to ${username}. The messages should be friendly, engaging, and appropriate.`,
            }
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch suggestions');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream found');

      const decoder = new TextDecoder();
      let sseBuffer = '';
      let generatedText = '';

      const parseSseLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) return;

        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') return;

        try {
          const event = JSON.parse(payload) as { type?: string; delta?: string };
          if (event.type === 'text-delta' && typeof event.delta === 'string') {
            generatedText += event.delta;
          }
        } catch {
          // Ignore partial/incomplete JSON chunks until the next read
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() ?? '';
        lines.forEach(parseSseLine);
      }

      if (sseBuffer.length > 0) {
        parseSseLine(sseBuffer);
      }

      // Parse — questions are separated by ||
      const parsed = generatedText
        .split('||')
        .map((q) => q.trim())
        .filter((q) => q.length > 0 && q.length < 300);

      if (parsed.length > 0) {
        setSuggestedMessages(parsed.slice(0, 3));
      } else {
        toast.error('Could not parse suggestions, try again');
      }
    } catch (error) {
      toast.error('Failed to get suggestions');
    } finally {
      setIsSuggesting(false);
    }
  };

  // Click a suggestion → fill textarea
  const handleSelectSuggestion = (message: string) => {
    setValue('content', message, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-300 mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Public Profile
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Send Anonymous Message
          </h1>
          <p className="font-body text-slate-400 text-sm">
            to
            <span className="text-indigo-400 font-semibold">  @{username}</span>
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 mb-6"
          style={{ boxShadow: '0 0 40px rgba(99,102,241,0.08)' }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <textarea
              {...register('content')}
              placeholder={`Write something anonymous to @${username}...`}
              rows={4}
              className="font-body w-full bg-slate-900/60 border border-slate-700 hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 resize-none outline-none transition-all duration-200 mb-2"
            />
            {errors.content && (
              <p className="font-body text-red-400 text-xs mb-3">{errors.content.message}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="font-body text-xs text-slate-500">
                {content.length}/1000
              </span>
              <button
                type="submit"
                disabled={isSending}
                className="font-body inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSending ? 'Sending...' : 'Send It'}
              </button>
            </div>
          </form>
        </div>

        {/* Suggest Messages */}
        <div className="bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-body text-sm font-semibold text-slate-200">Need Sample Messages?</p>
              <p className="font-body text-xs text-slate-500 mt-0.5">
                Click any suggestion to use it
              </p>
            </div>
            <button
              onClick={handleSuggestMessages}
              disabled={isSuggesting}
              className="font-body inline-flex items-center gap-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 hover:border-indigo-500/40 text-slate-200 hover:text-white font-medium px-4 py-2 rounded-xl text-sm transition-all duration-200 disabled:opacity-50"
            >
              {isSuggesting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              )}
              {isSuggesting ? 'Generating...' : 'Suggest Messages'}
            </button>
          </div>
              
          <div className="space-y-2">
            {suggestedMessages.length === 0 && !isSuggesting && (
              <p className="font-body text-xs text-slate-600 text-center py-4">
                Click on "Suggest Messages" to get AI-generated ideas
              </p>
            )}
            {isSuggesting && (
              <div className="flex items-center justify-center py-6 gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <p className="font-body text-xs text-slate-500">Generating suggestions...</p>
              </div>
            )}
            {suggestedMessages.map((msg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSuggestion(msg)}
                className="font-body w-full text-left bg-slate-900/40 hover:bg-indigo-500/10 border border-slate-700/50 hover:border-indigo-500/40 rounded-xl px-4 py-3 text-sm text-slate-300 hover:text-white transition-all duration-200 group"
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{msg}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA — Create account */}
        <div className="text-center bg-slate-800/40 border border-slate-700/30 rounded-2xl p-8">
          <p className="font-display text-xl font-bold text-white mb-2">
            Get Your Own Message Board
          </p>
          <p className="font-body text-slate-400 text-sm mb-5">
            Create your account and start receiving anonymous messages.
          </p>
          <button
            onClick={() => router.push('/auth/sign-up')}
            className="font-body inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5"
          >
            Create Your Account
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}