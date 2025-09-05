import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { SharedUser, Permission } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUsers: SharedUser[];
  onInvite: (email: string, permission: Permission) => void;
  onUpdatePermission: (email: string, permission: Permission) => void;
  onRemoveUser: (email: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, sharedUsers, onInvite, onUpdatePermission, onRemoveUser }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('view');

  if (!isOpen) return null;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email.trim(), permission);
      setEmail('');
      setPermission('view');
    }
  };
  
  const handleCopyLink = () => {
    // This is a simulation, so we just show a notification
    alert('Link copied to clipboard! (Simulated)');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Share Calendar</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mb-2">Shareable Link (View-only)</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value="https://myplanner.app/share/a1b2-c3d4-e5f6 (simulated)"
                className="flex-1 p-2 border border-slate-300 rounded-md bg-slate-100 dark:bg-slate-700 dark:border-slate-600 text-sm"
              />
              <button onClick={handleCopyLink} className="p-2.5 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">
                <ClipboardIcon className="w-5 h-5"/>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mb-2">Invite People</h3>
            <form onSubmit={handleInvite} className="flex items-center gap-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address..."
                className="flex-1 p-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 text-sm"
              />
              <select value={permission} onChange={e => setPermission(e.target.value as Permission)} className="p-2 border border-slate-300 rounded-md text-sm dark:bg-slate-700 dark:border-slate-600">
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-[var(--primary-600)] text-white font-semibold rounded-md hover:bg-[var(--primary-700)] text-sm">
                Invite
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 block mb-2">People with Access</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {sharedUsers.map(user => (
                <div key={user.email} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                  <span className="text-sm font-medium">{user.email}</span>
                  <div className="flex items-center gap-2">
                    <select value={user.permission} onChange={e => onUpdatePermission(user.email, e.target.value as Permission)} className="p-1 border border-slate-300 rounded-md text-xs dark:bg-slate-600 dark:border-slate-500">
                      <option value="view">Can view</option>
                      <option value="edit">Can edit</option>
                    </select>
                    <button onClick={() => onRemoveUser(user.email)} className="p-1 hover:text-red-500">
                      <TrashIcon className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
