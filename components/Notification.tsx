import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  linkUrl?: string;
  linkText?: string;
  actionText?: string;
  onAction?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose, linkUrl, linkText, actionText, onAction }) => {
  useEffect(() => {
    // Longer timeout for actionable notifications
    const duration = actionText ? 10000 : 5000;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, actionText]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-[var(--primary-500)]',
  }[type];

  const handleActionClick = () => {
      if (onAction) {
          onAction();
      }
      onClose(); // Close notification after action
  }

  return (
    <div className={`fixed bottom-5 right-5 ${bgColor} text-white py-3 px-5 rounded-lg shadow-xl animate-fade-in-up z-50 max-w-sm dark:border dark:border-white/20`}>
      <p>{message}</p>
       {linkUrl && (
        <div className="mt-2 pt-2 border-t border-white/30">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:text-white/80 transition-colors"
          >
            {linkText || 'View Details'}
          </a>
        </div>
      )}
      {actionText && onAction && (
        <div className="mt-2 pt-2 border-t border-white/30">
          <button
            onClick={handleActionClick}
            className="font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md w-full text-center transition-colors"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
