import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';
import { XIcon } from './icons/XIcon';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (fileData: string, mimeType: string) => void;
  isLoading: boolean;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onFileUpload, isLoading }) => {
  const [view, setView] = useState<'select' | 'camera'>('select');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Reset view to default when modal is closed
    if (!isOpen) {
        setView('select');
        return;
    }

    if (view === 'camera') {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Could not access the camera. Please check permissions.");
          setView('select'); // Switch back on error
        }
      };
      startCamera();
    } else {
      stopCamera();
    }
    
    // Cleanup function to stop the camera stream when the component unmounts or the view changes.
    return () => {
      stopCamera();
    };
  }, [view, isOpen, stopCamera]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onFileUpload(base64String, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const base64String = dataUrl.split(',')[1];
      onFileUpload(base64String, 'image/png');
      setView('select'); // Return to the selection view after capture
    }
  };

  const handleClose = () => {
    // The useEffect hook will handle stopping the camera when isOpen becomes false
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <button onClick={handleClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
          <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        {isLoading ? (
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">AI is analyzing your document...</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">This may take a moment. Please wait.</p>
            <div className="mt-4 flex justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-600)]"></div>
            </div>
          </div>
        ) : (
          <>
            {view === 'select' && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Add Events with AI</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">Upload a document (like a PDF syllabus or flyer), a schedule, a screenshot, or a photo of handwritten notes.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors dark:border-slate-600 dark:hover:bg-slate-700">
                    <UploadIcon className="w-12 h-12 text-[var(--primary-500)] mb-2" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Upload a File</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PDF, PNG, JPG</p>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg"/>
                  </label>
                  <button onClick={() => setView('camera')} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors dark:border-slate-600 dark:hover:bg-slate-700">
                    <CameraIcon className="w-12 h-12 text-[var(--primary-500)] mb-2" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Use Camera</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Scan a document or notes</p>
                  </button>
                </div>
              </div>
            )}
            {view === 'camera' && (
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Live Camera</h2>
                <div className="bg-black rounded-lg overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <div className="mt-4 flex justify-center gap-4">
                    <button onClick={() => setView('select')} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">Cancel</button>
                    <button onClick={capturePhoto} className="px-6 py-2 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold">Capture</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};