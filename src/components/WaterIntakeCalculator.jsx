import React, { useState } from 'react';
import { Droplets, Plus, Minus, RotateCcw, Sparkles, CheckCircle2, Clock, GlassWater, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WaterIntakeCalculator({ waterData, onUpdateWater, onHabitSync }) {
  const [customAmount, setCustomAmount] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const { targetMl = 3500, consumedMl = 0, history = [] } = waterData || {};

  const percentage = Math.min(Math.round((consumedMl / targetMl) * 100), 150);
  const remainingMl = Math.max(targetMl - consumedMl, 0);
  const consumedLiters = (consumedMl / 1000).toFixed(2);
  const targetLiters = (targetMl / 1000).toFixed(1);
  const remainingLiters = (remainingMl / 1000).toFixed(2);

  const addWater = (amount, label = 'Water Intake') => {
    const newConsumed = consumedMl + amount;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newHistory = [
      { time: timeStr, amount, label },
      ...history.slice(0, 7) // keep recent 8 entries
    ];

    onUpdateWater({
      ...waterData,
      consumedMl: newConsumed,
      history: newHistory
    });

    // If reaching target for the first time, celebrate and sync habit
    if (newConsumed >= 3000 && consumedMl < 3000) {
      if (onHabitSync) onHabitSync('water', true);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#38bdf8', '#0284c7', '#ffd700']
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const removeLast = () => {
    if (history.length === 0) return;
    const last = history[0];
    const newConsumed = Math.max(consumedMl - last.amount, 0);
    const newHistory = history.slice(1);

    onUpdateWater({
      ...waterData,
      consumedMl: newConsumed,
      history: newHistory
    });

    if (newConsumed < 3000 && consumedMl >= 3000) {
      if (onHabitSync) onHabitSync('water', false);
    }
  };

  const resetWater = () => {
    onUpdateWater({
      ...waterData,
      consumedMl: 0,
      history: []
    });
    if (onHabitSync) onHabitSync('water', false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(customAmount);
    if (num > 0) {
      addWater(num, customLabel || 'Custom Drink');
      setCustomAmount('');
      setCustomLabel('');
      setShowCustomModal(false);
    }
  };

  return (
    <section id="water-calculator" className="fitness-card" style={{
      background: 'linear-gradient(145deg, rgba(14, 23, 42, 0.95) 0%, rgba(8, 14, 26, 0.95) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.08)'
    }}>
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <Droplets size={20} />
          </div>
          <div>
            <h2 className="card-title">Water Drinking Calculator</h2>
            <p className="card-subtitle">Daily target: 3.0–4.0 Liters • Hydration & metabolic boost</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => {
              const input = prompt('Enter your daily water target in ml (e.g. 3000, 3500, 4000):', targetMl);
              const num = parseInt(input);
              if (num && num >= 1000 && num <= 10000) {
                onUpdateWater({
                  ...waterData,
                  targetMl: num
                });
              }
            }}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
            title="Configure daily water target"
          >
            🎯 Goal: {targetLiters}L
          </button>
          <button 
            onClick={resetWater} 
            className="btn-secondary" 
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            title="Reset today's water count"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Main Hydration Dashboard Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
        alignItems: 'center'
      }}>
        
        {/* Left: Interactive Visual Water Fill Card */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          position: 'relative'
        }}>
          {/* Top Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              Daily Hydration Level
            </span>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: percentage >= 100 ? '#4ade80' : '#38bdf8',
              background: percentage >= 100 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              {percentage >= 100 ? '🎯 Target Hit!' : `${percentage}% Complete`}
            </span>
          </div>

          {/* Large Visual Water Gauge / Cylinder */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '140px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid rgba(56, 189, 248, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Animated Liquid Wave Fill */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${Math.min(percentage, 100)}%`,
              background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.6) 0%, rgba(2, 132, 199, 0.9) 100%)',
              transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
            }} />

            {/* Calibration Reference Lines */}
            <div style={{ position: 'absolute', top: '25%', left: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>— 2.6L (75%)</div>
            <div style={{ position: 'absolute', top: '50%', left: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>— 1.75L (50%)</div>
            <div style={{ position: 'absolute', top: '75%', left: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', zIndex: 10 }}>— 0.9L (25%)</div>

            {/* Centered Big Value Overlay */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                {consumedLiters} <span style={{ fontSize: '1.25rem', color: '#93c5fd' }}>L</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, marginTop: '0.25rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {consumedMl.toLocaleString()} ml of {targetLiters} L Target
              </div>
            </div>
          </div>

          {/* Quick Metrics Line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', color: '#94a3b8' }}>
            <span>Remaining: <strong style={{ color: '#38bdf8' }}>{remainingLiters} L</strong> ({remainingMl} ml)</span>
            <span>Target: <strong style={{ color: '#ffffff' }}>3.5 L / day</strong></span>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Hydration Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)' }}>
            Quick Log Intake
          </div>

          {/* 4 Standard Size Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem'
          }}>
            {/* +250ml Glass */}
            <button
              onClick={() => addWater(250, 'Glass of Water (250ml)')}
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)'}
            >
              <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '0.4rem', borderRadius: '8px', color: '#38bdf8' }}>
                <Plus size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>+250 ml</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Standard Glass</div>
              </div>
            </button>

            {/* +500ml Bottle */}
            <button
              onClick={() => addWater(500, 'Water Bottle (500ml)')}
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'}
            >
              <div style={{ background: 'rgba(56, 189, 248, 0.25)', padding: '0.4rem', borderRadius: '8px', color: '#38bdf8' }}>
                <Plus size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>+500 ml</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>1 Standard Bottle</div>
              </div>
            </button>

            {/* +750ml Large Bottle */}
            <button
              onClick={() => addWater(750, 'Large Bottle (750ml)')}
              style={{
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)'}
            >
              <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '0.4rem', borderRadius: '8px', color: '#38bdf8' }}>
                <Plus size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>+750 ml</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Large Sipper</div>
              </div>
            </button>

            {/* +1,000ml (1 Liter) */}
            <button
              onClick={() => addWater(1000, '1 Liter Bottle / Carafe')}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)'}
            >
              <div style={{ background: 'rgba(56, 189, 248, 0.3)', padding: '0.4rem', borderRadius: '8px', color: '#38bdf8' }}>
                <Plus size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>+1.0 L</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Desk Carafe</div>
              </div>
            </button>
          </div>

          {/* Secondary Controls: Custom Amount & Undo */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowCustomModal(true)}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.55rem 0.9rem', fontSize: '0.8rem', borderColor: 'rgba(56, 189, 248, 0.2)' }}
            >
              <Plus size={13} /> Custom Amount
            </button>

            {history.length > 0 && (
              <button
                onClick={removeLast}
                className="btn-secondary"
                style={{ padding: '0.55rem 0.9rem', fontSize: '0.8rem', color: '#f87171' }}
                title="Undo last logged intake"
              >
                <Minus size={13} /> Undo
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Hydration History Timeline */}
      {history.length > 0 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} color="#38bdf8" /> Today's Hydration Log
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {history.map((item, idx) => (
              <div
                key={idx}
                style={{
                  flexShrink: 0,
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem'
                }}
              >
                <span style={{ color: '#38bdf8', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>+{item.amount} ml</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: '#64748b', fontSize: '0.68rem' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Amount Modal */}
      {showCustomModal && (
        <div className="modal-overlay" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Log Custom Water Amount
              </h3>
              <button 
                type="button" 
                onClick={() => setShowCustomModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Amount in Milliliters (ml)
                </label>
                <input
                  type="number"
                  step="50"
                  placeholder="e.g. 350"
                  className="form-input"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Note / Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Post-walk electrolyte water"
                  className="form-input"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCustomModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1, background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: '#fff' }}>
                  Add Water
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
