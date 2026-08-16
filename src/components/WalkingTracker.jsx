import React, { useState } from 'react';
import { Footprints, Clock, Gauge, TrendingUp, Plus, CheckCircle2, ChevronRight, Award, Info } from 'lucide-react';

export default function WalkingTracker({ walkingLogs, onAddWalkLog }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [newDistance, setNewDistance] = useState('5.0');
  const [newDuration, setNewDuration] = useState('59');
  const [newPace, setNewPace] = useState('11:45');

  const totalWeeklyDistance = walkingLogs.reduce((sum, log) => sum + (Number(log.distance) || 0), 0).toFixed(1);
  const walkingDaysCount = walkingLogs.filter(log => log.distance > 0).length;

  const handleSaveWalk = (e) => {
    e.preventDefault();
    const distNum = parseFloat(newDistance);
    const durNum = parseInt(newDuration);
    if (distNum > 0 && durNum > 0) {
      onAddWalkLog({
        day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        distance: distNum,
        duration: durNum,
        pace: newPace || '11:45'
      });
      setShowLogModal(false);
    }
  };

  const maxDist = Math.max(...walkingLogs.map(l => l.distance), 6);

  return (
    <section id="walking-tracker" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Footprints size={20} />
          </div>
          <div>
            <h2 className="card-title">Walking Tracker</h2>
            <p className="card-subtitle">Low-impact fat loss foundation — 5 km daily benchmark</p>
          </div>
        </div>

        <button 
          onClick={() => setShowLogModal(true)} 
          className="btn-gold" 
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
        >
          <Plus size={14} /> Log Walk
        </button>
      </div>

      {/* Main Target Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(22, 25, 36, 0.8) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daily Target
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            5.0 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>KM</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Working Pace <span className="gold-tag" style={{ fontSize: '0.6rem', padding: '0.05rem 0.4rem' }}>Top: 10:43</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Gauge size={18} /> 11:45 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>min/km</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estimated Time
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={18} color="var(--gold-secondary)" /> ~58–60 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>minutes</span>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Weekly Distance</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {totalWeeklyDistance} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>km</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Days</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {walkingDaysCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 7 days</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Est. Calories Burned</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            ~{Math.round(totalWeeklyDistance * 65)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>kcal</span>
          </div>
        </div>
      </div>

      {/* Weekly Walking Visual Bar Chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>7-Day Walking Log (km)</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 5.0 km / day</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '0.5rem',
          height: '140px',
          background: 'rgba(0,0,0,0.3)',
          padding: '1rem 0.75rem 0.5rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {walkingLogs.map((item, idx) => {
            const heightPercent = Math.min((item.distance / maxDist) * 100, 100);
            const isTargetMet = item.distance >= 5.0;

            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <div style={{ fontSize: '0.7rem', color: isTargetMet ? 'var(--gold-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {item.distance}
                </div>
                <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '70%',
                      maxWidth: '28px',
                      height: `${heightPercent}%`,
                      background: isTargetMet ? 'var(--gold-gradient)' : 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '6px 6px 0 0',
                      boxShadow: isTargetMet ? '0 0 12px rgba(255, 215, 0, 0.3)' : 'none',
                      transition: 'height 0.5s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600 }}>
                  {item.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pace Guide Callout */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.06)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.8rem'
      }}>
        <div style={{ background: 'rgba(255, 215, 0, 0.15)', padding: '0.5rem', borderRadius: '10px', color: 'var(--gold-primary)' }}>
          <Gauge size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
            Sustainable Pace Strategy (11:45 min/km)
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
            While your top recorded effort is <strong>10:43 min/km</strong>, your daily working pace is comfortably around <strong>11:45 min/km</strong> (~58–60 minutes for 5 km). A steady, injury-free stride is what builds lifelong consistency.
          </p>
        </div>
      </div>

      {/* Next Milestone Card */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.8rem'
      }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.5rem', borderRadius: '10px', color: '#60a5fa' }}>
          <Award size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Next Milestone: 6 KM
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.4 }}>
            As your aerobic stamina builds, gradually scale your walk from <strong>5 km → 6 km → 7 km</strong> when comfortable. Maintain a consistent, sustainable stride.
          </p>
        </div>
      </div>

      {/* Log Walk Modal */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '1rem' }}>
              Log Today's Walk
            </h3>
            <form onSubmit={handleSaveWalk} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Distance (KM)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="form-input"
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Duration (Minutes)</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Pace (min/km)</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={newPace}
                  onChange={(e) => setNewPace(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  Save Walk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
