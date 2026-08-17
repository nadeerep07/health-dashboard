import React, { useState, useEffect } from 'react';
import { Dumbbell, Play, CheckCircle2, Clock, RotateCcw, X, Info, Flame, ChevronRight } from 'lucide-react';

const WORKOUT_A = {
  id: 'workout_a',
  title: 'Workout A — Full Body Foundation',
  desc: 'Focus on posture, chest/back balance, and lower body strength',
  exercises: [
    { name: 'Goblet Squat', sets: 3, reps: '10–15 reps', tip: 'Hold one 5kg dumbbell vertically close to chest. Keep chest up and drop hips below knees if comfortable.' },
    { name: 'Dumbbell Floor Press', sets: 3, reps: '10–15 reps', tip: 'Lie flat on floor with elbows at 45 degrees. Press both 5kg dumbbells straight up over chest.' },
    { name: 'One-arm Dumbbell Row', sets: 3, reps: '10–15 reps (each side)', tip: 'Support knee/hand on chair or sofa. Pull 5kg dumbbell to hip with elbow tucked.' },
    { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '10–15 reps', tip: 'Hold dumbbells in front of thighs, hinge at hips with flat back, push glutes back.' },
    { name: 'Dumbbell Shoulder Press', sets: 2, reps: '10–15 reps', tip: 'Seated or standing, press dumbbells overhead without arching lower back.' },
    { name: 'Plank', sets: 3, reps: '20–40 seconds', tip: 'Forearms on floor, brace core tight, squeeze glutes, keep neck neutral.' }
  ]
};

const WORKOUT_B = {
  id: 'workout_b',
  title: 'Workout B — Muscle & Core Balance',
  desc: 'Upper body posture, arms, and deep core stability',
  exercises: [
    { name: 'Bodyweight / Chair Squat', sets: 3, reps: '12–20 reps', tip: 'Sit back into a chair lightly, then drive up through heels.' },
    { name: 'Dumbbell Floor Press', sets: 3, reps: '10–15 reps', tip: 'Press dumbbells cleanly from floor level for chest and triceps focus.' },
    { name: 'Bent-over Dumbbell Row', sets: 3, reps: '10–15 reps', tip: 'Hinge forward, pull both dumbbells simultaneously toward belly button.' },
    { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '10–15 reps', tip: 'Hinge hips back, feel hamstrings stretch, squeeze glutes at top.' },
    { name: 'Dumbbell Biceps Curl', sets: 2, reps: '12–15 reps', tip: 'Keep elbows pinned to sides, control the descent.' },
    { name: 'Dumbbell Overhead Triceps Extension', sets: 2, reps: '12–15 reps', tip: 'Hold one 5kg dumbbell overhead with both hands, lower behind head.' },
    { name: 'Dead Bug', sets: 3, reps: '8–12 reps (each side)', tip: 'Lie on back, extend opposite arm and leg while pressing lower back into floor.' }
  ]
};

const WORKOUT_ROUTINES = { 'A': WORKOUT_A, 'B': WORKOUT_B };

