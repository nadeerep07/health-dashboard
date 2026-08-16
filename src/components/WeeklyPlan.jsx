import React from 'react';
import { CalendarDays, CheckCircle2, Footprints, Dumbbell, Coffee } from 'lucide-react';

const DAYS_CONFIG = [
  { id: 'mon', name: 'MONDAY', title: '5 km walk + Dumbbell Workout A', hasWorkout: true, workoutType: 'Workout A' },
  { id: 'tue', name: 'TUESDAY', title: '5 km walk', hasWorkout: false },
  { id: 'wed', name: 'WEDNESDAY', title: '5 km walk + Dumbbell Workout B', hasWorkout: true, workoutType: 'Workout B' },
  { id: 'thu', name: 'THURSDAY', title: '5 km walk', hasWorkout: false },
  { id: 'fri', name: 'FRIDAY', title: '5 km walk + Dumbbell Workout A', hasWorkout: true, workoutType: 'Workout A' },
  { id: 'sat', name: 'SATURDAY', title: '5 km walk', hasWorkout: false },
  { id: 'sun', name: 'SUNDAY', title: '5 km walk (Sunday routine)', hasWorkout: false, isSundayWalk: true },
];

export default function WeeklyPlan({ weeklyData, onToggleWeeklyTask }) {
  return (
    <section id="weekly-plan" className="fitness-card">
      <div className="card-header-clean">
        <div className="card-title-group">
          <div className="card-icon-pill">
            <CalendarDays size={20} />
          </div>
          <div>
            <h2 className="card-title">Weekly Workout Plan</h2>
            <p className="card-subtitle">Structured routine with active 5 km walks every day</p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
      }}>
        {DAYS_CONFIG.map((day) => {
          const status = weeklyData[day.id] || { walk: false, workout: false };
          const isFullyCompleted = day.hasWorkout ? (status.walk && status.workout) : status.walk;

          return (
            <div
              key={day.id}
              style={{
                background: isFullyCompleted ? 'rgba(255, 215, 0, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                border: isFullyCompleted ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: isFullyCompleted ? 'var(--gold-primary)' : 'var(--text-white)'
                }}>
                  {day.name}
                </span>
                
                {day.isSundayWalk ? (
                  <span style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                    <Footprints size={12} /> 5 KM WALK
                  </span>
                ) : (
                  day.hasWorkout && (
                    <span className="gold-tag" style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>
                      {day.workoutType}
                    </span>
                  )
                )}
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {day.title}
              </div>

              {/* Task check toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                {/* 5KM Walk check */}
                <div
                  onClick={() => onToggleWeeklyTask(day.id, 'walk')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: status.walk ? 'rgba(255, 215, 0, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
                    <Footprints size={15} color={status.walk ? 'var(--gold-primary)' : 'var(--text-muted)'} />
                    <span>5 km Walk</span>
                  </div>
                  <div className={`custom-checkbox ${status.walk ? 'checked' : ''}`} style={{ width: '18px', height: '18px' }}>
                    <CheckCircle2 size={13} strokeWidth={3} />
                  </div>
                </div>

                {/* Dumbbell Workout check (if applicable) */}
                {day.hasWorkout && (
                  <div
                    onClick={() => onToggleWeeklyTask(day.id, 'workout')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: status.workout ? 'rgba(255, 215, 0, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
                      <Dumbbell size={15} color={status.workout ? 'var(--gold-primary)' : 'var(--text-muted)'} />
                      <span>{day.workoutType} Session</span>
                    </div>
                    <div className={`custom-checkbox ${status.workout ? 'checked' : ''}`} style={{ width: '18px', height: '18px' }}>
                      <CheckCircle2 size={13} strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
