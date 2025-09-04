import React from 'react';
import { XIcon } from './icons/XIcon';
import { MessageSquareIcon } from './icons/MessageSquareIcon';

interface SendSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  body: string;
  onBodyChange: (newBody: string) => void;
  onSend: () => void;
}

export const SendSmsModal: React.FC<SendSmsModalProps> = ({ isOpen, onClose, recipient, body, onBodyChange, onSend }) => {
  if (!isOpen) return null;

  const charCount = body.length;
  const charLimit = 160;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquareIcon className="w-6 h-6 text-[var(--primary-600)]" />
            Send SMS Notification
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">To</label>
            <p className="w-full p-2 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded-md mt-1">{recipient}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Message (AI Generated)</label>
            <textarea
              value={body}
              onChange={e => onBodyChange(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md mt-1 h-28 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            ></textarea>
            <p className={`text-right text-xs mt-1 ${charCount > charLimit ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {charCount} / {charLimit}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-center mt-6 gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">
              Cancel
            </button>
            <button onClick={onSend} className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold">
              Send via Messaging App
            </button>
        </div>
      </div>
    </div>
  );
};