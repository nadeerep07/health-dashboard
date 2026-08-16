import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, ShieldAlert, CheckCircle2, Sparkles, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

export default function SleepRecoveryTracker({ sleepLogs, nightRoutine, onToggleNightRoutine, onLogSleep }) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [bedTimeInput, setBedTimeInput] = useState('23:45');
  const [wakeTimeInput, setWakeTimeInput] = useState('08:00');

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

  const avgDuration = (sleepLogs.reduce((acc, curr) => acc + curr.duration, 0) / (sleepLogs.length || 1)).toFixed(1);
  const onTimeCount = sleepLogs.filter(l => l.consistency === 'On Time').length;
  const consistencyPercent = Math.round((onTimeCount / (sleepLogs.length || 1)) * 100);

  const handleSaveSleep = (e) => {
    e.preventDefault();
    const [bH, bM] = bedTimeInput.split(':').map(Number);
    const [wH, wM] = wakeTimeInput.split(':').map(Number);
    
    let bedMins = bH * 60 + bM;
    let wakeMins = wH * 60 + wM;
    if (wakeMins < bedMins) wakeMins += 24 * 60; // Overnight
    
    const durationHours = parseFloat(((wakeMins - bedMins) / 60).toFixed(2));
    
    onLogSleep({
      day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
      bedTime: bedTimeInput,
      wakeTime: wakeTimeInput,
      duration: durationHours,
      consistency: (bH === 23 || (bH === 0 && bM === 0)) ? 'On Time' : 'Late'
    });
    setShowLogModal(false);
  };

  const formatStandTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="sleep-recovery" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Moon size={20} />
          </div>
          <div>
            <h2 className="card-title">Sleep & Recovery Tracker</h2>
            <p className="card-subtitle">Essential hormone regulation & metabolic recovery</p>
          </div>
        </div>

        <button onClick={() => setShowLogModal(true)} className="btn-gold" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
          <Clock size={14} /> Log Sleep
        </button>
      </div>

      {/* Target Sleep Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(22, 25, 36, 0.9) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase' }}>Target Bedtime</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            11:30 PM–12:00 AM
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase' }}>Target Wake Time</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            ~8:00 AM
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase' }}>7-Day Average</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {avgDuration} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>hrs / night</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase' }}>Bedtime Consistency</div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
            {consistencyPercent}% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On Time</span>
          </div>
        </div>
      </div>

      {/* Critical Sleep Rule Callout */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.08)',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.1rem',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        fontWeight: 800,
        color: 'var(--gold-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <Sparkles size={18} />
        <span>"Don't sacrifice sleep to exercise more."</span>
      </div>

      {/* Night Routine Checklist */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '0.75rem' }}>
          Night Routine Checklist
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {nightRoutine.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleNightRoutine(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: item.completed ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                border: item.completed ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid var(--border-subtle)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className={`custom-checkbox ${item.completed ? 'checked' : ''}`} style={{ background: item.completed ? '#8b5cf6' : '', borderColor: item.completed ? '#8b5cf6' : '' }}>
                  <CheckCircle2 size={15} color="#fff" />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: item.completed ? 'var(--text-white)' : 'var(--text-muted)' }}>
                  {item.label}
                </span>
              </div>
              {item.completed && <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700 }}>READY</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Daytime Inactivity & Standing Break Timer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <AlertTriangle size={20} color="var(--gold-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Workplace Movement & Posture Rule
          </h3>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800 }}>•</span>
            <span><strong>Morning Meeting Rule:</strong> Immediately get out of bed after your morning meeting ends (break the bed-watching Netflix habit!).</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800 }}>•</span>
            <span><strong>Hourly Stand Rule:</strong> Get up every 60–90 minutes while working at laptop and move/stretch for 3–5 minutes.</span>
          </li>
        </ul>

        {/* Stand Timer Widget */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.9rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Work Movement Reminder</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--gold-primary)' }}>
              {formatStandTime(standSeconds)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={toggleStandTimer} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
              {isStandTimerRunning ? <Pause size={13} /> : <Play size={13} />}
              {isStandTimerRunning ? 'Pause' : 'Start 60m Timer'}
            </button>
            <button onClick={resetStandTimer} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}>
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Log Sleep Modal */}
      {showLogModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '1rem' }}>
              Log Sleep Session
            </h3>
            <form onSubmit={handleSaveSleep} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Bedtime</label>
                <input type="time" className="form-input" value={bedTimeInput} onChange={(e) => setBedTimeInput(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Wake Time</label>
                <input type="time" className="form-input" value={wakeTimeInput} onChange={(e) => setWakeTimeInput(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
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
