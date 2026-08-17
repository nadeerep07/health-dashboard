import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, ShieldAlert, CheckCircle2, Sparkles, AlertTriangle, Play, Pause, RotateCcw, Trash2, List, Plus } from 'lucide-react';

export default function SleepRecoveryTracker({ sleepLogs = [], nightRoutine = [], onToggleNightRoutine, onLogSleep, onDeleteSleepLog }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bedTimeInput, setBedTimeInput] = useState('23:45');
  const [wakeTimeInput, setWakeTimeInput] = useState('08:00');

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogModal) {
        setShowLogModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogModal]);

  // Stand Reminder Timer (60 min countdown timer)
  const [standSeconds, setStandSeconds] = useState(3600); // 60 mins
  const [isStandTimerRunning, setIsStandTimerRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isStandTimerRunning && standSeconds > 0) {
      interval = setInterval(() => setStandSeconds(prev => prev - 1), 1000);
    } else if (standSeconds === 0) {
      setIsStandTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isStandTimerRunning, standSeconds]);

  const toggleStandTimer = () => {
    setIsStandTimerRunning(!isStandTimerRunning);
  };

  const resetStandTimer = () => {
    setStandSeconds(3600);
    setIsStandTimerRunning(true);
  };

  const sortedSleepLogs = [...sleepLogs].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  const avgDuration = (sortedSleepLogs.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0) / (sortedSleepLogs.length || 1)).toFixed(1);
  const onTimeCount = sortedSleepLogs.filter(l => l.consistency === 'On Time').length;
  const consistencyPercent = Math.round((onTimeCount / (sortedSleepLogs.length || 1)) * 100);

  const handleSaveSleep = (e) => {
    e.preventDefault();
    const [bH, bM] = bedTimeInput.split(':').map(Number);
    const [wH, wM] = wakeTimeInput.split(':').map(Number);
    
    let bedMins = bH * 60 + bM;
    let wakeMins = wH * 60 + wM;
    if (wakeMins < bedMins) wakeMins += 24 * 60; // Overnight
    
    const durationHours = parseFloat(((wakeMins - bedMins) / 60).toFixed(2));
    const dateObj = new Date(inputDate + 'T12:00:00');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    onLogSleep({
      id: `sl-${Date.now()}`,
      date: inputDate,
      day: dayName,
      bedTime: bedTimeInput,
      wakeTime: wakeTimeInput,
      duration: durationHours,
      consistency: (bH === 23 || (bH === 0 && bM <= 15)) ? 'On Time' : 'Late'
    });
    setShowLogModal(false);
  };

  const handleDelete = (idOrIdx, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this sleep record?')) {
      if (onDeleteSleepLog) {
        onDeleteSleepLog(idOrIdx);
      }
    }
  };

  const formatStandTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="sleep-recovery" className="fitness-card">
      <div className="card-header-clean" style={{ flexWrap: 'wrap' }}>
        <div className="card-title-group">
          <div className="card-icon-pill" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Moon size={20} />
          </div>
          <div>
            <h2 className="card-title">Sleep & Recovery Tracker</h2>
            <p className="card-subtitle">Essential hormone regulation & metabolic recovery</p>
          </div>
        </div>

        <button 
          onClick={() => {
            setInputDate(new Date().toISOString().split('T')[0]);
            setShowLogModal(true);
          }} 
          className="btn-gold"
        >
          <Plus size={16} /> Log Sleep
        </button>
      </div>

      {/* Target Sleep Banner - Mobile Responsive Grid */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(22, 25, 36, 0.9) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.2rem',
        marginBottom: '1.25rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: '0.75rem',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase' }}>Target Bedtime</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            11:30 PM–12:00 AM
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase' }}>Target Wake Time</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            ~8:00 AM
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase' }}>Average Sleep</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {avgDuration} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>hrs / night</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase' }}>Consistency</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
            {consistencyPercent}% <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>On Time</span>
          </div>
        </div>
      </div>

      {/* Critical Sleep Rule Callout */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.06)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '0.8rem 1rem',
        marginBottom: '1.25rem',
        fontSize: '0.85rem',
        fontWeight: 800,
        color: 'var(--gold-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Sparkles size={16} />
        <span>"Don't sacrifice sleep to exercise more."</span>
      </div>

      {/* SLEEP LOG HISTORY TABLE */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <List size={16} color="var(--gold-primary)" /> Sleep History ({sortedSleepLogs.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chronological sleep records</span>
        </div>

        <div className="table-responsive-wrapper">
          <table className="clean-data-table">
            <thead>
              <tr>
                <th>Date / Day</th>
                <th>Bedtime</th>
                <th>Wake Time</th>
                <th>Duration</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {[...sortedSleepLogs].reverse().map((log, idx) => (
                <tr key={log.id || `sl-${idx}`}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-white)' }}>{log.date || log.day}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{log.bedTime}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{log.wakeTime}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold-primary)' }}>
                    {log.duration} hrs
                  </td>
                  <td>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: log.consistency === 'On Time' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: log.consistency === 'On Time' ? '#34d399' : '#f87171'
                    }}>
                      {log.consistency}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => handleDelete(log.id || (sortedSleepLogs.length - 1 - idx), e)}
                      className="btn-danger-subtle"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stand Reminder Widget */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Hourly Sedentary Break Timer
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            Stand up, stretch or drink water after every 60 mins of sitting.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
            {formatStandTime(standSeconds)}
          </div>
          <button
            onClick={toggleStandTimer}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            {isStandTimerRunning ? <Pause size={13} /> : <Play size={13} />}
            <span>{isStandTimerRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button
            onClick={resetStandTimer}
            className="btn-secondary"
            style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
            title="Reset to 60 minutes"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Night Routine Checklist */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.75rem' }}>
          Night Routine Checklist
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {nightRoutine.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleNightRoutine(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: item.completed ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: item.completed ? '1px solid rgba(255, 215, 0, 0.2)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: item.completed ? 'var(--text-muted)' : 'var(--text-white)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                {item.label}
              </span>
              <div className={`custom-checkbox ${item.completed ? 'checked' : ''}`} style={{ width: '18px', height: '18px' }}>
                <CheckCircle2 size={13} strokeWidth={3} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Sleep Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Moon size={20} color="var(--gold-primary)" /> Log Sleep Session
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSleep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Date</label>
                <input type="date" className="form-input" value={inputDate} onChange={(e) => setInputDate(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Bedtime</label>
                  <input type="time" className="form-input" value={bedTimeInput} onChange={(e) => setBedTimeInput(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Wake Time</label>
                  <input type="time" className="form-input" value={wakeTimeInput} onChange={(e) => setWakeTimeInput(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  Save Sleep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
