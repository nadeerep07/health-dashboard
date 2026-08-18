import React from 'react';
import ApexLogo from '../ui/ApexLogo';
import {
  Home,
  CalendarCheck,
  TrendingUp,
  Target,
  MoreHorizontal,
  Flame,
  Plus,
  Lock,
  Cloud,
  Settings,
} from 'lucide-react';

/**
 * Desktop Collapsible Left Sidebar Navigation
 */
export default function Sidebar({
  activeScreen = 'home',
  onNavigate,
  onOpenQuickAdd,
  onOpenPinModal,
  onOpenSyncModal,
  streakDays = 1,
  isSynced = true,
}) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, badge: null },
    { id: 'today', label: 'Today', icon: CalendarCheck, badge: null },
    { id: 'progress', label: 'Progress', icon: TrendingUp, badge: null },
    { id: 'plan', label: 'Plan & Workouts', icon: Target, badge: null },
    { id: 'more', label: 'More', icon: MoreHorizontal, badge: null },
  ];

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--surface-elevated)',
        borderRight: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.85rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Top: Brand Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Minimal Geometric Apex Logo */}
        <div
          onClick={() => onNavigate('home')}
          style={{
            padding: '0.25rem 0.5rem',
            cursor: 'pointer',
          }}
        >
          <ApexLogo size={32} showWordmark={true} />
        </div>

        {/* Quick Log Primary Action Button */}
        <button
          type="button"
          onClick={() => onOpenQuickAdd('food')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            width: '100%',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--brand-gradient)',
            color: '#08090d',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
            transition: 'all var(--transition-fast)',
          }}
          title="Shortcut: Press F, W, A, or H"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Quick Log</span>
        </button>

        {/* Primary Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  color: isActive ? 'var(--brand-primary-soft)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ fontSize: '0.65rem', background: 'var(--surface-tertiary)', color: 'var(--text-muted)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-pill)' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Streak, Cloud Sync & Security */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-medium)', paddingTop: '0.85rem' }}>
        {/* Streak Counter Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.65rem',
            borderRadius: 'var(--radius-xs)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Flame size={14} color="var(--brand-primary)" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--brand-primary-soft)' }}>
              100-Day Streak
            </span>
          </div>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            Day {streakDays}
          </span>
        </div>

        {/* Sync & Security Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={onOpenSyncModal}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              padding: '0.4rem',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: isSynced ? '#34d399' : 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Supabase Cloud Sync Status"
          >
            <Cloud size={13} />
            <span>{isSynced ? 'Synced' : 'Offline'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenPinModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              cursor: 'pointer',
            }}
            title="Lock Dashboard / Security PIN"
          >
            <Lock size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
