import React from 'react';

/**
 * APEX 100 Minimal Geometric Abstract Logo & Wordmark
 * Represents transformation, ascent, and personal peak
 */
export default function ApexLogo({
  size = 32,
  showWordmark = true,
  variant = 'default', // 'default' | 'minimal' | 'monochrome'
  style = {},
  className = '',
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        userSelect: 'none',
        ...style,
      }}
      className={`apex-logo-container ${className}`}
    >
      {/* Geometric Peak Ascent Symbol */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
      >
        <defs>
          <linearGradient id="apexEmeraldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="apexTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>

        {/* Geometric Hexagonal Shield / Peak Base */}
        <rect
          width="40"
          height="40"
          rx="10"
          fill="#17201f"
          stroke="#263532"
          strokeWidth="1.5"
        />

        {/* Left Ascending Vector */}
        <path
          d="M10 28L20 10L25 19L20 22L16 28H10Z"
          fill="url(#apexEmeraldGrad)"
        />

        {/* Right Ascending Apex Wing */}
        <path
          d="M20 10L30 28H24L20 20L23 15L20 10Z"
          fill="url(#apexTealGrad)"
        />

        {/* Center Precision Zenith Diamond */}
        <circle cx="20" cy="10" r="2.2" fill="#ffffff" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span
              style={{
                fontSize: size >= 32 ? '1.1rem' : '0.92rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                color: 'var(--text-white)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              APEX
            </span>
            <span
              style={{
                fontSize: size >= 32 ? '1.05rem' : '0.88rem',
                fontWeight: 800,
                color: 'var(--brand-primary-soft)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em',
              }}
            >
              100
            </span>
          </div>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '0.15rem',
            }}
          >
            Health & Transformation
          </span>
        </div>
      )}
    </div>
  );
}
