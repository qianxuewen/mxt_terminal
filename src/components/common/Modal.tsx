import React, { useEffect, useRef } from 'react';
import { theme } from '@/theme';

interface ModalProps {
  open: boolean;
  title?: string;
  width?: number | string;
  onClose?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  closable?: boolean;
  maskClosable?: boolean;
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
};

const modalContentStyle: React.CSSProperties = {
  background: theme.bgModal,
  borderRadius: 12,
  border: `1px solid ${theme.border}`,
  boxShadow: theme.shadowModal,
  maxHeight: '85vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  width = 520,
  onClose,
  footer,
  children,
  closable = true,
  maskClosable = true,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable && onClose) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closable, onClose]);

  if (!open) return null;

  return (
    <div
      style={modalOverlayStyle}
      onClick={(e) => {
        if (maskClosable && e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        ref={contentRef}
        style={{ ...modalContentStyle, width: typeof width === 'number' ? width : width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              padding: '16px 24px',
              borderBottom: `1px solid ${theme.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: theme.textPrimary }}>{title}</h3>
            {closable && onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textTertiary,
                  cursor: 'pointer',
                  fontSize: 20,
                  padding: '4px 8px',
                  borderRadius: 4,
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: 24, overflow: 'auto', flex: 1, color: theme.textPrimary }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '12px 24px',
              borderTop: `1px solid ${theme.borderLight}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
