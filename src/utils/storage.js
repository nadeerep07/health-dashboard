// LocalStorage helper utilities for persistent dashboard state

const STORAGE_KEYS = {
  WEIGHT_LOGS: 'transformation_weight_logs',
  DAILY_HABITS: 'transformation_daily_habits',
  WEEKLY_WORKOUTS: 'transformation_weekly_workouts',
  WALKING_LOGS: 'transformation_walking_logs',
  SLEEP_LOGS: 'transformation_sleep_logs',
  BODY_MEASUREMENTS: 'transformation_body_measurements',
  PHOTOS: 'transformation_photos',
  NIGHT_ROUTINE: 'transformation_night_routine',
  WATER_INTAKE: 'transformation_water_intake',
  DASHBOARD_PIN: 'transformation_dashboard_pin',
  DEVICE_AUTH_EXPIRY: 'transformation_auth_expiry',
};

// Initial default water intake (in ml)
const DEFAULT_WATER_INTAKE = {
  targetMl: 3500, // 3.5L midpoint of 3-4L
  consumedMl: 1750,
  bottleSizeMl: 500,
  history: [
    { time: '08:30 AM', amount: 500, label: 'Morning Wake-up Glass' },
    { time: '11:00 AM', amount: 500, label: 'Work Session Bottle' },
    { time: '01:30 PM', amount: 250, label: 'Post Lunch' },
    { time: '04:30 PM', amount: 500, label: 'Pre-walk Hydration' },
  ]
};

// Initial default weight history
const DEFAULT_WEIGHT_LOGS = [
  { date: '2026-08-10', weight: 111.0 },
  { date: '2026-08-12', weight: 110.6 },
  { date: '2026-08-16', weight: 110.25 },
];

// Initial default habits for today
const DEFAULT_HABITS = [
  { id: 'walk', label: 'Walk 5 KM', desc: 'Maintain comfortable 11:00–11:45 pace (~58–60 min)', icon: 'Footprints', completed: false },
  { id: 'calories', label: 'Follow calorie target', desc: 'Stay within 2,000–2,200 kcal', icon: 'Flame', completed: false },
  { id: 'protein', label: 'Hit protein target', desc: 'Aim for 120–150g protein', icon: 'Beef', completed: false },
  { id: 'water', label: 'Drink enough water', desc: 'Target 3–4 Liters throughout the day', icon: 'Droplets', completed: false },
  { id: 'no_sugar_drinks', label: 'No sugary drinks', desc: 'Stick to water, black coffee, tea', icon: 'Ban', completed: false },
  { id: 'no_bakery', label: 'Avoid unnecessary bakery food', desc: 'Skip puffs, pastries, processed snacks', icon: 'Cookie', completed: false },
  { id: 'sleep', label: 'Get adequate sleep', desc: 'Aim for 7.5–8 hours (in bed by ~11:30 PM)', icon: 'Moon', completed: false },
];

// Initial weekly workout status
const DEFAULT_WEEKLY_WORKOUTS = {
  mon: { walk: false, workout: false, title: '5 km walk + Dumbbell Workout A' },
  tue: { walk: false, title: '5 km walk' },
  wed: { walk: false, workout: false, title: '5 km walk + Dumbbell Workout B' },
  thu: { walk: false, title: '5 km walk' },
  fri: { walk: false, workout: false, title: '5 km walk + Dumbbell Workout A' },
  sat: { walk: false, title: '5 km walk' },
  sun: { walk: false, title: '5 km walk (Sunday session)' },
};

// Walking history (past 7 days distance in km)
const DEFAULT_WALKING_LOGS = [
  { day: 'Mon', distance: 5.0, duration: 59, pace: '11:48' },
  { day: 'Tue', distance: 5.0, duration: 58, pace: '11:36' },
  { day: 'Wed', distance: 5.2, duration: 61, pace: '11:44' },
  { day: 'Thu', distance: 5.0, duration: 59, pace: '11:48' },
  { day: 'Fri', distance: 5.0, duration: 54, pace: '10:48' },
  { day: 'Sat', distance: 5.0, duration: 60, pace: '12:00' },
  { day: 'Sun', distance: 5.0, duration: 59, pace: '11:45' },
];

// Sleep logs
const DEFAULT_SLEEP_LOGS = [
  { day: 'Mon', bedTime: '23:45', wakeTime: '08:00', duration: 8.25, consistency: 'On Time' },
  { day: 'Tue', bedTime: '00:15', wakeTime: '08:15', duration: 8.0, consistency: 'Slight Late' },
  { day: 'Wed', bedTime: '23:30', wakeTime: '07:45', duration: 8.25, consistency: 'On Time' },
  { day: 'Thu', bedTime: '23:50', wakeTime: '08:00', duration: 8.16, consistency: 'On Time' },
  { day: 'Fri', bedTime: '00:30', wakeTime: '08:30', duration: 8.0, consistency: 'Late' },
  { day: 'Sat', bedTime: '23:30', wakeTime: '08:00', duration: 8.5, consistency: 'On Time' },
  { day: 'Sun', bedTime: '23:45', wakeTime: '08:00', duration: 8.25, consistency: 'On Time' },
];

// Body measurements
const DEFAULT_MEASUREMENTS = [
  { date: '2026-08-01', weight: 111.5, waist: 108, chest: 114 },
  { date: '2026-08-16', weight: 110.25, waist: 106.5, chest: 113 },
];

// Night routine
const DEFAULT_NIGHT_ROUTINE = [
  { id: 'dinner', label: 'Finish dinner by 8:30 PM', completed: false },
  { id: 'netflix', label: 'Reduce Netflix / YouTube screen time after work', completed: false },
  { id: 'prep', label: 'Prepare walking clothes & water for tomorrow', completed: false },
  { id: 'phone', label: 'Put phone away 30 mins before sleep', completed: false },
  { id: 'bed', label: 'Get into bed by 11:30 PM', completed: false },
  { id: 'sleep', label: 'Sleep around midnight', completed: false },
];

export const getStoredData = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error reading localStorage', e);
    return fallback;
  }
};

export const setStoredData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
};

export {
  STORAGE_KEYS,
  DEFAULT_WEIGHT_LOGS,
  DEFAULT_HABITS,
  DEFAULT_WEEKLY_WORKOUTS,
  DEFAULT_WALKING_LOGS,
  DEFAULT_SLEEP_LOGS,
  DEFAULT_MEASUREMENTS,
  DEFAULT_NIGHT_ROUTINE,
  DEFAULT_WATER_INTAKE,
};
