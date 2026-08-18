import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

/**
 * Universal Metric Display Primitive
 */
export default function Metric({
  label,
  value,
  unit,
  sublabel,
  trend = null, // { direction: 'down' | 'up' | 'neutral', value: string, positive: boolean }
  icon: Icon,
  accentColor = 'var(--text-white)',
  size = 'md',
  style = {},
  className = '',
}) {
  const getValueFontSize = () => {
    switch (size) {
      case 'sm':
        return '1.15rem';
      case 'lg':
        return '2.25rem';
      case 'xl':
        return '3rem';
      case 'md':
      default:
        return '1.65rem';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        ...style,
      }}
      className={`metric-primitive ${className}`}
    >
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {Icon && <Icon size={13} color="var(--text-muted)" />}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.1rem' }}>
        <span
          style={{
            fontSize: getValueFontSize(),
            fontWeight: 800,
            color: accentColor,
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: size === 'lg' || size === 'xl' ? '1rem' : '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {unit}
          </span>
        )}
      </div>

      {(trend || sublabel) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.15rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: trend.positive ? 'var(--accent-success)' : 'var(--accent-danger)',
                background: trend.positive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {trend.direction === 'down' && <TrendingDown size={11} />}
              {trend.direction === 'up' && <TrendingUp size={11} />}
              {trend.direction === 'neutral' && <Minus size={11} />}
              {trend.value}
            </span>
          )}
          {sublabel && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
