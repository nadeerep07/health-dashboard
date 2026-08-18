import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import QuickAddModal from '../ui/QuickAddModal';
import { Lock, Cloud, Sparkles, User, Bell } from 'lucide-react';

/**
 * Universal Master Responsive App Layout
 */
export default function AppLayout({
  children,
  activeScreen = 'home',
  onNavigate,
  onOpenPinModal,
  onOpenSyncModal,
  onLogFood,
  onLogWeight,
  onLogWalk,
  onLogWater,
  currentWeight = 110.80,
  waterTargetMl = 3500,
  streakDays = 14,
  isSynced = true,
}) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState('food');

  // Global Keyboard Shortcuts (F = Food, W = Weight, A = Activity/Walk, H = Hydration)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if typing inside an input, textarea or select
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setQuickAddTab('food');
        setIsQuickAddOpen(true);
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setQuickAddTab('weight');
        setIsQuickAddOpen(true);
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setQuickAddTab('walk');
        setIsQuickAddOpen(true);
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setQuickAddTab('water');
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenQuickAdd = (tab = 'food') => {
    setQuickAddTab(tab);
    setIsQuickAddOpen(true);
  };

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-app)' }}>
      {/* Desktop Left Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={onNavigate}
        onOpenQuickAdd={handleOpenQuickAdd}
        onOpenPinModal={onOpenPinModal}
        onOpenSyncModal={onOpenSyncModal}
        streakDays={streakDays}
        isSynced={isSynced}
      />

      {/* Main Content Area */}
      <div className="main-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Top Header */}
        <header
          className="mobile-top-header"
          style={{
            height: 'calc(var(--header-height) + var(--safe-top))',
            paddingTop: 'var(--safe-top)',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            backgroundColor: 'rgba(17, 19, 25, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div
            onClick={() => onNavigate('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#08090d',
                fontWeight: 900,
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              A
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-white)' }}>
              APEX 100
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onOpenSyncModal}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: isSynced ? '#34d399' : 'var(--text-muted)',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.72rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
              }}
            >
              <Cloud size={13} />
              <span>{isSynced ? 'Sync' : 'Offline'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPinModal}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                padding: '0.4rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Lock Screen"
            >
              <Lock size={14} />
            </button>
          </div>
        </header>

        {/* Screen Content Canvas */}
        <main
          className="screen-canvas"
          style={{
            flex: 1,
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1.5rem 1.25rem',
            paddingBottom: 'calc(var(--bottom-nav-height) + var(--safe-bottom) + 2rem)',
          }}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          activeScreen={activeScreen}
          onNavigate={onNavigate}
          onOpenQuickAdd={handleOpenQuickAdd}
        />
      </div>

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddTab}
        onLogFood={onLogFood}
        onLogWeight={onLogWeight}
        onLogWalk={onLogWalk}
        onLogWater={onLogWater}
        currentWeight={currentWeight}
        waterTargetMl={waterTargetMl}
      />
    </div>
  );
}
