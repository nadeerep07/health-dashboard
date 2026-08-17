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
  FOOD_LOGS: 'transformation_food_logs',
};

// Initial default daily food logs
const DEFAULT_FOOD_LOGS = {
  breakfast: [
    { id: 'f-1', name: '2 Dosa with Green Peas Curry', calories: 355, protein: 11.4, carbs: 60.0, fat: 8.5, time: '08:45 AM' },
    { id: 'f-2', name: '2 Whole Boiled Eggs', calories: 148, protein: 12.6, carbs: 0.8, fat: 10.0, time: '09:00 AM' }
  ],
  lunch: [
    { id: 'f-3', name: '180g Matta Rice + 140g Fish Curry', calories: 425, protein: 32.2, carbs: 52.0, fat: 8.2, time: '01:30 PM' },
    { id: 'f-4', name: 'Mixed Vegetable Salad & Thoran', calories: 120, protein: 3.7, carbs: 15.0, fat: 4.8, time: '01:45 PM' }
  ],
  snack: [
    { id: 'f-5', name: '100g Pomegranate + 100g Grapes', calories: 152, protein: 2.4, carbs: 37.0, fat: 1.4, time: '04:45 PM' },
    { id: 'f-6', name: 'Black Coffee (No Sugar)', calories: 2, protein: 0.2, carbs: 0.2, fat: 0.0, time: '05:00 PM' }
  ],
  dinner: [
    { id: 'f-7', name: '2 Whole Wheat Chapati', calories: 190, protein: 6.4, carbs: 36.0, fat: 3.0, time: '08:15 PM' },
    { id: 'f-8', name: '180g Cooked Chicken Breast Curry', calories: 297, protein: 42.0, carbs: 4.0, fat: 12.0, time: '08:30 PM' }
  ]
};

// Initial default water intake (in ml)
const DEFAULT_WATER_INTAKE = {
  targetMl: 3500, // 3.5L midpoint of 3-4L
  consumedMl: 1750,
  bottleSizeMl: 500,
  history: [
    { id: 'w-1', time: '08:30 AM', amount: 500, label: 'Morning Wake-up Glass' },
    { id: 'w-2', time: '11:00 AM', amount: 500, label: 'Work Session Bottle' },
    { id: 'w-3', time: '01:30 PM', amount: 250, label: 'Post Lunch' },
    { id: 'w-4', time: '04:30 PM', amount: 500, label: 'Pre-walk Hydration' },
  ]
};

// Initial default weight history (full chronological records)
const DEFAULT_WEIGHT_LOGS = [
  { id: 'wt-1', date: '2026-08-01', weight: 111.50, notes: 'Starting Transformation Baseline' },
  { id: 'wt-2', date: '2026-08-05', weight: 111.10, notes: 'Fasted morning weigh-in' },
  { id: 'wt-3', date: '2026-08-08', weight: 110.80, notes: 'Post rest-day weigh-in' },
  { id: 'wt-4', date: '2026-08-12', weight: 110.50, notes: 'Consistent 5 km walk week' },
  { id: 'wt-5', date: '2026-08-16', weight: 110.25, notes: 'Target on track' },
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

// Walking history (Chronological walk sessions with full details)
const DEFAULT_WALKING_LOGS = [
  { id: 'wl-1', date: '2026-08-11', day: 'Tue', distance: 5.0, duration: 58, pace: '11:36', calories: 325, notes: 'Comfortable evening pace' },
  { id: 'wl-2', date: '2026-08-12', day: 'Wed', distance: 5.2, duration: 61, pace: '11:44', calories: 338, notes: 'Extra neighborhood loop' },
  { id: 'wl-3', date: '2026-08-13', day: 'Thu', distance: 5.0, duration: 59, pace: '11:48', calories: 325, notes: 'Steady tempo' },
  { id: 'wl-4', date: '2026-08-14', day: 'Fri', distance: 5.0, duration: 54, pace: '10:48', calories: 325, notes: 'Fast brisk walk pace!' },
  { id: 'wl-5', date: '2026-08-15', day: 'Sat', distance: 5.0, duration: 60, pace: '12:00', calories: 325, notes: 'Morning recovery stride' },
  { id: 'wl-6', date: '2026-08-16', day: 'Sun', distance: 5.0, duration: 59, pace: '11:45', calories: 325, notes: 'Weekly consistency completed' },
  { id: 'wl-7', date: '2026-08-17', day: 'Mon', distance: 5.0, duration: 58, pace: '11:36', calories: 325, notes: 'Great energy today' },
];

// Sleep logs
const DEFAULT_SLEEP_LOGS = [
  { id: 'sl-1', date: '2026-08-11', day: 'Tue', bedTime: '23:45', wakeTime: '08:00', duration: 8.25, consistency: 'On Time' },
  { id: 'sl-2', date: '2026-08-12', day: 'Wed', bedTime: '00:15', wakeTime: '08:15', duration: 8.0, consistency: 'Slight Late' },
  { id: 'sl-3', date: '2026-08-13', day: 'Thu', bedTime: '23:30', wakeTime: '07:45', duration: 8.25, consistency: 'On Time' },
  { id: 'sl-4', date: '2026-08-14', day: 'Fri', bedTime: '23:50', wakeTime: '08:00', duration: 8.16, consistency: 'On Time' },
  { id: 'sl-5', date: '2026-08-15', day: 'Sat', bedTime: '00:30', wakeTime: '08:30', duration: 8.0, consistency: 'Late' },
  { id: 'sl-6', date: '2026-08-16', day: 'Sun', bedTime: '23:30', wakeTime: '08:00', duration: 8.5, consistency: 'On Time' },
  { id: 'sl-7', date: '2026-08-17', day: 'Mon', bedTime: '23:45', wakeTime: '08:00', duration: 8.25, consistency: 'On Time' },
];

// Body measurements
const DEFAULT_MEASUREMENTS = [
  { id: 'bm-1', date: '2026-08-01', weight: 111.5, waist: 108.0, chest: 114.0, notes: 'Starting Baseline' },
  { id: 'bm-2', date: '2026-08-16', weight: 110.25, waist: 106.5, chest: 113.0, notes: '2-week check-in: -1.5cm waist!' },
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
  DEFAULT_FOOD_LOGS,
};
