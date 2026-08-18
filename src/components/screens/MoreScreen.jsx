import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Metric from '../ui/Metric';
import {
  Droplets,
  Moon,
  Flame,
  Shield,
  Cloud,
  Download,
  Upload,
  Lock,
  Plus,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

/**
 * Screen 6: More Screen (Hydration, Sleep, Habits, Backup & Settings)
 */
export default function MoreScreen({
  waterData = { consumedMl: 0, targetMl: 3500, history: [] },
  onUpdateWater,
  sleepLogs = [],
  habits = [],
  onToggleHabit,
  onOpenSyncModal,
  onOpenPinModal,
  onExportData,
  onImportData,
}) {
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'water' | 'sleep' | 'habits' | 'settings'

  const waterConsumedL = ((waterData.consumedMl || 0) / 1000).toFixed(2);
  const waterTargetL = ((waterData.targetMl || 3500) / 1000).toFixed(1);
  const waterPct = Math.min(Math.round(((waterData.consumedMl || 0) / (waterData.targetMl || 3500)) * 100), 100);

  const addWater = (amount) => {
    const newConsumed = (waterData.consumedMl || 0) + amount;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHistory = [{ time: timeStr, amount, label: `+${amount}ml Intake` }, ...(waterData.history || []).slice(0, 5)];

    if (onUpdateWater) {
      onUpdateWater({
        ...waterData,
        consumedMl: newConsumed,
        history: newHistory,
      });
    }
  };

  const resetWater = () => {
    if (onUpdateWater) {
      onUpdateWater({
        ...waterData,
        consumedMl: 0,
        history: [],
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)' }}>
          Hydration, Sleep & Settings
        </h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Recovery tracking, 100-day zero sugar habits, cloud sync & device security
        </p>
      </div>

      {/* 1. Water Hydration Module */}
      <Card variant="default" padding="1.25rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.45rem', borderRadius: 'var(--radius-xs)', display: 'flex' }}>
              <Droplets size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Water Drinking Calculator
              </h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Daily Target: {waterTargetL} Liters ({waterPct}% Complete)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const input = prompt('Enter daily water target in ml (e.g. 3000, 3500, 4000):', waterData.targetMl || 3500);
                const num = parseInt(input);
                if (num && num >= 1000 && num <= 8000 && onUpdateWater) {
                  onUpdateWater({ ...waterData, targetMl: num });
                }
              }}
            >
              🎯 Set Target
            </Button>
            <Button variant="ghost" size="sm" onClick={resetWater} icon={RotateCcw}>
              Reset
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
          {[
            { ml: 250, label: '+250ml Glass' },
            { ml: 500, label: '+500ml Bottle' },
            { ml: 750, label: '+750ml Sipper' },
            { ml: 1000, label: '+1.0L Flask' },
          ].map((item) => (
            <button
              key={item.ml}
              type="button"
              onClick={() => addWater(item.ml)}
              style={{
                padding: '0.65rem',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: 'var(--radius-sm)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--transition-fast)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Timeline Log */}
        {waterData.history && waterData.history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Recent Hydration Timeline
            </span>
            {waterData.history.slice(0, 3).map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>{h.label || `+${h.amount}ml`}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{h.time}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 2. Sleep & Recovery Module */}
      <Card variant="default" padding="1.25rem">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '0.45rem', borderRadius: 'var(--radius-xs)', display: 'flex' }}>
            <Moon size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)' }}>
              Sleep & Recovery
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Target 7.5–8.5 hours for hormone & fat loss optimization</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: 'var(--surface-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Sleep Duration
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
              7.8 hrs
            </div>
            <span style={{ fontSize: '0.68rem', color: '#34d399' }}>✓ Restorative</span>
          </div>

          <div style={{ background: 'var(--surface-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Bedtime Target
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
              11:00 PM
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Wake: 07:00 AM</span>
          </div>
        </div>
      </Card>

      {/* 3. Cloud Sync, Backup & PIN Settings */}
      <Card variant="default" padding="1.25rem">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '0.85rem' }}>
          System & Data Security
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div
            onClick={onOpenSyncModal}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 0.9rem',
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Cloud size={16} color="#34d399" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)' }}>
                  Supabase Cloud Synchronization
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Connected to cloud database with offline-first mutation queue
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          <div
            onClick={onOpenPinModal}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 0.9rem',
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Lock size={16} color="var(--brand-primary)" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)' }}>
                  Device PIN Lock Screen
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Apple-style 4-digit security barrier for local privacy
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>

          {/* Backup Export / Import */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
            <Button variant="secondary" size="sm" onClick={onExportData} icon={Download} style={{ flex: 1 }}>
              Export Backup (JSON)
            </Button>
            <label style={{ flex: 1, margin: 0 }}>
              <input
                type="file"
                accept=".json"
                onChange={onImportData}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1rem',
                  fontSize: '0.84rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  border: '1px solid var(--border-medium)',
                  cursor: 'pointer',
                }}
              >
                <Upload size={15} /> Restore Data
              </span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
