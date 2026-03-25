'use client'
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import { Message } from '@/src/model/User';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { ApiResponse } from '@/src/types/ApiResponse';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const handleDeleteConfirm = async () => {
    //Don't call API for temp messages
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
    <div className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-2">
            {message?.content ?? '—'}
          </p>
          <p className="text-xs text-slate-400">
            {message?.createdAt
              ? dayjs(message.createdAt).format('MMM D, YYYY h:mm A')
              : 'Just now'}
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="h-8 w-8 shrink-0 rounded-xl bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this message?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. The message will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
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