import React, { useState, useEffect } from 'react';
import { Footprints, Clock, Gauge, TrendingUp, Plus, CheckCircle2, Award, Info, Trash2, List, BarChart3, Calendar, Flame } from 'lucide-react';

export default function WalkingTracker({ walkingLogs = [], onAddWalkLog, onDeleteWalkLog }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeView, setActiveView] = useState('both'); // 'both', 'chart', 'history'
  
  // Form State
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDistance, setNewDistance] = useState('5.0');
  const [newDuration, setNewDuration] = useState('58');
  const [newPace, setNewPace] = useState('11:36');
  const [notes, setNotes] = useState('');

  // Auto-calculate pace when distance or duration changes
  useEffect(() => {
    const dist = parseFloat(newDistance);
    const dur = parseInt(newDuration);
    if (dist > 0 && dur > 0) {
      const paceDecimal = dur / dist; // minutes per km
      const paceMins = Math.floor(paceDecimal);
      const paceSecs = Math.round((paceDecimal - paceMins) * 60);
      const formattedPace = `${paceMins}:${paceSecs.toString().padStart(2, '0')}`;
      setNewPace(formattedPace);
    }
  }, [newDistance, newDuration]);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogModal) {
        setShowLogModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogModal]);

  // Normalize logs with dates and sort chronologically
  const sortedLogs = [...walkingLogs].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  // Past 7 days logs for the chart
  const recentLogs = sortedLogs.slice(-7);
  
  // Stats
  const totalAllTimeDistance = sortedLogs.reduce((sum, log) => sum + (Number(log.distance) || 0), 0).toFixed(1);
  const totalWalksCount = sortedLogs.filter(l => (Number(l.distance) || 0) > 0).length;
  const recent7Distance = recentLogs.reduce((sum, log) => sum + (Number(log.distance) || 0), 0).toFixed(1);
  const activeDaysThisWeek = recentLogs.filter(log => (Number(log.distance) || 0) > 0).length;
  const totalCaloriesBurned = Math.round(Number(totalAllTimeDistance) * 65);

  const handleSaveWalk = (e) => {
    e.preventDefault();
    const distNum = parseFloat(newDistance);
    const durNum = parseInt(newDuration);
    if (distNum > 0 && durNum > 0) {
      const dateObj = new Date(inputDate + 'T12:00:00');
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      
      const newEntry = {
        id: `walk-${Date.now()}`,
        date: inputDate,
        day: dayName,
        distance: distNum,
        duration: durNum,
        pace: newPace || '11:45',
        calories: Math.round(distNum * 65),
        notes: notes.trim() || '5 km Daily Target'
      };

      onAddWalkLog(newEntry);
      setShowLogModal(false);
      setNotes('');
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this walk record?')) {
      if (onDeleteWalkLog) {
        onDeleteWalkLog(id);
      }
    }
  };

  const maxDist = Math.max(...recentLogs.map(l => Number(l.distance) || 0), 6);

  return (
    <section id="walking-tracker" className="fitness-card">
      {/* Header */}
      <div className="card-header-clean" style={{ flexWrap: 'wrap' }}>
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Footprints size={20} />
          </div>
          <div>
            <h2 className="card-title">Walking Tracker & Log</h2>
            <p className="card-subtitle">Low-impact fat loss foundation — 5 km daily benchmark</p>
          </div>
        </div>

        <button 
          onClick={() => {
            setInputDate(new Date().toISOString().split('T')[0]);
            setShowLogModal(true);
          }} 
          className="btn-gold"
        >
          <Plus size={16} /> Log Walk
        </button>
      </div>

      {/* Main Target Banner - Mobile Responsive Grid */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(22, 25, 36, 0.9) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1.2rem',
        marginBottom: '1.25rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daily Target
          </div>
          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
            5.0 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>KM</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Working Pace <span className="gold-tag" style={{ fontSize: '0.6rem', padding: '0.05rem 0.35rem' }}>Top: 10:43</span>
          </div>
          <div style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
            <Gauge size={18} /> 11:45 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>min/km</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Estimated Time
          </div>
          <div style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.5rem)', fontWeight: 700, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
            <Clock size={18} color="var(--gold-secondary)" /> ~58–60 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>mins</span>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Distance</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {totalAllTimeDistance} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>km</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Walks</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {totalWalksCount} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>sessions</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>7-Day Distance</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {recent7Distance} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>km</span>
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Est. Burned</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            ~{totalCaloriesBurned} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kcal</span>
          </div>
        </div>
      </div>

      {/* Weekly Walking Visual Bar Chart */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BarChart3 size={15} color="var(--gold-primary)" /> 7-Day Walking Activity (km)
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Target: 5.0 km</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '0.35rem',
          height: '140px',
          background: 'rgba(0,0,0,0.3)',
          padding: '1rem 0.5rem 0.5rem 0.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {recentLogs.map((item, idx) => {
            const distVal = Number(item.distance) || 0;
            const heightPercent = Math.min((distVal / maxDist) * 100, 100);
            const isTargetMet = distVal >= 5.0;

            return (
              <div key={item.id || idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <div style={{ fontSize: '0.68rem', color: isTargetMet ? 'var(--gold-primary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '0.2rem' }}>
                  {distVal.toFixed(1)}
                </div>
                <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '75%',
                      maxWidth: '28px',
                      height: `${Math.max(heightPercent, 8)}%`,
                      background: isTargetMet ? 'var(--gold-gradient)' : 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '5px 5px 0 0',
                      boxShadow: isTargetMet ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none',
                      transition: 'height 0.4s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontWeight: 600 }}>
                  {item.day || item.date?.slice(5) || 'Day'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WALK LOG HISTORY SECTION */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <List size={16} color="var(--gold-primary)" /> Walk Log History ({sortedLogs.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chronological record</span>
        </div>

        {sortedLogs.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No walking sessions logged yet. Click <strong>"Log Walk"</strong> above to record your first 5 km session!
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="table-responsive-wrapper" style={{ display: 'block' }}>
              <table className="clean-data-table">
                <thead>
                  <tr>
                    <th>Date / Day</th>
                    <th>Distance</th>
                    <th>Duration</th>
                    <th>Pace</th>
                    <th>Est. Calories</th>
                    <th>Notes</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sortedLogs].reverse().map((log, idx) => (
                    <tr key={log.id || `log-${idx}`}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-white)' }}>{log.date || log.day || 'Recorded'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.day ? `${log.day} Session` : ''}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: log.distance >= 5.0 ? 'var(--gold-primary)' : 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                          {Number(log.distance).toFixed(1)} km
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {log.duration} min
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold-secondary)' }}>
                        {log.pace || '11:45'} /km
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                        ~{log.calories || Math.round((Number(log.distance) || 0) * 65)} kcal
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.notes || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={(e) => handleDelete(log.id || idx, e)}
                          className="btn-danger-subtle"
                          title="Delete this walk entry"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Sustainable Pace Guidance Banner */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.05)',
        border: '1px solid rgba(255, 215, 0, 0.15)',
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <div style={{ background: 'rgba(255, 215, 0, 0.12)', padding: '0.45rem', borderRadius: '8px', color: 'var(--gold-primary)', flexShrink: 0 }}>
          <Gauge size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
            Sustainable Pace Strategy (11:45 min/km)
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.4 }}>
            While your top recorded effort is <strong>10:43 min/km</strong>, your daily working pace is comfortably around <strong>11:45 min/km</strong> (~58–60 minutes for 5 km). A steady, injury-free stride is what builds lifelong consistency.
          </p>
        </div>
      </div>

      {/* Log Walk Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Footprints size={20} color="var(--gold-primary)" /> Log Walk Session
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWalk} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Distance (KM)</label>
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
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Duration (Minutes)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Calculated Pace (min/km)
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  value={newPace}
                  onChange={(e) => setNewPace(e.target.value)}
                  placeholder="e.g. 11:45"
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'block' }}>
                  Auto-calculated from distance and duration.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Notes (Optional)</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Morning loop, feeling energized"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
