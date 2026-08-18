import React from 'react';

/**
 * Universal Badge Primitive
 * Variants: 'gold' | 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'raw' | 'cooked' | 'edible'
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  style = {},
  className = '',
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
      case 'brand':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: 'var(--brand-primary-soft)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'teal':
        return {
          background: 'rgba(34, 211, 238, 0.15)',
          color: 'var(--brand-secondary)',
          border: '1px solid rgba(34, 211, 238, 0.3)',
        };
      case 'gold':
        return {
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      case 'success':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'info':
        return {
          background: 'rgba(56, 189, 248, 0.15)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)',
        };
      case 'warning':
        return {
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      case 'danger':
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      case 'raw':
        return {
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#fca5a5',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
      case 'cooked':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#6ee7b7',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'edible':
        return {
          background: 'rgba(56, 189, 248, 0.15)',
          color: '#7dd3fc',
          border: '1px solid rgba(56, 189, 248, 0.3)',
        };
      case 'neutral':
      default:
        return {
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.15rem 0.45rem',
          fontSize: '0.65rem',
          gap: '0.2rem',
        };
      case 'lg':
        return {
          padding: '0.35rem 0.8rem',
          fontSize: '0.82rem',
          gap: '0.35rem',
        };
      case 'md':
      default:
        return {
          padding: '0.2rem 0.6rem',
          fontSize: '0.72rem',
          gap: '0.25rem',
        };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 700,
        borderRadius: 'var(--radius-pill)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        userSelect: 'none',
        lineHeight: 1.2,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      className={`badge-primitive ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 10 : size === 'lg' ? 14 : 12} />}
      {children}
    </span>
  );
}
