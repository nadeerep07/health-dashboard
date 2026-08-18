import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Universal Non-blocking Toast Primitive
 */
export default function Toast({
  message,
  type = 'success', // 'success' | 'error' | 'info'
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          icon: AlertCircle,
        };
      case 'info':
        return {
          bg: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          icon: Info,
        };
      case 'success':
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          icon: CheckCircle2,
        };
    }
  };

  const current = getTypeStyles();
  const Icon = current.icon;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(80px + var(--safe-bottom))',
        right: '1.25rem',
        zIndex: 110,
        background: 'var(--surface-elevated)',
        border: current.border,
        boxShadow: 'var(--shadow-floating)',
        padding: '0.65rem 1rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        maxWidth: '360px',
        animation: 'slideUp 0.2s ease-out',
      }}
    >
      <Icon size={16} color={current.color} />
      <span style={{ fontSize: '0.82rem', color: 'var(--text-white)', fontWeight: 600, flex: 1 }}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