export default function DumbbellWorkouts({ onCompleteWorkout }) {
  const [activeTab, setActiveTab] = useState('A'); // 'A' or 'B'
  const [activeSession, setActiveSession] = useState(null); // 'A' or 'B' or null
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [completedSets, setCompletedSets] = useState({}); // { "0-0": true, "0-1": true }

  // Workout History State
  const [workoutHistory, setWorkoutHistory] = useState(() => {
    const saved = localStorage.getItem('transformation_workout_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'wo-1', date: '2026-08-11', type: 'Workout A', duration: 24, sets: 12, title: 'Upper Body & Arms', note: '2 × 5kg Dumbbells' },
      { id: 'wo-2', date: '2026-08-13', type: 'Workout B', duration: 26, sets: 12, title: 'Legs & Core', note: 'Goblet squats + lunges' },
      { id: 'wo-3', date: '2026-08-15', type: 'Workout A', duration: 25, sets: 12, title: 'Upper Body & Arms', note: 'Clean form, good control' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('transformation_workout_history', JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  // Active workout timer tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest timer countdown
  useEffect(() => {
    let restInterval = null;
    if (restTimer > 0) {
      restInterval = setInterval(() => setRestTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(restInterval);
  }, [restTimer]);

  const startWorkout = (workoutType) => {
    setActiveSession(workoutType);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setCompletedSets({});
  };

  const endWorkout = () => {
    setIsTimerRunning(false);
    const durationMins = Math.max(1, Math.round(timerSeconds / 60));
    const setsCount = Object.values(completedSets).filter(Boolean).length;
    const todayStr = new Date().toISOString().split('T')[0];

    const newSession = {
      id: `wo-${Date.now()}`,
      date: todayStr,
      type: `Workout ${activeSession}`,
      duration: durationMins,
      sets: setsCount || 12,
      title: activeSession === 'A' ? 'Upper Body & Arms' : 'Legs & Core',
      note: 'Completed all target reps with 2 × 5kg'
    };

    setWorkoutHistory(prev => [newSession, ...prev]);

    if (onCompleteWorkout) {
      onCompleteWorkout(activeSession);
    }
    setActiveSession(null);
  };

  const handleDeleteWorkoutRecord = (id) => {
    if (window.confirm('Delete this workout session record?')) {
      setWorkoutHistory(prev => prev.filter(w => w.id !== id));
    }
  };

  const toggleSet = (exIndex, setIndex) => {
    const key = `${exIndex}-${setIndex}`;
    setCompletedSets(prev => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
    // Start 45 sec rest timer automatically on set completion!
    setRestTimer(45);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentWorkout = activeTab === 'A' ? WORKOUT_A : WORKOUT_B;
  // Escape key listener for workout modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeSession) {
        setActiveSession(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSession]);

  const activeWorkoutObj = activeSession ? WORKOUT_ROUTINES[activeSession] : null;

  return (
    <section id="dumbbell-workouts" className="fitness-card">
      <div className="card-header-clean" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Dumbbell size={20} />
          </div>
          <div>
            <h2 className="card-title">Home Dumbbell Workouts</h2>
            <p className="card-subtitle">Designed for two 5 kg dumbbells — no gym needed</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '0.25rem', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('A')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: activeTab === 'A' ? 'var(--gold-gradient)' : 'transparent',
              color: activeTab === 'A' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Workout A (Upper)
          </button>
          <button
            onClick={() => setActiveTab('B')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: activeTab === 'B' ? 'var(--gold-gradient)' : 'transparent',
              color: activeTab === 'B' ? '#000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Workout B (Lower/Core)
          </button>
        </div>
      </div>

      {/* Equipment info & start workout action */}
      <div style={{
        background: 'rgba(255, 215, 0, 0.06)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Info size={16} color="var(--gold-primary)" />
          <span style={{ color: 'var(--text-white)' }}>Available Equipment: <strong>2 × 5 kg Dumbbells</strong></span>
        </div>
        <button 
          onClick={() => startWorkout(activeTab)} 
          className="btn-gold"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
        >
          <Play size={14} fill="#000" /> Start Workout {activeTab}
        </button>
      </div>

      {/* Exercises List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
            {currentWorkout.title}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {currentWorkout.desc}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {currentWorkout.exercises.map((ex, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-white)', fontSize: '0.95rem' }}>
                  {idx + 1}. {ex.name}
                </span>
                <span className="gold-tag" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                  {ex.sets} sets × {ex.reps}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {ex.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* WORKOUT SESSION HISTORY & VOLUME TRACKER */}
      <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Dumbbell size={16} color="var(--gold-primary)" /> Workout Session History ({workoutHistory.length})
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Progressive overload & consistency log</p>
          </div>
          <span className="gold-tag" style={{ fontSize: '0.68rem' }}>
            Target: 3x / Week
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No workout sessions completed yet. Click <strong>"Start Workout"</strong> above to time your first session!
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="clean-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Routine</th>
                  <th>Duration</th>
                  <th>Volume / Sets</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {workoutHistory.map(wo => (
                  <tr key={wo.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-white)' }}>{wo.date}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Completed</div>
                    </td>
                    <td>
                      <span className="gold-tag" style={{ fontSize: '0.68rem' }}>{wo.type}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-white)', marginTop: '0.2rem', fontWeight: 600 }}>{wo.title}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {wo.duration} min
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa', fontWeight: 700 }}>
                      {wo.sets} sets (2 × 5kg)
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {wo.note || 'Full sets completed'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteWorkoutRecord(wo.id)}
                        className="btn-danger-subtle"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACTIVE WORKOUT RUNNER MODAL */}
      {activeSession && (
        <div className="modal-overlay" onClick={() => setActiveSession(null)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span className="gold-tag">Workout Mode Active</span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-white)', marginTop: '0.2rem' }}>
                  {activeWorkoutObj.title}
                </h2>
              </div>
              <button 
                onClick={() => setActiveSession(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Timer Bar */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={22} color="var(--gold-primary)" />
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Elapsed Time</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--gold-primary)' }}>
                    {formatTime(timerSeconds)}
                  </div>
                </div>
              </div>

              {restTimer > 0 && (
                <div style={{ textAlign: 'right', background: 'rgba(16, 185, 129, 0.15)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', textTransform: 'uppercase', fontWeight: 700 }}>Rest Timer</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                    {restTimer}s
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Exercise Step List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '50vh', overflowY: 'auto' }}>
              {activeWorkoutObj.exercises.map((ex, exIdx) => (
                <div key={exIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-white)' }}>{exIdx + 1}. {ex.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)' }}>{ex.reps}</span>
                  </div>
                  
                  {/* Set Checkboxes */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Array.from({ length: ex.sets }).map((_, setIdx) => {
                      const isSetDone = completedSets[`${exIdx}-${setIdx}`];
                      return (
                        <button
                          key={setIdx}
                          onClick={() => toggleSet(exIdx, setIdx)}
                          style={{
                            flex: 1,
                            padding: '0.4rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            border: isSetDone ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                            background: isSetDone ? 'var(--gold-gradient)' : 'rgba(255,255,255,0.05)',
                            color: isSetDone ? '#000' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <CheckCircle2 size={12} /> Set {setIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <button onClick={() => setActiveSession(null)} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={endWorkout} className="btn-gold" style={{ flex: 2 }}>
                <CheckCircle2 size={18} /> Finish Workout & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
