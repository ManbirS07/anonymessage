'use client'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/src/app/components/ui/alert-dialog';
import { Message } from '@/src/model/User';
import { ApiResponse } from '@/src/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

// Cycle through different accent colors for visual variety
const accents = [
  { icon: 'bg-sky-400/15 border-sky-200/35 text-sky-200', dot: 'bg-sky-300' },
  { icon: 'bg-blue-400/15 border-blue-200/35 text-blue-200', dot: 'bg-blue-300' },
  { icon: 'bg-cyan-400/15 border-cyan-200/35 text-cyan-200', dot: 'bg-cyan-300' },
  { icon: 'bg-indigo-400/15 border-indigo-200/35 text-indigo-200', dot: 'bg-indigo-300' },
  { icon: 'bg-teal-400/15 border-teal-200/35 text-teal-200', dot: 'bg-teal-300' },
];

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  // Pick accent based on message id so it's consistent
  const accentIndex = Math.abs(
    String(message.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % accents.length;
  const accent = accents[accentIndex];

  const handleDeleteConfirm = async () => {
    if (String(message.id).startsWith('temp-')) {
      onMessageDelete(String(message.id));
      return;
    }
    try {
      const response = await axios.delete<ApiResponse>(`/api/delete-message/${message.id}`);
      toast.success(response.data.responseMessage || 'Message deleted');
      onMessageDelete(String(message.id));
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.responseMessage ?? 'Failed to delete message');
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-cyan-100/18 bg-gradient-to-br from-[#0b2744] via-[#123a5d] to-[#091d34] p-5 transition-all duration-300 hover:from-[#103055] hover:via-[#18456d] hover:to-[#0d2743]"
      style={{ boxShadow: '0 0 0 0 transparent' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 14px 32px rgba(5, 25, 55, 0.42)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 transparent'}
    >
      <div className="flex items-start gap-3.5">
        {/* Icon */}
        <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${accent.icon}`}>
          <MessageCircle className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm md:text-base font-medium text-slate-50 leading-snug mb-2">
            {message?.content ?? '—'}
          </p>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
            <p className="font-body text-xs text-slate-300">
              {message?.createdAt
                ? dayjs(message.createdAt).format('MMM D, YYYY h:mm A')
                : 'Just now'}
            </p>
          </div>
        </div>

        {/* Delete button — always visible, not just on hover */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="shrink-0 h-9 w-9 rounded-xl bg-red-500/15 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-300 hover:text-white flex items-center justify-center transition-all duration-200">
              <X className="h-3.5 w-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border border-cyan-200/20 bg-[#0c223d] text-white shadow-2xl shadow-slate-950/70">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-white">Delete this message?</AlertDialogTitle>
              <AlertDialogDescription className="font-body text-slate-300">
                This cannot be undone. The message will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="!mx-0 !mb-0 !bg-transparent !border-white/10 !p-0 !pt-4">
              <AlertDialogCancel className="rounded-xl bg-slate-700/80 border-slate-500/60 text-slate-100 hover:bg-slate-600 font-body">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white border-0 font-body"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}