/**
 * Weight Tracking & Trend Analytics Service
 * 
 * Implements rolling 7-day moving averages and goal trajectory modeling.
 * Mathematical basis:
 * - SMA_7 = (Sum of weights in 7-day trailing window) / (Number of entries in window)
 * - Weekly Rate of Change = (Current SMA_7) - (SMA_7 7 days prior)
 */

/**
 * Calculate 7-day trailing simple moving average (SMA) across historical weight logs
 * 
 * @param {Array<{ date: string, weight: number }>} weightLogs - Chronological or un-ordered array of weigh-in records
 * @returns {Array<{ date: string, actualWeight: number, movingAvg: number, sampleCount: number }>}
 */
export function calculate7DayMovingAverage(weightLogs = []) {
  if (!Array.isArray(weightLogs) || weightLogs.length === 0) return [];

  // Sort logs by date ascending
  const sorted = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));

  return sorted.map((entry, index) => {
    // Trailing window: current entry + up to 6 preceding entries within a 7-day calendar span
    const windowEntries = [];
    const currentDate = new Date(entry.date);

    for (let i = index; i >= 0; i--) {
      const d = new Date(sorted[i].date);
      const diffDays = (currentDate - d) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7 && windowEntries.length < 7) {
        windowEntries.push(Number(sorted[i].weight));
      } else if (diffDays > 7) {
        break;
      }
    }

    const sum = windowEntries.reduce((acc, val) => acc + val, 0);
    const avg = parseFloat((sum / windowEntries.length).toFixed(2));

    return {
      date: entry.date,
      actualWeight: Number(entry.weight),
      movingAvg: avg,
      sampleCount: windowEntries.length
    };
  });
}

/**
 * Calculate high-level progress metrics comparing baseline, current, and milestone target
 * 
 * @param {Array<{ date: string, weight: number }>} [weightLogs=[]] - Array of weight records
 * @param {number} [startWeight=110.80] - Baseline starting weight in kg
 * @param {number} [goalWeight=100.00] - Target milestone weight in kg
 * @returns {{ currentWeight: number, startWeight: number, goalWeight: number, totalLost: number, remainingToGoal: number, progressPercent: number, sevenDayAvg: number }}
 */
export function calculateWeightMetrics(weightLogs = [], startWeight = 110.80, goalWeight = 100.00) {
  if (!Array.isArray(weightLogs) || weightLogs.length === 0) {
    return {
      currentWeight: startWeight,
      startWeight,
      goalWeight,
      totalLost: 0,
      remainingToGoal: Math.max(0, startWeight - goalWeight),
      progressPercent: 0,
      sevenDayAvg: startWeight
    };
  }

  const sorted = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const currentEntry = sorted[sorted.length - 1];
  const currentWeight = Number(currentEntry.weight);
  const totalLost = parseFloat((startWeight - currentWeight).toFixed(2));
  const remainingToGoal = parseFloat(Math.max(0, currentWeight - goalWeight).toFixed(2));
  const totalTargetLoss = startWeight - goalWeight;
  const progressPercent = totalTargetLoss > 0 ? Math.min(100, Math.max(0, Math.round((totalLost / totalTargetLoss) * 100))) : 0;

  // Calculate latest 7-day smoothed average
  const averages = calculate7DayMovingAverage(sorted);
  const latestAvg = averages.length > 0 ? averages[averages.length - 1].movingAvg : currentWeight;

  return {
    currentWeight,
    startWeight,
    goalWeight,
    totalLost,
    remainingToGoal,
    progressPercent,
    sevenDayAvg: latestAvg
  };
}
