import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressRing from '../ui/ProgressRing';
import ProgressBar from '../ui/ProgressBar';
import Metric from '../ui/Metric';
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

/**
 * Screen 1: Dashboard Home (Daily Transformation Coach)
 * Inspires confidence and clarity in < 5 seconds
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
  walkingLogs = [],
  waterData = { consumedMl: 0, targetMl: 3500 },
  sleepLogs = [],
  habits = [],
  weeklyWorkouts = {},
  onNavigate,
  onOpenQuickAdd,
}) {
  const todayStr = selectedDate || new Date().toISOString().split('T')[0];
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
  const waterConsumedL = ((waterData.consumedMl || 0) / 1000).toFixed(1);
  const waterTargetL = ((waterData.targetMl || 3500) / 1000).toFixed(1);
  const waterPct = Math.min(Math.round(((waterData.consumedMl || 0) / (waterData.targetMl || 3500)) * 100), 100);

  // Workouts
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayDayId = dayNames[new Date().getDay()];
  const isWorkoutDone = !!weeklyWorkouts[todayDayId]?.workout;

  // Sleep
  const recentSleep = sleepLogs.length > 0 ? sleepLogs[sleepLogs.length - 1] : { hours: 7.5 };

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
    if ((waterData.consumedMl || 0) < 3000) {
      return {
        icon: Droplets,
        color: '#38bdf8',
        title: `Hydrate: ${(((waterData.targetMl || 3500) - (waterData.consumedMl || 0)) / 1000).toFixed(1)}L water to daily target`,
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
    if (!isWorkoutDone) {
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

  // Date formatted nicely
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header with Greeting & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {todayFormatted}
          </span>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 800, color: 'var(--text-white)', lineHeight: 1.2, marginTop: '0.15rem' }}>
            Good morning, {userName}
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.2rem' }}>
            "One day at a time."
          </p>
        </div>

        {/* Quick 100-Day Streak Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
        >
          <Flame size={16} color="var(--brand-primary)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
            Phase 1 • Dec 31 Goal
          </span>
        </div>
      </div>

      {/* 2. Primary Transformation Hero (Weight & 7-Day Trend) */}
      <Card variant="gradient" padding="1.5rem">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Primary Weight Target
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {currentWeight.toFixed(2)}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>kg</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>→</span>
                <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                  {targetWeight} kg
                </span>
              </div>
            </div>

            {/* 7-Day Moving Avg Badge */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 1rem',
                textAlign: 'right',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                7-Day Moving Avg
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {Number(sevenDayAvg).toFixed(2)} kg
              </div>
              <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                <TrendingDown size={11} /> {weeklyDeltaKg < 0 ? `${weeklyDeltaKg} kg this week` : 'Stable this week'}
              </div>
            </div>
          </div>

          {/* Restrained Journey Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {remainingWeight} kg remaining to 100 kg goal
              </span>
              <span style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                {journeyProgressPct}% Achieved
              </span>
            </div>
            <ProgressBar progress={parseFloat(journeyProgressPct)} height={10} color="var(--brand-gradient)" />
          </div>
        </div>
      </Card>

      {/* 3. Quick Action 1-Tap Pills */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
        {[
          { label: '+ Food', icon: Utensils, tab: 'food', color: 'var(--brand-primary)' },
          { label: '+ Weight', icon: TrendingDown, tab: 'weight', color: '#38bdf8' },
          { label: '+ Walk', icon: Footprints, tab: 'walk', color: '#34d399' },
          { label: '+ Water', icon: Droplets, tab: 'water', color: '#60a5fa' },
        ].map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.tab}
              type="button"
              onClick={() => onOpenQuickAdd(btn.tab)}
              style={{
                flex: '1 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = btn.color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <Icon size={15} color={btn.color} />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Today's Adherence & Core Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Card A: Today's Adherence Score */}
        <Card variant="default">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Today's Adherence
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Compliance across 5 core pillars</p>
            </div>
            <Badge variant={overallScore >= 80 ? 'success' : overallScore >= 50 ? 'warning' : 'neutral'}>
              {overallScore >= 80 ? '🔥 On Track' : 'In Progress'}
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <ProgressRing
              size={92}
              strokeWidth={8}
              progress={overallScore}
              color={overallScore >= 80 ? '#10b981' : 'var(--brand-primary)'}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                {overallScore}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Score
              </span>
            </ProgressRing>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nutrition Deficit</span>
                <span style={{ color: totalCaloriesConsumed <= 2100 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                  {totalCaloriesConsumed} / 2100 kcal
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Protein Target</span>
                <span style={{ color: totalProteinConsumed >= 100 ? '#34d399' : 'var(--brand-primary)', fontWeight: 700 }}>
                  {totalProteinConsumed.toFixed(0)} / 130g
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Daily Walk</span>
                <span style={{ color: todayWalkKm >= 5.0 ? '#34d399' : 'var(--text-white)', fontWeight: 700 }}>
                  {todayWalkKm.toFixed(1)} / 5.0 km
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Water Hydration</span>
                <span style={{ color: waterPct >= 80 ? '#34d399' : '#38bdf8', fontWeight: 700 }}>
                  {waterConsumedL} / {waterTargetL} L
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card B: Today's Nutrition Consumed vs Remaining */}
        <Card variant="default">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-white)' }}>
                Today's Nutrition
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{allFoods.length} items logged today</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('nutrition')}
              icon={ChevronRight}
              iconPosition="right"
            >
              Details
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{ background: 'var(--surface-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Calories
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                {totalCaloriesConsumed}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {caloriesRemaining} kcal remaining
              </span>
            </div>

            <div style={{ background: 'var(--surface-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Protein
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {totalProteinConsumed.toFixed(0)}g
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {proteinRemaining > 0 ? `${proteinRemaining.toFixed(0)}g remaining` : 'Target Met! 🎉'}
              </span>
            </div>
          </div>

          <ProgressBar progress={caloriePct} height={6} color="var(--brand-primary)" />
        </Card>
      </div>

      {/* 5. "Next Best Action" Dynamic Coach Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 19, 25, 0.95) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              color: nextAction.color,
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
            }}
          >
            <NextActionIcon size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--brand-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Your Next Best Action
            </span>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', marginTop: '0.1rem' }}>
              {nextAction.title}
            </h4>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {nextAction.subtitle}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (nextAction.actionTab) {
              onOpenQuickAdd(nextAction.actionTab);
            } else if (nextAction.screen) {
              onNavigate(nextAction.screen);
            }
          }}
          icon={ArrowRight}
          iconPosition="right"
        >
          {nextAction.actionLabel}
        </Button>
      </div>
    </div>
  );
}
