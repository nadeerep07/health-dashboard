/**
 * Weight Tracking & Trend Service
 * Calculates 7-day moving average, goal trajectory, and weekly loss rate.
 */

export function calculate7DayMovingAverage(weightLogs = []) {
  if (!Array.isArray(weightLogs) || weightLogs.length === 0) return [];

  // Sort logs by date ascending
  const sorted = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));

  return sorted.map((entry, index) => {
    // Window: current entry + up to 6 previous entries within 7 days
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

  // Calculate latest 7-day average
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
