import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Metric from '../ui/Metric';
import Modal from '../ui/Modal';
import {
  TrendingDown,
  Plus,
  Target,
  Calendar,
  Trash2,
  Camera,
  Activity,
  Layers,
} from 'lucide-react';
import { calculate7DayMovingAverage } from '../../services/weightService.js';

/**
 * Screen 4: Progress & Analytics Screen
 */
export default function ProgressScreen({
  weightLogs = [],
  measurements = {},
  onAddWeightLog,
  onDeleteWeightLog,
  onUpdateMeasurements,
  targetWeight = 100.00,
}) {
  const [rangeFilter, setRangeFilter] = useState('ALL'); // '7D' | '30D' | '90D' | 'ALL'
  const [showLogModal, setShowLogModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(() => new Date().toISOString().split('T')[0]);

  // Sort logs chronologically
  const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Filter logs by selected range
  const getFilteredLogs = () => {
    if (rangeFilter === '7D') return sortedLogs.slice(-7);
    if (rangeFilter === '30D') return sortedLogs.slice(-30);
    if (rangeFilter === '90D') return sortedLogs.slice(-90);
    return sortedLogs;
  };

  const visibleLogs = getFilteredLogs();
  const movingAverages = calculate7DayMovingAverage(sortedLogs);

  const currentWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weight : 110.80;
  const startWeight = sortedLogs.length > 0 ? sortedLogs[0].weight : 110.80;
  const lowestWeight = sortedLogs.length > 0 ? Math.min(...sortedLogs.map(l => l.weight)) : currentWeight;
  const totalLost = (startWeight - currentWeight).toFixed(2);
  const remaining = (currentWeight - targetWeight).toFixed(2);
  const current7DayAvg = movingAverages.length > 0 ? movingAverages[movingAverages.length - 1].movingAvg : currentWeight;

  // Chart SVG Coordinates
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingRatio = 35;

  const weights = visibleLogs.map(l => l.weight);
  const minW = Math.min(...weights, targetWeight - 2);
  const maxW = Math.max(...weights, startWeight + 2);

  const getY = (val) => {
    const range = maxW - minW || 1;
    return chartHeight - paddingRatio - ((val - minW) / range) * (chartHeight - paddingRatio * 2);
  };

  const getX = (index) => {
    if (visibleLogs.length <= 1) return chartWidth / 2;
    return paddingRatio + (index / (visibleLogs.length - 1)) * (chartWidth - paddingRatio * 2);
  };

  const points = visibleLogs.map((log, idx) => `${getX(idx)},${getY(log.weight)}`).join(' ');
  const visibleMAs = movingAverages.slice(-visibleLogs.length);
  const maPoints = visibleMAs.map((ma, idx) => `${getX(idx)},${getY(ma.movingAvg)}`).join(' ');
  const targetY = getY(targetWeight);

  const handleSaveWeight = (e) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (w > 0 && onAddWeightLog) {
      onAddWeightLog({
        id: `wt-${Date.now()}`,
        date: dateInput,
        weight: parseFloat(w.toFixed(2)),
        notes: 'Fasted morning weigh-in',
      });
      setWeightInput('');
      setShowLogModal(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Progress & Weight Trends
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            7-day rolling moving average analytics & milestone projections
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setShowLogModal(true)} icon={Plus}>
          Log Weigh-In
        </Button>
      </div>

      {/* Analytics Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        <Card variant="subtle" padding="1rem">
          <Metric label="Current Weight" value={currentWeight.toFixed(2)} unit="kg" accentColor="var(--text-white)" />
        </Card>
        <Card variant="subtle" padding="1rem">
          <Metric label="7-Day Moving Avg" value={current7DayAvg.toFixed(2)} unit="kg" accentColor="var(--brand-secondary)" />
        </Card>
        <Card variant="subtle" padding="1rem">
          <Metric label="Total Lost" value={totalLost > 0 ? `-${totalLost}` : '0.00'} unit="kg" accentColor="var(--brand-primary-soft)" />
        </Card>
        <Card variant="subtle" padding="1rem">
          <Metric label="To 100 kg Goal" value={remaining > 0 ? remaining : '0.00'} unit="kg" accentColor="var(--text-secondary)" />
        </Card>
      </div>

      {/* SVG Dual-Trend Chart Card */}
      <Card variant="default" padding="1.25rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.74rem' }}>
            <span style={{ color: 'var(--brand-primary-soft)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'inline-block' }}></span> Fasted Weigh-In
            </span>
            <span style={{ color: 'var(--brand-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '12px', height: '2px', background: 'var(--brand-secondary)', display: 'inline-block' }}></span> 7-Day Trend
            </span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '12px', height: '1.5px', borderTop: '1.5px dashed var(--text-muted)', display: 'inline-block' }}></span> 100 kg Goal
            </span>
          </div>

          {/* Time Range Filter Buttons */}
          <div style={{ display: 'flex', background: 'var(--surface-secondary)', padding: '0.2rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-medium)' }}>
            {['7D', '30D', '90D', 'ALL'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRangeFilter(r)}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: '4px',
                  background: rangeFilter === r ? 'var(--surface-interactive)' : 'transparent',
                  color: rangeFilter === r ? 'var(--text-white)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', minWidth: '320px', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Target 100 kg Subtle Neutral Goal Line */}
            <line x1="30" y1={targetY} x2={chartWidth - 85} y2={targetY} stroke="var(--border-strong)" strokeDasharray="4,4" strokeWidth="1.2" />
            <text x={chartWidth - 80} y={targetY + 3.5} fill="var(--text-muted)" fontSize="9" fontWeight="600" fontFamily="var(--font-sans)">100 kg Goal</text>

            {/* Area fill */}
            {visibleLogs.length > 1 && (
              <polygon
                points={`${getX(0)},${chartHeight - 25} ${points} ${getX(visibleLogs.length - 1)},${chartHeight - 25}`}
                fill="url(#emeraldAreaGrad)"
              />
            )}

            {/* Daily Fasted Weight Polyline (Emerald) */}
            {visibleLogs.length > 1 && (
              <polyline
                fill="none"
                stroke="var(--brand-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            )}

            {/* 7-Day Moving Average Polyline (Cyan/Teal) */}
            {visibleMAs.length > 1 && (
              <polyline
                fill="none"
                stroke="var(--brand-secondary)"
                strokeWidth="2"
                strokeDasharray="4,4"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={maPoints}
              />
            )}

            {/* Data Point Circles */}
            {visibleLogs.map((log, idx) => {
              const cx = getX(idx);
              const cy = getY(log.weight);
              return (
                <g key={log.id || idx}>
                  <circle cx={cx} cy={cy} r="4.5" fill="var(--surface-card)" stroke="var(--brand-primary)" strokeWidth="2.5" />
                  <text x={cx} y={cy - 8} fill="var(--text-white)" fontSize="9" textAnchor="middle" fontWeight="bold" fontFamily="var(--font-mono)">
                    {Number(log.weight).toFixed(1)}
                  </text>
                  <text x={cx} y={chartHeight - 8} fill="var(--text-muted)" fontSize="8.5" textAnchor="middle">
                    {log.date ? log.date.slice(5) : idx + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </Card>

      {/* History Log Table Card */}
      <Card variant="default" padding="1.25rem">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '0.85rem' }}>
          Recorded Weigh-In History
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '240px', overflowY: 'auto' }}>
          {sortedLogs.slice().reverse().map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.55rem 0.85rem',
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                  {Number(log.weight).toFixed(2)} kg
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
                  {log.date}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDeleteWeightLog && onDeleteWeightLog(log.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                title="Delete weight entry"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Log Weight Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Log Weight"
        subtitle="Record your fasted morning scale weight"
        maxWidth="440px"
      >
        <form onSubmit={handleSaveWeight} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.05"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="e.g. 110.25"
              autoFocus
              required
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--brand-primary)',
                fontSize: '1.3rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
              Date
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-white)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
            <Button variant="secondary" onClick={() => setShowLogModal(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }}>
              Save Weight
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
