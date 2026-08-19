/**
 * @file userDailyRegression.test.js
 * @description Real-user regression test suite verifying end-to-end transformation workflows,
 * exact gram Kerala meal plates, multi-food dishes, and noise-free 7-day moving averages.
 */

import { describe, it, expect } from 'vitest';
import { estimateNutrition } from '../src/services/nutritionService';
import { calculateWeightMetrics } from '../src/services/weightService';

describe('Real User Daily Regression & Data Integrity Suite', () => {
  // Morning Routine: Fasted Scale Weigh-In & Trend Analysis
  it('Morning Step 1-4: Accurately calculates 7-day moving average upon weigh-in', () => {
    const historicalLogs = [
      { date: '2026-08-15', weight: 111.40 },
      { date: '2026-08-16', weight: 111.00 },
      { date: '2026-08-17', weight: 110.80 },
      { date: '2026-08-18', weight: 110.25 },
    ];

    const metrics = calculateWeightMetrics(historicalLogs, 110.80, 100.00);
    expect(metrics.currentWeight).toBe(110.25);
    expect(metrics.sevenDayAvg).toBeCloseTo(110.86, 1);
    expect(metrics.goalWeight).toBe(100.00);
    expect(metrics.totalLost).toBeCloseTo(0.55, 2);
  });

  // Lunch Routine (Multi-Item Kerala Lunch Plate - 460g)
  it('Lunch Step 10-14: Parses 460g multi-item Kerala lunch plate with all 4 foods & no coconut thoran', async () => {
    const lunchInput = "Cooked white rice — 190 g, Kumbalanga curry — 60 g, Banana thoran — 150 g no coconut, Fish fry — 60 g";
    const result = await estimateNutrition(lunchInput);

    // 1. Verify exactly 4 food items exist
    expect(result.items.length).toBe(4);
    
    // 2. Verify total weight = 190 + 60 + 150 + 60 = 460g
    const totalGrams = result.items.reduce((sum, item) => sum + (item.weightGrams || 0), 0);
    expect(totalGrams).toBe(460);

    // 3. Rice: 190g * 1.30 = 247 kcal (Cooked, Verified)
    const rice = result.items.find(i => i.name.toLowerCase().includes('rice'));
    expect(rice).toBeDefined();
    expect(rice.weightGrams).toBe(190);
    expect(rice.calories).toBe(247);
    expect(rice.weightType).toBe('cooked');
    expect(rice.confidence).toBe('verified');

    // 4. Kumbalanga Curry: 60g (Ash Gourd, ~30 kcal)
    const kumbalanga = result.items.find(i => i.name.toLowerCase().includes('kumbalanga') || i.name.toLowerCase().includes('ash gourd'));
    expect(kumbalanga).toBeDefined();
    expect(kumbalanga.weightGrams).toBe(60);
    expect(kumbalanga.calories).toBe(30);

    // 5. Banana Thoran (No Coconut): 150g (Cooked, ~83 kcal)
    const thoran = result.items.find(i => i.name.toLowerCase().includes('thoran'));
    expect(thoran).toBeDefined();
    expect(thoran.weightGrams).toBe(150);
    expect(thoran.calories).toBe(83);
    expect(thoran.confidence).toBe('verified');

    // 6. Fish Fry: 60g (~120 kcal, Estimated Range)
    const fish = result.items.find(i => i.name.toLowerCase().includes('fish') || i.name.toLowerCase().includes('mathi'));
    expect(fish).toBeDefined();
    expect(fish.weightGrams).toBe(60);
    expect(fish.calories).toBe(120);
    expect(fish.confidence).toBe('estimated_range');

    // Total plate calories: 247 + 30 + 83 + 120 = 480 kcal
    expect(result.calories).toBe(480);
    expect(result.protein).toBeGreaterThanOrEqual(20.0);
  });

  // Evening Snack Routine
  it('Evening Step 15-16: Parses exact 130g banana and 40g pomegranate edible arils', async () => {
    const bananaResult = await estimateNutrition("130g banana");
    expect(bananaResult.calories).toBe(116);
    expect(bananaResult.protein).toBe(1.4);
    expect(bananaResult.weightType).toBe('edible');

    const pomResult = await estimateNutrition("40g pomegranate edible arils");
    expect(pomResult.calories).toBe(33);
    expect(pomResult.weightType).toBe('edible');
    expect(pomResult.confidence).toBe('verified');
  });

  // Complete Dinner Routine (All 4 foods - 424g total)
  it('Dinner Step 17-20: Parses complete 4-item dinner (70g chapati, 100g eggs, 70g chicken kurma, 184g cucumber = 424g)', async () => {
    const dinnerInput = "70g chapati, 100g boiled eggs, 70g chicken kurma, 184g cucumber";
    const result = await estimateNutrition(dinnerInput);

    // 1. Verify exactly 4 food items exist
    expect(result.items.length).toBe(4);

    // 2. Verify total weight = 70 + 100 + 70 + 184 = 424g
    const totalGrams = result.items.reduce((sum, item) => sum + (item.weightGrams || 0), 0);
    expect(totalGrams).toBe(424);

    // 3. Chapati: 70g (2 pcs) = 166 kcal
    const chapati = result.items.find(i => i.name.toLowerCase().includes('chapati'));
    expect(chapati).toBeDefined();
    expect(chapati.weightGrams).toBe(70);
    expect(chapati.calories).toBe(166);

    // 4. Boiled Eggs: 100g (2 pcs) = 148 kcal
    const eggs = result.items.find(i => i.name.toLowerCase().includes('egg'));
    expect(eggs).toBeDefined();
    expect(eggs.weightGrams).toBe(100);
    expect(eggs.calories).toBe(148);

    // 5. Chicken Kurma: 70g = 105 kcal (Estimated Range)
    const kurma = result.items.find(i => i.name.toLowerCase().includes('kurma') || i.name.toLowerCase().includes('korma'));
    expect(kurma).toBeDefined();
    expect(kurma.weightGrams).toBe(70);
    expect(kurma.calories).toBe(105);
    expect(kurma.confidence).toBe('estimated_range');

    // 6. Cucumber: 184g = 28 kcal (Edible, Verified)
    const cucumber = result.items.find(i => i.name.toLowerCase().includes('cucumber'));
    expect(cucumber).toBeDefined();
    expect(cucumber.weightGrams).toBe(184);
    expect(cucumber.calories).toBe(28);
    expect(cucumber.confidence).toBe('verified');

    // Total Dinner Calories: 166 + 148 + 105 + 28 = 447 kcal
    expect(result.calories).toBe(447);
    // Total Dinner Protein: 5.6 + 12.6 + 8.4 + 1.3 = 27.9g
    expect(result.protein).toBeCloseTo(27.9, 1);
  });

  // Safety Sanity Test
  it('Sanity Validation: Blocks or flags impossible calorie densities', async () => {
    const badInput = "4 idli + 2 eggs";
    const result = await estimateNutrition(badInput);
    // 4 idli (~160 kcal) + 2 eggs (148 kcal) = ~308 kcal
    expect(result.calories).toBeLessThan(450);
    expect(result.calories).not.toBe(1148);
  });

  // Date & Checklist Isolation Tests
  it('Date & Checklist Isolation: Habits on Day 1 do not bleed into Day 2', async () => {
    const { resolveHabitsForDate } = await import('../src/utils/storage');
    const { shiftDate } = await import('../src/utils/dateUtils');

    const day1 = '2026-08-17';
    const day2 = shiftDate(day1, 1); // 2026-08-18

    const habitsByDate = {
      [day1]: [
        { id: 'walk', label: 'Walk 5 KM', completed: true },
        { id: 'water', label: 'Drink water', completed: true },
      ]
    };

    const day1Habits = resolveHabitsForDate(habitsByDate, day1);
    expect(day1Habits.find(h => h.id === 'walk').completed).toBe(true);

    const day2Habits = resolveHabitsForDate(habitsByDate, day2);
    // Day 2 must start with clean uncompleted checkboxes
    expect(day2Habits.find(h => h.id === 'walk').completed).toBe(false);
    expect(day2Habits.every(h => h.completed === false)).toBe(true);
  });

  it('Date & Water Isolation: Water logged on Day 1 is isolated from Day 2', async () => {
    const { resolveWaterForDate } = await import('../src/utils/storage');
    const waterByDate = {
      '2026-08-17': { targetMl: 3500, consumedMl: 2500, history: [{ time: '10:00 AM', amount: 500 }] }
    };

    const day1Water = resolveWaterForDate(waterByDate, '2026-08-17');
    expect(day1Water.consumedMl).toBe(2500);

    const day2Water = resolveWaterForDate(waterByDate, '2026-08-18');
    expect(day2Water.consumedMl).toBe(0);
    expect(day2Water.history.length).toBe(0);
  });

  it('Week Workout Isolation: Workouts in Week 34 do not leak into Week 35', async () => {
    const { resolveWorkoutsForWeek } = await import('../src/utils/storage');
    const workoutsByWeek = {
      '2026-W34': {
        mon: { walk: true, workout: true },
        tue: { walk: true }
      }
    };

    const w34 = resolveWorkoutsForWeek(workoutsByWeek, '2026-W34');
    expect(w34.mon.workout).toBe(true);

    const w35 = resolveWorkoutsForWeek(workoutsByWeek, '2026-W35');
    expect(w35.mon.workout).toBe(false);
    expect(w35.mon.walk).toBe(false);
  });
});

