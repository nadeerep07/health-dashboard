import React from 'react';
import { Trophy, CheckCircle2, Lock, Star, Target, Flag } from 'lucide-react';

const MILESTONES_LIST = [
  { weight: 110.25, label: 'START LINE', desc: 'Transformation journey officially launched', isStart: true },
  { weight: 105.0, label: 'FIRST MILESTONE', desc: 'First 5.25 kg dropped — Momentum built', isFirst: true },
  { weight: 100.0, label: 'MAIN TARGET', desc: 'Phase 1 Goal reached! Double digits unlocked', isMain: true },
  { weight: 95.0, label: 'LONG-TERM TARGET', desc: 'Sustained lean physique achieved', isLongTerm: true },
  { weight: 90.0, label: 'OPTIONAL FUTURE TARGET', desc: 'Peak athletic body composition', isFuture: true },
];

export default function Milestones({ currentWeight = 110.25 }) {
  return (
    <section id="milestones-section" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Trophy size={20} />
          </div>
          <div>
            <h2 className="card-title">Transformation Milestones</h2>
            <p className="card-subtitle">Key checkpoints on your path to long-term health</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
        {MILESTONES_LIST.map((m, idx) => {
          const isReached = currentWeight <= m.weight;
          const isNextGoal = !isReached && (idx === 0 || currentWeight <= MILESTONES_LIST[idx - 1].weight);

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: isReached 
                  ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(22, 25, 36, 0.8) 100%)' 
                  : (isNextGoal ? 'rgba(255, 215, 0, 0.04)' : 'rgba(255, 255, 255, 0.02)'),
                border: isReached 
                  ? '1px solid rgba(255, 215, 0, 0.4)' 
                  : (isNextGoal ? '1px stroke var(--border-active)' : '1px solid var(--border-subtle)'),
                boxShadow: isReached ? '0 0 20px rgba(255, 215, 0, 0.1)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: isReached ? 'var(--gold-gradient)' : 'rgba(255, 255, 255, 0.05)',
                  color: isReached ? '#000' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isReached ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none'
                }}>
                  {isReached ? <CheckCircle2 size={22} strokeWidth={2.5} /> : <Lock size={20} />}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: isReached ? 'var(--gold-primary)' : 'var(--text-white)'
                    }}>
                      {m.weight} KG
                    </span>
                    <span className="gold-tag" style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.5rem',
                      background: isReached ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isReached ? 'var(--gold-primary)' : 'var(--text-muted)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {m.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {m.desc}
                  </div>
                </div>
              </div>

              <div>
                {isReached ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    UNLOCKED ✓
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {(currentWeight - m.weight).toFixed(2)} kg away
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
