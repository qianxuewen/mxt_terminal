import React, { useEffect, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

let toastId = 0;
let addToastFn: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null;

/** Global toast trigger */
export const toast = {
  success: (message: string, duration = 3000) =>
    addToastFn?.({ type: 'success', message, duration }),
  error: (message: string, duration = 4000) =>
    addToastFn?.({ type: 'error', message, duration }),
  info: (message: string, duration = 3000) =>
    addToastFn?.({ type: 'info', message, duration }),
  warning: (message: string, duration = 3500) =>
    addToastFn?.({ type: 'warning', message, duration }),
};

const TYPE_STYLES: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: { bg: '#F0FFF4', icon: '✓', border: '#19BE6B' },
  error: { bg: '#FFF2F0', icon: '✕', border: '#FF4D4F' },
  info: { bg: '#F0F7FF', icon: 'ℹ', border: '#1871FF' },
  warning: { bg: '#FFFBE6', icon: '⚠', border: '#F5A623' },
};

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...msg, id: `toast-${id}` }]);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast: t,
  onRemove,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(t.id), 300);
    }, t.duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onRemove]);

  const style = TYPE_STYLES[t.type];

  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}40`,
        borderLeft: `4px solid ${style.border}`,
        borderRadius: 8,
        padding: '10px 16px',
        color: '#1A2332',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 280,
        maxWidth: 420,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        pointerEvents: 'auto',
        transition: 'all 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 'bold', color: style.border }}>{style.icon}</span>
      <span style={{ flex: 1 }}>{t.message}</span>
    </div>
  );
};

export default ToastContainer;
