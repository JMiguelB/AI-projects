import React from 'react';
import { XIcon } from './icons/XIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ScheduleAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: string | null;
  isLoading: boolean;
}

export const ScheduleAnalysisModal: React.FC<ScheduleAnalysisModalProps> = ({ isOpen, onClose, analysisResult, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-[var(--primary-600)]" />
            Schedule Analysis
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {isLoading && (
                <div className="text-center p-8">
                    <div className="flex justify-center mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-600)]"></div>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">AI is analyzing your schedule...</h2>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">This may take a moment.</p>
                </div>
            )}
            {analysisResult && !isLoading && (
                <div 
                    className="prose prose-slate dark:prose-invert max-w-none"
                    style={{ whiteSpace: 'pre-wrap' }}
                >
                    {analysisResult}
                </div>
            )}
        </div>
        
        <div className="flex justify-end items-center mt-6">
            <button onClick={onClose} className="px-5 py-2 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold">
                Done
            </button>
        </div>
      </div>
    </div>
  );
};
