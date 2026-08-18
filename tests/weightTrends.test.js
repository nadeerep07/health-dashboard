import { describe, it, expect } from 'vitest';
import { calculate7DayMovingAverage, calculateWeightMetrics } from '../src/services/weightService';

describe('Weight Metrics & 7-Day Moving Average', () => {
  const sampleLogs = [
    { date: '2026-08-11', weight: 111.50 },
    { date: '2026-08-12', weight: 111.10 },
    { date: '2026-08-13', weight: 110.80 },
    { date: '2026-08-14', weight: 111.20 },
    { date: '2026-08-15', weight: 110.60 },
    { date: '2026-08-16', weight: 110.40 },
    { date: '2026-08-17', weight: 110.80 }
  ];

  it('calculates accurate 7-day moving averages', () => {
    const movingAverages = calculate7DayMovingAverage(sampleLogs);
    expect(movingAverages.length).toBe(7);

    const latest = movingAverages[movingAverages.length - 1];
    expect(latest.date).toBe('2026-08-17');
    expect(latest.actualWeight).toBe(110.80);
    // Sum = 111.5 + 111.1 + 110.8 + 111.2 + 110.6 + 110.4 + 110.8 = 776.4 / 7 = 110.914 => 110.91
    expect(latest.movingAvg).toBe(110.91);
  });

  it('calculates total lost and progress toward 100 kg goal', () => {
    const metrics = calculateWeightMetrics(sampleLogs, 111.50, 100.00);
    expect(metrics.currentWeight).toBe(110.80);
    expect(metrics.totalLost).toBe(0.70);
    expect(metrics.remainingToGoal).toBe(10.80);
    expect(metrics.progressPercent).toBe(6); // 0.70 / 11.5 * 100
  });
});
