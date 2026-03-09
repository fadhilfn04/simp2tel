import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastNotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function ToastNotification({ show, message, type, onClose }: ToastNotificationProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-full">
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
          ${type === 'success' ? 'bg-green-500 text-white' : ''}
          ${type === 'error' ? 'bg-red-500 text-white' : ''}
          ${type === 'info' ? 'bg-blue-500 text-white' : ''}
        `}
      >
        {type === 'success' && <CheckCircle className="h-5 w-5" />}
        {type === 'error' && <XCircle className="h-5 w-5" />}
        {type === 'info' && <Info className="h-5 w-5" />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          ×
        </button>
      </div>
    </div>
  );
}