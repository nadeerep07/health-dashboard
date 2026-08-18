import React from 'react';
import { Target, Calendar, TrendingDown, Flame, Trophy, Award } from 'lucide-react';

export default function TransformationHero({ currentWeight = 110.80, startWeight = 110.80, targetWeight = 100, sevenDayAvg = null }) {
  const remainingWeight = (currentWeight - targetWeight).toFixed(2);
  const totalToLose = startWeight - targetWeight;
  const lostWeight = startWeight - currentWeight;
  const avgWeightDisplay = sevenDayAvg ? Number(sevenDayAvg).toFixed(2) : currentWeight.toFixed(2);
  
  // Calculate percentage (capped between 0 and 100)
  const rawProgress = totalToLose > 0 ? (lostWeight / totalToLose) * 100 : 0;
  const progressPercent = Math.min(Math.max(rawProgress, 0), 100).toFixed(1);

  return (
    <section id="hero-section" className="fitness-card hero-card" style={{
      background: 'linear-gradient(145deg, rgba(22, 25, 36, 0.95) 0%, rgba(12, 14, 20, 0.95) 100%)',
      border: '1px solid rgba(255, 215, 0, 0.25)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(255, 215, 0, 0.08)',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Header Tagline */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="gold-tag">Phase 1 Target</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={13} color="var(--gold-primary)" /> Target Date: Dec 31, 2026
              </span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'var(--text-white)',
              lineHeight: 1.1,
            }}>
              MY TRANSFORMATION
            </h1>
            <div style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
              fontWeight: 800,
              color: 'var(--gold-primary)',
              fontFamily: 'var(--font-mono)',
              marginTop: '0.25rem',
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.75rem'
            }}>
              <span>{currentWeight.toFixed(2)} KG</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>→</span>
              <span>{targetWeight} KG</span>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            textAlign: 'right',
            alignSelf: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Motto
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-white)', fontStyle: 'italic', marginTop: '0.1rem' }}>
              "ONE DAY AT A TIME."
            </div>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Trophy size={16} color="var(--gold-primary)" /> Journey Progress
            </span>
            <span style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700 }}>
              {progressPercent}% Complete
            </span>
          </div>

          <div className="progress-track" style={{ height: '18px', background: 'rgba(255, 255, 255, 0.08)', padding: '3px' }}>
            <div 
              className="progress-fill-gold" 
              style={{ 
                width: `${Math.max(progressPercent, 2)}%`, 
                height: '100%',
                borderRadius: '999px'
              }} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <span>Start: {startWeight} kg (Aug 16, 2026)</span>
            <span>Target: {targetWeight} kg</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1rem',
          marginTop: '0.5rem'
        }}>
          {/* Stat 1: Current */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Current Weight
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
              {currentWeight.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
            </span>
            {sevenDayAvg && (
              <span style={{ fontSize: '0.68rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <TrendingDown size={11} /> 7-Day Avg: <b>{avgWeightDisplay} kg</b>
              </span>
            )}
          </div>

          {/* Stat 2: Target */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Target Weight
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
              {targetWeight} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
            </span>
          </div>

          {/* Stat 3: Remaining */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.04)',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Weight Remaining
            </span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-secondary)', fontFamily: 'var(--font-mono)' }}>
              {remainingWeight > 0 ? remainingWeight : 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
            </span>
          </div>

          {/* Stat 4: Long Term Target */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Long-term Goal
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              90–95 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>kg</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
