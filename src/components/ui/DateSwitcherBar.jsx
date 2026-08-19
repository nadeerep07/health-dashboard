import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { getLocalDateString, shiftDate, formatDisplayDate } from '../../utils/dateUtils';

/**
 * Universal Date Switcher Bar for APEX 100
 * Allows intuitive navigation across days with automatic date isolation
 */
export default function DateSwitcherBar({
  selectedDate,
  onSelectDate,
  streakDay = 1,
}) {
  const activeDate = selectedDate || getLocalDateString();
  const today = getLocalDateString();
  const isToday = activeDate === today;

  const handlePrevDay = () => {
    const prev = shiftDate(activeDate, -1);
    onSelectDate(prev);
  };

  const handleNextDay = () => {
    const next = shiftDate(activeDate, 1);
    onSelectDate(next);
  };

  const handleGoToday = () => {
    onSelectDate(today);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        padding: '0.6rem 0.9rem',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      {/* Left: Previous / Next Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          type="button"
          onClick={handlePrevDay}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-white)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Previous Day"
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0 0.25rem' }}>
          <CalendarIcon size={16} color="var(--brand-primary-soft)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-white)' }}>
            {formatDisplayDate(activeDate)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleNextDay}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-white)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Next Day"
        >
          <ChevronRight size={18} />
        </button>

        {!isToday && (
          <button
            type="button"
            onClick={handleGoToday}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--brand-primary-soft)',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} /> Today
          </button>
        )}
      </div>

      {/* Right: Date Picker & Challenge Day Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <input
          type="date"
          value={activeDate}
          onChange={(e) => e.target.value && onSelectDate(e.target.value)}
          style={{
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-white)',
            fontSize: '0.78rem',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
    </div>
  );
}
