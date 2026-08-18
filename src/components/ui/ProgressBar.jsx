import React from 'react';

/**
 * Universal Animated Linear Progress Bar Primitive
 */
export default function ProgressBar({
  progress = 0, // 0 to 100
  height = 8,
  color = 'var(--brand-primary)',
  trackColor = 'rgba(255, 255, 255, 0.08)',
  borderRadius = 'var(--radius-pill)',
  animated = true,
  style = {},
  className = '',
}) {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      style={{
        width: '100%',
        height,
        background: trackColor,
        borderRadius,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
      className={`progress-bar-primitive ${className}`}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          background: color,
          borderRadius,
          transition: animated ? 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      />
    </div>
  );
}
