import React from 'react';

/**
 * Universal Button Primitive Component
 * 
 * Provides accessible, keyboard-navigable interactive button with consistent brand styling.
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Button label or nested elements
 * @param {'primary' | 'secondary' | 'ghost' | 'danger' | 'success'} [props.variant='primary'] - Visual style variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size scale
 * @param {React.ComponentType} [props.icon] - Lucide icon component reference
 * @param {'left' | 'right'} [props.iconPosition='left'] - Placement of icon relative to label
 * @param {boolean} [props.fullWidth=false] - Whether button spans full container width
 * @param {boolean} [props.disabled=false] - Disables interaction and dims opacity
 * @param {boolean} [props.loading=false] - Shows loading state and prevents duplicate clicks
 * @param {Function} [props.onClick] - Click event handler callback
 * @returns {JSX.Element}
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--brand-gradient)',
          color: '#0a0b0e',
          fontWeight: 700,
          border: 'none',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.22)',
        };
      case 'secondary':
        return {
          background: 'var(--surface-secondary)',
          color: 'var(--text-primary)',
          fontWeight: 600,
          border: '1px solid var(--border-medium)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          border: 'none',
        };
      case 'danger':
        return {
          background: 'rgba(239, 68, 68, 0.12)',
          color: '#f87171',
          fontWeight: 600,
          border: '1px solid rgba(239, 68, 68, 0.25)',
        };
      case 'success':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          fontWeight: 700,
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.35rem 0.7rem',
          fontSize: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          gap: '0.35rem',
        };
      case 'lg':
        return {
          padding: '0.75rem 1.4rem',
          fontSize: '0.95rem',
          borderRadius: 'var(--radius-md)',
          gap: '0.5rem',
        };
      case 'md':
      default:
        return {
          padding: '0.55rem 1rem',
          fontSize: '0.84rem',
          borderRadius: 'var(--radius-sm)',
          gap: '0.45rem',
        };
    }
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all var(--transition-fast)',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    userSelect: 'none',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={baseStyles}
      className={`btn-primitive ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
    </button>
  );
}
