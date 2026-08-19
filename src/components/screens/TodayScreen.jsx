import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import DateSwitcherBar from '../ui/DateSwitcherBar';
import {
  Calendar,
  CheckCircle2,
  Circle,
  TrendingDown,
  Utensils,
  Footprints,
  Droplets,
  Moon,
  Dumbbell,
  Sparkles,
  Plus,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { getLocalDateString, getDayOfWeekKey, getWeekIdentifier } from '../../utils/dateUtils';
import { resolveHabitsForDate, resolveWaterForDate, resolveWorkoutsForWeek } from '../../utils/storage';

/**
 * Screen 2: Today Screen (Consolidated Daily Compliance Ledger)
 * Fully isolated by date
 */
export default function TodayScreen({
  selectedDate,
  onSelectDate,
  foodLogs = {},
  weightLogs = [],
  walkingLogs = [],
  waterByDate = {},
  habitsByDate = {},
  weeklyWorkoutsByWeek = {},
  sleepLogs = [],
  onToggleHabit,
  onResetDayHabits,
  onOpenQuickAdd,
  onNavigate,
}) {
  const activeDate = selectedDate || getLocalDateString();
  const currentHabits = resolveHabitsForDate(habitsByDate, activeDate);
  const currentWater = resolveWaterForDate(waterByDate, activeDate);
  
  const activeWeekKey = getWeekIdentifier(activeDate);
  const activeWeekWorkouts = resolveWorkoutsForWeek(weeklyWorkoutsByWeek, activeWeekKey);
  const activeDayKey = getDayOfWeekKey(activeDate);
  const isWorkoutDone = !!activeWeekWorkouts[activeDayKey]?.workout;

  const activeMeals = foodLogs[activeDate] || { breakfast: [], lunch: [], snack: [], dinner: [] };
  const allFoods = [
    ...(activeMeals.breakfast || []),
    ...(activeMeals.lunch || []),
    ...(activeMeals.snack || []),
    ...(activeMeals.dinner || []),
  ];

  const totalCal = allFoods.reduce((s, i) => s + (Number(i.calories) || 0), 0);
  const totalProtein = allFoods.reduce((s, i) => s + (Number(i.protein) || 0), 0);
  const todayWeight = weightLogs.find(w => w.date === activeDate);
  const todayWalks = walkingLogs.filter(w => w.date === activeDate);
  const walkKm = todayWalks.reduce((s, w) => s + (Number(w.distance) || 0), 0);
  const waterL = ((currentWater.consumedMl || 0) / 1000).toFixed(1);

  // Daily checklist items
  const ledgerItems = [
    {
      id: 'weight',
      title: 'Morning Fasted Weigh-In',
      subtitle: todayWeight ? `${Number(todayWeight.weight).toFixed(2)} kg recorded` : 'Log your morning weight',
      icon: TrendingDown,
      completed: !!todayWeight,
      color: 'var(--brand-secondary)',
      actionTab: 'weight',
    },
    {
      id: 'walk',
      title: '5.0 km Cardio Walking',
      subtitle: walkKm >= 5.0 ? `✓ Target Hit (${walkKm.toFixed(1)} km)` : `${walkKm.toFixed(1)} / 5.0 km logged`,
      icon: Footprints,
      completed: walkKm >= 5.0,
      color: 'var(--brand-primary-soft)',
      actionTab: 'walk',
    },
    {
      id: 'meals',
      title: 'Daily Nutrition & 130g Protein',
      subtitle: `${totalCal} kcal • ${totalProtein.toFixed(0)}g protein logged`,
      icon: Utensils,
      completed: totalCal > 0 && totalCal <= 2150 && totalProtein >= 100,
      color: 'var(--brand-primary)',
      actionTab: 'food',
    },
    {
      id: 'water',
      title: '3.5L Daily Hydration',
      subtitle: `${waterL} / 3.5 L consumed`,
      icon: Droplets,
      completed: (currentWater.consumedMl || 0) >= 3000,
      color: '#38bdf8',
      actionTab: 'water',
    },
    {
      id: 'workout',
      title: 'Dumbbell Routine (Mon, Wed, Fri)',
      subtitle: isWorkoutDone ? '✓ Dumbbell session completed' : 'Upper body & Core progressive overload',
      icon: Dumbbell,
      completed: isWorkoutDone,
      color: '#a855f7',
      screen: 'plan',
    },
  ];

  const completedCount = ledgerItems.filter(i => i.completed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Universal Date Switcher Bar */}
      <DateSwitcherBar
        selectedDate={activeDate}
        onSelectDate={onSelectDate}
      />

      {/* Progress Summary Card */}
      <Card variant="gradient">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Daily Completion ({activeDate})
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
              {completedCount} of {ledgerItems.length} Complete
            </div>
          </div>
          <Badge variant={completedCount >= 4 ? 'success' : 'gold'} size="lg">
            {completedCount >= 4 ? '🔥 High Adherence' : 'Active Day'}
          </Badge>
        </div>
      </Card>

      {/* Ledger Items Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {ledgerItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              variant="default"
              padding="1rem 1.25rem"
              style={{
                background: item.completed ? 'rgba(16, 185, 129, 0.06)' : 'var(--surface-card)',
                borderColor: item.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-medium)',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (item.actionTab && onOpenQuickAdd) {
                  onOpenQuickAdd(item.actionTab);
                } else if (item.screen && onNavigate) {
                  onNavigate(item.screen);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      background: item.completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-secondary)',
                      color: item.completed ? '#34d399' : item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.completed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 700, fontSize: '0.82rem' }}>
                      <CheckCircle2 size={20} strokeWidth={2.5} />
                      <span>Done</span>
                    </div>
                  ) : (
                    <Button variant="secondary" size="sm">
                      Log
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Daily Non-Negotiable Habits for Active Date */}
      <Card variant="default" padding="1.25rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)' }}>
              Non-Negotiable Habits ({activeDate})
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Checkboxes automatically stay isolated to this specific date
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResetDayHabits && onResetDayHabits(activeDate)}
              icon={RotateCcw}
              title="Reset habits for this day only"
            >
              Reset Day
            </Button>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
              {currentHabits.filter(h => h.completed).length}/{currentHabits.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {currentHabits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => onToggleHabit && onToggleHabit(activeDate, habit.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                background: habit.completed ? 'rgba(245, 158, 11, 0.08)' : 'var(--surface-secondary)',
                border: habit.completed ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className={`custom-checkbox ${habit.completed ? 'checked' : ''}`}>
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: habit.completed ? 'var(--brand-primary-soft)' : 'var(--text-white)',
                      textDecoration: habit.completed ? 'line-through' : 'none',
                    }}
                  >
                    {habit.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {habit.desc}
                  </div>
                </div>
              </div>

              {habit.completed && (
                <Badge variant="success" size="sm">
                  Completed
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
