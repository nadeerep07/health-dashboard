import React from 'react';

/**
 * Universal SVG Radial Circular Progress Indicator Primitive
 * 
 * Renders smooth animated SVG arcs for calorie targets, macro adherence, and daily transformation scorecards.
 * 
 * @param {Object} props - Component properties
 * @param {number} [props.size=80] - Diameter of the circular ring in pixels
 * @param {number} [props.strokeWidth=7] - Thickness of the progress arc stroke
 * @param {number} [props.progress=0] - Numerical progress percentage (0 to 100)
 * @param {string} [props.color='var(--brand-primary)'] - Hex or CSS variable color for active progress arc
 * @param {string} [props.trackColor='rgba(255, 255, 255, 0.08)'] - CSS color for underlying circular track
 * @param {React.ReactNode} [props.children] - Centered metrics or labels
 * @returns {JSX.Element}
 */
export default function ProgressRing({
  size = 80,
  strokeWidth = 7,
  progress = 0, // 0 to 100
  color = 'var(--brand-primary)',
  trackColor = 'rgba(255, 255, 255, 0.08)',
  children,
  style = {},
  className = '',
}) {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      className={`progress-ring-primitive ${className}`}
    >
      <svg
        height={size}
        width={size}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      >
        {/* Background Track */}
        <circle
          stroke={trackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Arc */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Center Label / Icon */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
