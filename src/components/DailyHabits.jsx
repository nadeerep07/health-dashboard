import React from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Footprints, 
  Flame, 
  Beef, 
  Droplets, 
  Ban, 
  Cookie, 
  Moon,
  Sparkles,
  RotateCcw
} from 'lucide-react';

const iconMap = {
  Footprints,
  Flame,
  Beef,
  Droplets,
  Ban,
  Cookie,
  Moon,
};

export default function DailyHabits({ habits, onToggleHabit, onResetHabits }) {
  const total = habits.length;
  const completedCount = habits.filter(h => h.completed).length;
  const percentage = Math.round((completedCount / total) * 100);

  const handleToggle = (id) => {
    const nextHabits = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    const nextCompleted = nextHabits.filter(h => h.completed).length;
    
    // Trigger confetti if hitting 100%
    if (nextCompleted === total && completedCount !== total) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ffffff', '#e5b539']
        });
      } catch (e) {
        console.log('Confetti effect', e);
      }
    }
    
    onToggleHabit(id);
  };

  return (
    <section id="daily-habits" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="card-title">Daily Habits</h2>
            <p className="card-subtitle">Non-negotiable daily foundation for sustainable loss</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={onResetHabits}
            className="btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
            title="Reset daily habits for a new day"
          >
            <RotateCcw size={13} /> Reset Day
          </button>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
              {completedCount}/{total}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>({percentage}%)</span>
          </div>
        </div>
      </div>

      {/* Progress ring bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="progress-track" style={{ height: '8px' }}>
          <div 
            className="progress-fill-gold" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Habits List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {habits.map((habit) => {
          const IconComponent = iconMap[habit.icon] || Sparkles;
          return (
            <div
              key={habit.id}
              onClick={() => handleToggle(habit.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                background: habit.completed ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: habit.completed ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <div 
                  className={`custom-checkbox ${habit.completed ? 'checked' : ''}`}
                >
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>

                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: habit.completed ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: habit.completed ? 'var(--gold-primary)' : 'var(--text-muted)'
                }}>
                  <IconComponent size={18} />
                </div>

                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: habit.completed ? 'var(--gold-primary)' : 'var(--text-white)',
                    textDecoration: habit.completed ? 'line-through' : 'none'
                  }}>
                    {habit.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {habit.desc}
                  </div>
                </div>
              </div>

              {habit.completed && (
                <span className="gold-tag" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                  DONE
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
