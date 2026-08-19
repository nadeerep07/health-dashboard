import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressRing from '../ui/ProgressRing';
import ProgressBar from '../ui/ProgressBar';
import Metric from '../ui/Metric';
import DateSwitcherBar from '../ui/DateSwitcherBar';
import {
  Sparkles,
  TrendingDown,
  Utensils,
  Footprints,
  Droplets,
  Moon,
  Dumbbell,
  CheckCircle2,
  ChevronRight,
  Flame,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { getLocalDateString, getDayOfWeekKey, getWeekIdentifier } from '../../utils/dateUtils';
import { resolveHabitsForDate, resolveWaterForDate, resolveWorkoutsForWeek } from '../../utils/storage';

/**
 * Screen 1: Dashboard Home (Daily Transformation Coach)
 * Inspires confidence and clarity in < 5 seconds with day-to-day isolation
 */
export default function DashboardHome({
  userName = 'Nidhu',
  currentWeight = 110.80,
  startWeight = 110.80,
  targetWeight = 100.00,
  sevenDayAvg = 110.80,
  weeklyDeltaKg = -0.60,
  foodLogs = {},
  selectedDate,
  onSelectDate,
  walkingLogs = [],
  waterByDate = {},
  habitsByDate = {},
  weeklyWorkoutsByWeek = {},
  sleepLogs = [],
  onToggleHabit,
  onNavigate,
  onOpenQuickAdd,
}) {
  const todayStr = selectedDate || getLocalDateString();
  const currentHabits = resolveHabitsForDate(habitsByDate, todayStr);
  const currentWater = resolveWaterForDate(waterByDate, todayStr);
  
  const currentWeekKey = getWeekIdentifier(todayStr);
  const currentWeekWorkouts = resolveWorkoutsForWeek(weeklyWorkoutsByWeek, currentWeekKey);
  const todayDayId = getDayOfWeekKey(todayStr);
  const isWorkoutDone = !!currentWeekWorkouts[todayDayId]?.workout;

  const activeMeals = foodLogs[todayStr] || { breakfast: [], lunch: [], snack: [], dinner: [] };
  const allFoods = [
    ...(activeMeals.breakfast || []),
    ...(activeMeals.lunch || []),
    ...(activeMeals.snack || []),
    ...(activeMeals.dinner || []),
  ];

  // Nutrition calculations
  const totalCaloriesConsumed = allFoods.reduce((s, i) => s + (Number(i.calories) || 0), 0);
  const totalProteinConsumed = allFoods.reduce((s, i) => s + (Number(i.protein) || 0), 0);
  const calorieBudget = 2100;
  const proteinGoal = 130;
  const caloriesRemaining = Math.max(calorieBudget - totalCaloriesConsumed, 0);
  const proteinRemaining = Math.max(proteinGoal - totalProteinConsumed, 0);
  const caloriePct = Math.min(Math.round((totalCaloriesConsumed / calorieBudget) * 100), 120);
  const proteinPct = Math.min(Math.round((totalProteinConsumed / proteinGoal) * 100), 100);

  // Walking calculations
  const todayWalks = walkingLogs.filter(w => w.date === todayStr);
  const todayWalkKm = todayWalks.reduce((s, w) => s + (Number(w.distance) || 0), 0);
  const walkGoalKm = 5.0;
  const walkPct = Math.min(Math.round((todayWalkKm / walkGoalKm) * 100), 100);

  // Water calculations
  const waterConsumedL = ((currentWater.consumedMl || 0) / 1000).toFixed(1);
  const waterTargetL = ((currentWater.targetMl || 3500) / 1000).toFixed(1);
  const waterPct = Math.min(Math.round(((currentWater.consumedMl || 0) / (currentWater.targetMl || 3500)) * 100), 100);

  // Calculate Unified Adherence Score /100
  const scoreNutrition = Math.min(caloriePct, 100) * 0.25; // 25 max
  const scoreProtein = Math.min(proteinPct, 100) * 0.25;   // 25 max
  const scoreWalk = Math.min(walkPct, 100) * 0.20;         // 20 max
  const scoreWater = Math.min(waterPct, 100) * 0.15;       // 15 max
  const scoreWorkout = (isWorkoutDone ? 15 : 0);           // 15 max
  const overallScore = Math.round(scoreNutrition + scoreProtein + scoreWalk + scoreWater + scoreWorkout);

  // Remaining weight to goal
  const remainingWeight = (currentWeight - targetWeight).toFixed(2);
  const totalToLose = startWeight - targetWeight;
  const lostSoFar = startWeight - currentWeight;
  const journeyProgressPct = totalToLose > 0 ? Math.min(Math.max((lostSoFar / totalToLose) * 100, 0), 100).toFixed(1) : 0;

  // Intelligent "Next Best Action" logic
  const getNextBestAction = () => {
    if (todayWalkKm < 5.0) {
      return {
        icon: Footprints,
        color: '#34d399',
        title: `Complete your 5.0 km walk (${(5.0 - todayWalkKm).toFixed(1)} km remaining)`,
        subtitle: 'Target 50–60 min aerobic cardio to burn 350+ kcal',
        actionLabel: 'Log Walk',
        actionTab: 'walk',
      };
    }
    if ((currentWater.consumedMl || 0) < 3000) {
      return {
        icon: Droplets,
        color: '#38bdf8',
        title: `Hydrate: ${(((currentWater.targetMl || 3500) - (currentWater.consumedMl || 0)) / 1000).toFixed(1)}L water to daily target`,
        subtitle: 'Drink 500 ml before your next meal',
        actionLabel: '+500ml Water',
        actionTab: 'water',
      };
    }
    if (totalProteinConsumed < 100) {
      return {
        icon: Utensils,
        color: 'var(--brand-primary)',
        title: `Add ${proteinRemaining.toFixed(0)}g protein to reach your 130g goal`,
        subtitle: 'Ideal options: 2 boiled eggs, 100g chicken breast, or 1 scoop whey',
        actionLabel: 'Log Food',
        actionTab: 'food',
      };
    }
    if (!isWorkoutDone && (todayDayId === 'mon' || todayDayId === 'wed' || todayDayId === 'fri')) {
      return {
        icon: Dumbbell,
        color: '#a855f7',
        title: "Complete today's Dumbbell Routine",
        subtitle: '35 min Dumbbell session with 5kg dumbbells',
        actionLabel: 'View Workout',
        screen: 'plan',
      };
    }
    return {
      icon: Moon,
      color: '#818cf8',
      title: 'Wind down for 8 hours of restorative sleep',
      subtitle: 'Avoid screens 30 minutes before bedtime',
      actionLabel: 'Sleep Tracker',
      screen: 'more',
    };
  };

  const nextAction = getNextBestAction();
  const NextActionIcon = nextAction.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 0. Universal Date Switcher Bar */}
      <DateSwitcherBar
        selectedDate={todayStr}
        onSelectDate={onSelectDate}
      />

      {/* 1. Header Greeting & Hero Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-white)', letterSpacing: '-0.02em' }}>
              Welcome Back, {userName}!
            </h1>
            <span style={{ fontSize: '1.2rem' }}>🔥</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Target: <b>100.0 KG</b> by Dec 31 • Consistency beats intensity
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant={overallScore >= 80 ? 'success' : overallScore >= 50 ? 'gold' : 'neutral'} size="lg">
            Score: {overallScore}/100
          </Badge>
        </div>
      </div>

      {/* 2. Hero Transformation Trajectory Card */}
      <Card variant="gradient" padding="1.5rem">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
          {/* Main Weight Progress */}
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary-soft)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Weight Transformation
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
                {Number(currentWeight).toFixed(2)}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                KG
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                <TrendingDown size={14} />
                <span>{lostSoFar > 0 ? `-${lostSoFar.toFixed(2)} kg lost` : 'Baseline set'}</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {remainingWeight} kg to goal (100.0)
              </span>
            </div>
          </div>

          {/* 7-Day Trend SMA & Pace */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>7-Day Rolling SMA</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-white)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                {sevenDayAvg.toFixed(2)} kg
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dec 31 Trajectory</span>
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
                🟢 On Track (~0.55 kg/wk)
              </span>
            </div>
            <ProgressBar value={Number(journeyProgressPct)} height={6} variant="brand" />
          </div>
        </div>
      </Card>

      {/* 3. Daily Compliance Pillars (4 Core Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Pillar 1: Nutrition & Calories */}
        <Card variant="default" padding="1.1rem" onClick={() => onNavigate('nutrition')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--brand-primary)', padding: '0.4rem', borderRadius: 'var(--radius-xs)', display: 'flex' }}>
                <Utensils size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-white)' }}>Calories</span>
            </div>
            <Badge variant={totalCaloriesConsumed <= calorieBudget ? 'success' : 'warning'} size="sm">
              {caloriesRemaining} kcal left
            </Badge>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {totalCaloriesConsumed}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 2,100 kcal</span>
            </div>
            <ProgressBar value={caloriePct} height={6} variant={caloriePct > 100 ? 'danger' : 'brand'} />
          </div>
        </Card>

        {/* Pillar 2: Protein Target */}
        <Card variant="default" padding="1.1rem" onClick={() => onNavigate('nutrition')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.4rem', borderRadius: 'var(--radius-xs)', display: 'flex' }}>
                <Flame size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-white)' }}>Protein</span>
            </div>
            <Badge variant={totalProteinConsumed >= 120 ? 'success' : 'neutral'} size="sm">
              {proteinRemaining.toFixed(0)}g needed
            </Badge>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {totalProteinConsumed.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 130g</span>
            </div>
            <ProgressBar value={proteinPct} height={6} variant="secondary" />
          </div>
        </Card>

        {/* Pillar 3: Walking Distance */}
        <Card variant="default" padding="1.1rem" onClick={() => onNavigate('today')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.4rem', borderRadius: 'var(--radius-xs)', display: 'flex' }}>
                <Footprints size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-white)' }}>5.0 KM Walk</span>
            </div>
            <Badge variant={todayWalkKm >= 5.0 ? 'success' : 'gold'} size="sm">
              {todayWalkKm >= 5.0 ? '✓ Goal Met' : `${(5.0 - todayWalkKm).toFixed(1)} km left`}
            </Badge>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {todayWalkKm.toFixed(1)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 5.0 km</span>
            </div>
            <ProgressBar value={walkPct} height={6} variant="success" />
          </div>
        </Card>

        {/* Pillar 4: Water Hydration */}
        <Card variant="default" padding="1.1rem" onClick={() => onNavigate('more')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.4rem', borderRadius: 'var(--radius-xs)', display: 'flex' }}>
                <Droplets size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-white)' }}>Hydration</span>
            </div>
            <Badge variant={(currentWater.consumedMl || 0) >= 3000 ? 'success' : 'neutral'} size="sm">
              {waterPct}% Target
            </Badge>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {waterConsumedL}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {waterTargetL} L</span>
            </div>
            <ProgressBar value={waterPct} height={6} variant="info" />
          </div>
        </Card>
      </div>

      {/* 4. Intelligent Next Best Action Banner */}
      <Card variant="accent" padding="1.25rem">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: nextAction.color,
                flexShrink: 0,
              }}
            >
              <NextActionIcon size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recommended Next Step
              </span>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-white)', marginTop: '0.1rem' }}>
                {nextAction.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                {nextAction.subtitle}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (nextAction.actionTab && onOpenQuickAdd) {
                onOpenQuickAdd(nextAction.actionTab);
              } else if (nextAction.screen) {
                onNavigate(nextAction.screen);
              }
            }}
            icon={ArrowRight}
          >
            {nextAction.actionLabel}
          </Button>
        </div>
      </Card>

      {/* 5. Daily Habits Quick Ledger for Selected Date */}
      <Card variant="default" padding="1.25rem">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)' }}>
              Daily Habits Checklist ({todayStr})
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Non-negotiable transformation foundation
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
            {currentHabits.filter(h => h.completed).length} / {currentHabits.length} Complete
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.6rem' }}>
          {currentHabits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => onToggleHabit && onToggleHabit(todayStr, habit.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: habit.completed ? 'rgba(245, 158, 11, 0.08)' : 'var(--surface-secondary)',
                border: habit.completed ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className={`custom-checkbox ${habit.completed ? 'checked' : ''}`}>
                  <CheckCircle2 size={14} strokeWidth={3} />
                </div>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: habit.completed ? 'var(--brand-primary-soft)' : 'var(--text-white)',
                    textDecoration: habit.completed ? 'line-through' : 'none',
                  }}
                >
                  {habit.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
