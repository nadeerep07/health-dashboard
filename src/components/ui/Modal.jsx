import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Universal Modal / Bottom-Sheet Responsive Primitive
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'var(--brand-primary)',
  children,
  maxWidth = '520px',
  showClose = true,
  className = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay-primitive"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className={`modal-sheet-primitive ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: 'var(--surface-elevated)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-floating)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 2rem)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        {(title || showClose) && (
          <div
            style={{
              padding: '1.15rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {Icon && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: iconColor,
                    padding: '0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                  }}
                >
                  <Icon size={18} />
                </div>
              )}
              <div>
                {title && (
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-white)' }}>
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-pill)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-white)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div
          style={{
            padding: '1.25rem',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
