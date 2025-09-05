import React from 'react';
import { XIcon } from './icons/XIcon';
import { MailIcon } from './icons/MailIcon';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  subject: string;
  body: string;
  onBodyChange: (newBody: string) => void;
  onSend: () => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({ isOpen, onClose, recipient, subject, body, onBodyChange, onSend }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MailIcon className="w-6 h-6 text-[var(--primary-600)]" />
            Send Notification
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
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Subject</label>
            <p className="w-full p-2 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded-md mt-1">{subject}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Message (AI Generated)</label>
            <textarea
              value={body}
              onChange={e => onBodyChange(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md mt-1 h-36 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-offset-slate-800"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-end items-center mt-6 gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">
              Cancel
            </button>
            <button onClick={onSend} className="px-4 py-2 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold">
              Send via Email Client
            </button>
        </div>
      </div>
    </div>
  );
};
