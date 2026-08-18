import React from 'react';
import { Home, CalendarCheck, TrendingUp, Target, MoreHorizontal, Plus } from 'lucide-react';

/**
 * Mobile Bottom Navigation Bar with Centered Quick-Add FAB
 */
export default function BottomNav({
  activeScreen = 'home',
  onNavigate,
  onOpenQuickAdd,
}) {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'quick_add', label: 'Log', isFab: true },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(var(--bottom-nav-height) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        backgroundColor: 'var(--surface-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      {items.map((item) => {
        if (item.isFab) {
          return (
            <button
              key="quick_add_fab"
              type="button"
              onClick={() => onOpenQuickAdd('food')}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--brand-gradient)',
                color: '#08090d',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                cursor: 'pointer',
                marginTop: '-14px',
                transition: 'transform var(--transition-fast)',
              }}
              aria-label="Quick Log Food, Weight, or Walk"
            >
              <Plus size={22} strokeWidth={2.6} />
            </button>
          );
        }

        const Icon = item.icon;
        const isActive = activeScreen === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.2rem',
              background: 'transparent',
              border: 'none',
              color: isActive ? 'var(--brand-primary-soft)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem 0.6rem',
              minWidth: '56px',
              transition: 'color var(--transition-fast)',
            }}
          >
            <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
            <span style={{ fontSize: '0.68rem', fontWeight: isActive ? 700 : 500 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
