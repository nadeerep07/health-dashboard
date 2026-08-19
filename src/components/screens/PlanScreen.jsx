import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
  Dumbbell,
  Play,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Footprints,
} from 'lucide-react';
import { getLocalDateString, getWeekIdentifier, getWeekDays, shiftDate } from '../../utils/dateUtils';
import { resolveWorkoutsForWeek } from '../../utils/storage';

/**
 * Screen 5: Plan & Workout Execution Screen
 * Features multi-week schedule isolation and dumbbell exercise tracking
 */
export default function PlanScreen({
  weeklyWorkoutsByWeek = {},
  onToggleWeeklyTask,
  onCompleteWorkout,
}) {
  const [activeWorkoutTab, setActiveWorkoutTab] = useState('A'); // 'A' | 'B'
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedExercises, setCompletedExercises] = useState({});
  const [selectedWeekDate, setSelectedWeekDate] = useState(() => getLocalDateString());

  const weekInfo = getWeekDays(selectedWeekDate);
  const currentWeekWorkouts = resolveWorkoutsForWeek(weeklyWorkoutsByWeek, weekInfo.weekKey);

  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const startRestTimer = (secs = 60) => {
    setTimerSeconds(secs);
    setTimerRunning(true);
  };

  const toggleExerciseDone = (exId) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exId]: !prev[exId],
    }));
  };

  const handlePrevWeek = () => {
    setSelectedWeekDate(prev => shiftDate(prev, -7));
  };

  const handleNextWeek = () => {
    setSelectedWeekDate(prev => shiftDate(prev, 7));
  };

  const handleCurrentWeek = () => {
    setSelectedWeekDate(getLocalDateString());
  };

  const isCurrentWeek = weekInfo.weekKey === getWeekIdentifier();

  const workoutAExercises = [
    { id: 'a-1', name: 'Goblet Squats', sets: '3 Sets', reps: '12 Reps', weight: '5 kg DB', muscle: 'Quads & Glutes' },
    { id: 'a-2', name: 'Dumbbell Floor Press', sets: '3 Sets', reps: '10-12 Reps', weight: '2x 5 kg DB', muscle: 'Chest & Triceps' },
    { id: 'a-3', name: 'Dumbbell Bent-Over Row', sets: '3 Sets', reps: '12 Reps', weight: '2x 5 kg DB', muscle: 'Upper Back & Lats' },
    { id: 'a-4', name: 'Standing Overhead Press', sets: '3 Sets', reps: '10 Reps', weight: '2x 5 kg DB', muscle: 'Shoulders' },
    { id: 'a-5', name: 'Plank Hold', sets: '3 Sets', reps: '30-45 Secs', weight: 'Bodyweight', muscle: 'Core' },
  ];

  const workoutBExercises = [
    { id: 'b-1', name: 'Romanian Deadlift (RDL)', sets: '3 Sets', reps: '12 Reps', weight: '2x 5 kg DB', muscle: 'Hamstrings & Glutes' },
    { id: 'b-2', name: 'Dumbbell Lateral Raises', sets: '3 Sets', reps: '12-15 Reps', weight: '2x 5 kg DB', muscle: 'Side Delts' },
    { id: 'b-3', name: 'Hammer Bicep Curls', sets: '3 Sets', reps: '12 Reps', weight: '2x 5 kg DB', muscle: 'Biceps & Forearms' },
    { id: 'b-4', name: 'Overhead Tricep Extension', sets: '3 Sets', reps: '12 Reps', weight: '1x 5 kg DB', muscle: 'Triceps' },
    { id: 'b-5', name: 'Deadbugs / Core Tucks', sets: '3 Sets', reps: '15 Reps', weight: 'Bodyweight', muscle: 'Deep Core' },
  ];

  const currentExercises = activeWorkoutTab === 'A' ? workoutAExercises : workoutBExercises;
  const allCurrentDone = currentExercises.every((e) => completedExercises[e.id]);

  const daysPlan = [
    { id: 'mon', label: 'Mon', focus: 'Workout A + 5km Walk', hasWorkout: true, type: 'Workout A' },
    { id: 'tue', label: 'Tue', focus: '5km Walk + Recovery', hasWorkout: false },
    { id: 'wed', label: 'Wed', focus: 'Workout B + 5km Walk', hasWorkout: true, type: 'Workout B' },
    { id: 'thu', label: 'Thu', focus: '5km Walk + Core', hasWorkout: false },
    { id: 'fri', label: 'Fri', focus: 'Workout A + 5km Walk', hasWorkout: true, type: 'Workout A' },
    { id: 'sat', label: 'Sat', focus: '5km Walk + Stretch', hasWorkout: false },
    { id: 'sun', label: 'Sun', focus: 'Active Recovery Walk', hasWorkout: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Weekly Routine & Dumbbell Training
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            3-Day Dumbbell progressive overload (5kg) + Daily 5km cardio walk
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface-secondary)', padding: '0.2rem', borderRadius: 'var(--radius-xs)' }}>
          <button
            type="button"
            onClick={() => setActiveWorkoutTab('A')}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              background: activeWorkoutTab === 'A' ? 'var(--brand-primary)' : 'transparent',
              color: activeWorkoutTab === 'A' ? '#0b1110' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Workout A
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkoutTab('B')}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              background: activeWorkoutTab === 'B' ? 'var(--brand-primary)' : 'transparent',
              color: activeWorkoutTab === 'B' ? '#0b1110' : 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Workout B
          </button>
        </div>
      </div>

      {/* 1. Week Selector Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.65rem 0.95rem',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handlePrevWeek}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-white)',
              cursor: 'pointer',
            }}
            title="Previous Week"
          >
            <ChevronLeft size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} color="var(--brand-primary-soft)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-white)' }}>
              {weekInfo.weekKey} ({weekInfo.startDate} to {weekInfo.endDate})
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextWeek}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-white)',
              cursor: 'pointer',
            }}
            title="Next Week"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {!isCurrentWeek && (
          <Button variant="secondary" size="sm" onClick={handleCurrentWeek} icon={RotateCcw}>
            Current Week
          </Button>
        )}
      </div>

      {/* 2. Interactive Weekly Workout Schedule */}
      <Card variant="default" padding="1.25rem">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '0.85rem' }}>
          Weekly Checklist ({weekInfo.weekKey})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {daysPlan.map((d) => {
            const dayStatus = currentWeekWorkouts[d.id] || { walk: false, workout: false };
            return (
              <div
                key={d.id}
                style={{
                  background: (dayStatus.walk || dayStatus.workout) ? 'rgba(245, 158, 11, 0.06)' : 'var(--surface-secondary)',
                  border: (dayStatus.walk || dayStatus.workout) ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                    {d.label}
                  </span>
                  {d.hasWorkout && (
                    <Badge variant="gold" size="sm">
                      {d.type}
                    </Badge>
                  )}
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-white)', lineHeight: 1.2 }}>
                  {d.focus}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: 'auto' }}>
                  {/* Walk toggle */}
                  <div
                    onClick={() => onToggleWeeklyTask && onToggleWeeklyTask(weekInfo.weekKey, d.id, 'walk')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.55rem',
                      background: dayStatus.walk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      fontSize: '0.72rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: dayStatus.walk ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                      <Footprints size={12} /> 5km Walk
                    </span>
                    <div className={`custom-checkbox ${dayStatus.walk ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                      <CheckCircle2 size={12} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Workout toggle if applicable */}
                  {d.hasWorkout && (
                    <div
                      onClick={() => onToggleWeeklyTask && onToggleWeeklyTask(weekInfo.weekKey, d.id, 'workout')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.35rem 0.55rem',
                        background: dayStatus.workout ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: dayStatus.workout ? '#c084fc' : 'var(--text-muted)', fontWeight: 600 }}>
                        <Dumbbell size={12} /> Dumbbell Session
                      </span>
                      <div className={`custom-checkbox ${dayStatus.workout ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Interactive Workout Exercise Checklist */}
      <Card variant="gradient" padding="1.25rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary-soft)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Full Body Dumbbell Session
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)', marginTop: '0.1rem' }}>
              Routine {activeWorkoutTab} (35 min)
            </h3>
          </div>

          {/* Rest Timer Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Clock size={15} color={timerRunning ? 'var(--brand-primary-soft)' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: timerRunning ? 'var(--brand-primary-soft)' : 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {timerRunning ? `${timerSeconds}s Rest` : '60s Rest'}
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => startRestTimer(60)}
              icon={RotateCcw}
            >
              Start Timer
            </Button>
          </div>
        </div>

        {/* Exercises Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {currentExercises.map((ex, idx) => {
            const isDone = !!completedExercises[ex.id];
            return (
              <div
                key={ex.id}
                onClick={() => toggleExerciseDone(ex.id)}
                style={{
                  background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.3)',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.7rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isDone ? '#34d399' : 'var(--text-white)' }}>
                      {ex.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.6rem', marginTop: '0.1rem' }}>
                      <span>{ex.sets}</span>
                      <span>•</span>
                      <span>{ex.reps}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--brand-primary)' }}>{ex.weight}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Badge variant={isDone ? 'success' : 'neutral'} size="sm">
                    {isDone ? 'Done' : ex.muscle}
                  </Badge>
                  {isDone ? (
                    <CheckCircle2 size={18} color="#10b981" />
                  ) : (
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border-medium)' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allCurrentDone && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Button
              variant="success"
              fullWidth
              size="lg"
              onClick={() => {
                if (onCompleteWorkout) onCompleteWorkout(weekInfo.weekKey, activeWorkoutTab);
                alert(`Workout ${activeWorkoutTab} marked as complete for ${weekInfo.weekKey}! Fantastic effort! 🔥`);
              }}
              icon={CheckCircle2}
            >
              Complete Workout {activeWorkoutTab} Session
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
