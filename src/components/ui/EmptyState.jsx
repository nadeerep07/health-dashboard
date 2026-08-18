import React from 'react';
import Button from './Button';

/**
 * Universal Empty State Primitive
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
  style = {},
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed var(--border-subtle)',
        gap: '0.75rem',
        ...style,
      }}
      className={`empty-state-primitive ${className}`}
    >
      {Icon && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            color: 'var(--brand-primary)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-pill)',
            marginBottom: '0.25rem',
          }}
        >
          <Icon size={24} />
        </div>
      )}

      {title && (
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)' }}>
          {title}
        </h4>
      )}

      {description && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '320px', lineHeight: 1.4 }}>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onAction}
          icon={actionIcon}
          style={{ marginTop: '0.5rem' }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
