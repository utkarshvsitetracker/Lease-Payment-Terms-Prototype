import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'warning' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const TYPE_STYLES: Record<
  ToastMessage['type'],
  { bg: string; border: string; color: string; icon: string }
> = {
  warning: {
    bg: 'color-mix(in srgb, var(--chart-4) 12%, var(--card))',
    border: 'color-mix(in srgb, var(--chart-4) 35%, transparent)',
    color: 'color-mix(in srgb, var(--chart-4) 80%, var(--foreground))',
    icon: 'var(--chart-4)',
  },
  error: {
    bg: 'color-mix(in srgb, var(--destructive) 10%, var(--card))',
    border: 'color-mix(in srgb, var(--destructive) 30%, transparent)',
    color: 'var(--destructive)',
    icon: 'var(--destructive)',
  },
  info: {
    bg: 'color-mix(in srgb, var(--primary) 8%, var(--card))',
    border: 'color-mix(in srgb, var(--primary) 25%, transparent)',
    color: 'var(--primary)',
    icon: 'var(--primary)',
  },
};

function SingleToast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    const enterTimer = setTimeout(() => setVisible(true), 20);
    // Auto-dismiss after 5 s
    const exitTimer = setTimeout(() => onDismiss(), 5000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const s = TYPE_STYLES[toast.type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 'var(--radius)',
        border: `1px solid ${s.border}`,
        background: s.bg,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        maxWidth: 520,
        width: '100%',
        transform: visible ? 'translateY(0)' : 'translateY(-20px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
      }}
    >
      <AlertTriangle
        style={{ width: 16, height: 16, color: s.icon, flexShrink: 0, marginTop: 1 }}
      />
      <span
        style={{
          flex: 1,
          color: s.color,
          fontSize: 'var(--text-base)',
          fontFamily: "'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif",
          lineHeight: 1.5,
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: s.color,
          opacity: 0.7,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Dismiss"
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

/** Renders all active toasts in a fixed container at the top-center of the screen. */
export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto', width: '100%' }}>
          <SingleToast toast={t} onDismiss={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}

/** Hook to manage a toast queue with auto-dedup. */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'warning') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, dismissToast };
}
