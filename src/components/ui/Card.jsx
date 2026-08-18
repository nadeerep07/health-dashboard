import React from 'react';

/**
 * Universal Card Container Primitive
 * Variants: 'default' | 'elevated' | 'interactive' | 'subtle' | 'gradient'
 */
export default function Card({
  children,
  variant = 'default',
  className = '',
  style = {},
  onClick,
  padding = '1.25rem',
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-elevated)',
        };
      case 'interactive':
        return {
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        };
      case 'subtle':
        return {
          background: 'var(--surface-secondary)',
          border: '1px solid var(--border-subtle)',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(145deg, var(--surface-card) 0%, var(--surface-elevated) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          boxShadow: 'var(--shadow-card), 0 0 20px rgba(245, 158, 11, 0.05)',
        };
      case 'default':
      default:
        return {
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        };
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-md)',
        padding,
        position: 'relative',
        ...getVariantStyles(),
        ...style,
      }}
      className={`card-primitive ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
