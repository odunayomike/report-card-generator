import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-900',
      iconColor: 'text-green-500'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-900',
      iconColor: 'text-red-500'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-900',
      iconColor: 'text-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-500'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${bgColor} ${borderColor} border-l-4 rounded-lg shadow-lg p-3 flex items-start gap-2 min-w-[280px] max-w-md`}
      >
        <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className={`flex-1 ${textColor}`}>
          <p className="text-xs font-medium whitespace-pre-line leading-relaxed">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// Toast Container Component
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      <div className="flex flex-col gap-2 p-4 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
