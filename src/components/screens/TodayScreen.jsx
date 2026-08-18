import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
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
} from 'lucide-react';

/**
 * Screen 2: Today Screen (Consolidated Daily Compliance Ledger)
 */
export default function TodayScreen({
  selectedDate,
  onSelectDate,
  foodLogs = {},
  weightLogs = [],
  walkingLogs = [],
  waterData = { consumedMl: 0, targetMl: 3500 },
  sleepLogs = [],
  habits = [],
  weeklyWorkouts = {},
  onToggleHabit,
  onOpenQuickAdd,
  onNavigate,
}) {
  const activeDate = selectedDate || new Date().toISOString().split('T')[0];
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
  const waterL = ((waterData.consumedMl || 0) / 1000).toFixed(1);

  // Daily checklist items
  const ledgerItems = [
    {
      id: 'weight',
      title: 'Morning Fasted Weigh-In',
      subtitle: todayWeight ? `${Number(todayWeight.weight).toFixed(2)} kg recorded` : 'Log your morning weight',
      icon: TrendingDown,
      completed: !!todayWeight,
      color: 'var(--brand-primary)',
      actionTab: 'weight',
    },
    {
      id: 'walk',
      title: '5.0 km Cardio Walking',
      subtitle: walkKm >= 5.0 ? `✓ Target Hit (${walkKm.toFixed(1)} km)` : `${walkKm.toFixed(1)} / 5.0 km logged`,
      icon: Footprints,
      completed: walkKm >= 5.0,
      color: '#34d399',
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
      completed: (waterData.consumedMl || 0) >= 3000,
      color: '#38bdf8',
      actionTab: 'water',
    },
    {
      id: 'workout',
      title: 'Dumbbell Routine (Mon, Wed, Fri)',
      subtitle: 'Upper body & Core progressive overload',
      icon: Dumbbell,
      completed: false,
      color: '#a855f7',
      screen: 'plan',
    },
  ];

  const completedCount = ledgerItems.filter(i => i.completed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Date Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-white)' }}>
            Today's Adherence Ledger
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Daily transformation checklist & accountability
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => onSelectDate && onSelectDate(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-white)',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Progress Summary Card */}
      <Card variant="gradient">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Daily Completion
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

      {/* Ledger Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {ledgerItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              variant="interactive"
              padding="0.9rem 1.15rem"
              onClick={() => {
                if (item.actionTab) {
                  onOpenQuickAdd(item.actionTab);
                } else if (item.screen) {
                  onNavigate(item.screen);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      background: item.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: item.completed ? '#34d399' : item.color,
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-white)' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.completed ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <Circle size={20} color="var(--border-medium)" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
