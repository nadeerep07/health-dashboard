import React from 'react';

/**
 * Universal Card Container Primitive
 * 
 * Provides consistent elevation, border radius, and surface backgrounds across screens.
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Card content elements
 * @param {'default' | 'elevated' | 'interactive' | 'subtle' | 'gradient'} [props.variant='default'] - Surface elevation style
 * @param {string} [props.padding='1.25rem'] - Internal padding specification
 * @param {Function} [props.onClick] - Optional click handler for interactive cards
 * @returns {JSX.Element}
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
          border: '1px solid var(--border-accent)',
          boxShadow: 'var(--shadow-card), 0 0 20px rgba(16, 185, 129, 0.06)',
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
