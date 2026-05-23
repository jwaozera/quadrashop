import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 border-[var(--success)] text-[var(--success)]',
  error: 'bg-red-50 border-[var(--error)] text-[var(--error)]',
  info: 'bg-[var(--brand-light)] border-[var(--brand)] text-[var(--brand)]',
};

export default function Toast({ id, message, type = 'info', duration = 3000, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-center gap-3 px-4 py-3
        bg-[var(--bg-surface)] border rounded-[var(--radius-md)]
        shadow-[var(--shadow-lg)]
        min-w-[280px] max-w-[400px]
        ${styles[type]}
        ${isExiting ? 'animate-fadeOut' : 'animate-slideInRight'}
      `}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <p className="flex-1 text-[14px] text-[var(--text-primary)]">{message}</p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
