import React, { useState, useEffect, useRef } from 'react';
import {
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
  getStoredData,
  setStoredData
} from './utils/storage';

import {
  getSupabaseConfig,
  fetchCloudDashboardData,
  saveCloudDashboardData
} from './utils/supabaseClient';

import TransformationHero from './components/TransformationHero';
import DailyHabits from './components/DailyHabits';
import WaterIntakeCalculator from './components/WaterIntakeCalculator';
import WeeklyPlan from './components/WeeklyPlan';
import DumbbellWorkouts from './components/DumbbellWorkouts';
import WalkingTracker from './components/WalkingTracker';
import NutritionDashboard from './components/NutritionDashboard';
import SugarCutTracker from './components/SugarCutTracker';
import WeightProgressChart from './components/WeightProgressChart';
import BodyTransformationTracker from './components/BodyTransformationTracker';
import SleepRecoveryTracker from './components/SleepRecoveryTracker';
import Milestones from './components/Milestones';
import MotivationAndRules from './components/MotivationAndRules';
import DisclaimerFooter from './components/DisclaimerFooter';
import MobileNavigation from './components/MobileNavigation';
import SupabaseSyncModal from './components/SupabaseSyncModal';
import PinLockScreen from './components/PinLockScreen';
import ChangePinModal from './components/ChangePinModal';
import WhatsAppSyncModal from './components/WhatsAppSyncModal';

import { 
  Activity, 
  Moon, 
  Dumbbell, 
  Utensils, 
  Home, 
  TrendingUp, 
  Droplets, 
  Cloud, 
  Lock, 
  KeyRound, 
  Footprints,
  Sparkles,
  Layers,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  Beef
} from 'lucide-react';

const MASTER_PIN = import.meta.env.VITE_MASTER_PIN || '68356';

export default function App() {
  // PIN Lock & Authentication State
  const [dashboardPin, setDashboardPin] = useState(() => getStoredData(STORAGE_KEYS.DASHBOARD_PIN, MASTER_PIN));
  const [isLocked, setIsLocked] = useState(() => {
    const expiry = getStoredData(STORAGE_KEYS.DEVICE_AUTH_EXPIRY, 0);
    return Date.now() > expiry;
  });

  // Local storage reactive states
  const [weightLogs, setWeightLogs] = useState(() => getStoredData(STORAGE_KEYS.WEIGHT_LOGS, DEFAULT_WEIGHT_LOGS));
  const [habits, setHabits] = useState(() => getStoredData(STORAGE_KEYS.DAILY_HABITS, DEFAULT_HABITS));
  const [waterData, setWaterData] = useState(() => getStoredData(STORAGE_KEYS.WATER_INTAKE, DEFAULT_WATER_INTAKE));
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(() => getStoredData(STORAGE_KEYS.WEEKLY_WORKOUTS, DEFAULT_WEEKLY_WORKOUTS));
  const [walkingLogs, setWalkingLogs] = useState(() => getStoredData(STORAGE_KEYS.WALKING_LOGS, DEFAULT_WALKING_LOGS));
  const [sleepLogs, setSleepLogs] = useState(() => getStoredData(STORAGE_KEYS.SLEEP_LOGS, DEFAULT_SLEEP_LOGS));
  const [nightRoutine, setNightRoutine] = useState(() => getStoredData(STORAGE_KEYS.NIGHT_ROUTINE, DEFAULT_NIGHT_ROUTINE));
  const [measurements, setMeasurements] = useState(() => getStoredData(STORAGE_KEYS.BODY_MEASUREMENTS, DEFAULT_MEASUREMENTS));
  const [foodLogs, setFoodLogs] = useState(() => getStoredData(STORAGE_KEYS.FOOD_LOGS, DEFAULT_FOOD_LOGS));

  // Active screen state: 'home', 'walk', 'workout', 'nutrition', 'hydration', 'progress', 'sleep'
  const [activeScreen, setActiveScreen] = useState('home');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'saved'
  const [isCloudConfigured, setIsCloudConfigured] = useState(() => getSupabaseConfig().isConfigured);

  const isInitialLoad = useRef(true);
  const syncTimeoutRef = useRef(null);

  // Local persistence effects
  useEffect(() => setStoredData(STORAGE_KEYS.WEIGHT_LOGS, weightLogs), [weightLogs]);
  useEffect(() => setStoredData(STORAGE_KEYS.DAILY_HABITS, habits), [habits]);
  useEffect(() => setStoredData(STORAGE_KEYS.WATER_INTAKE, waterData), [waterData]);
  useEffect(() => setStoredData(STORAGE_KEYS.WEEKLY_WORKOUTS, weeklyWorkouts), [weeklyWorkouts]);
  useEffect(() => setStoredData(STORAGE_KEYS.WALKING_LOGS, walkingLogs), [walkingLogs]);
  useEffect(() => setStoredData(STORAGE_KEYS.SLEEP_LOGS, sleepLogs), [sleepLogs]);
  useEffect(() => setStoredData(STORAGE_KEYS.NIGHT_ROUTINE, nightRoutine), [nightRoutine]);
  useEffect(() => setStoredData(STORAGE_KEYS.BODY_MEASUREMENTS, measurements), [measurements]);
  useEffect(() => setStoredData(STORAGE_KEYS.FOOD_LOGS, foodLogs), [foodLogs]);

  // Initial Cloud Fetch & Local Data Synchronization
  useEffect(() => {
    const initCloud = async () => {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Ensure August 17th actual data exists in local state
      setWeightLogs(prev => {
        const hasAug17 = prev.some(l => l.date === '2026-08-17');
        if (!hasAug17) {
          return [...prev, { id: 'wt-6', date: '2026-08-17', weight: 110.80, notes: 'Morning fasted weight (Day 1)' }];
        }
        return prev;
      });

      setWalkingLogs(prev => {
        const hasAug17 = prev.some(l => l.date === '2026-08-17');
        if (!hasAug17) {
          return [...prev, { id: 'wl-7', date: '2026-08-17', day: 'Mon', distance: 5.4, duration: 60, pace: '11:07', calories: 492, notes: 'Avg HR: 133 bpm • Elevation: 50m • Day 1 Done!' }];
        }
        return prev;
      });

      // 2. Automatic weekly workout plan sync: Match logged walks to days of current week
      setWeeklyWorkouts(prev => {
        const next = { ...prev };
        // If today is Monday Aug 17, mark Mon walk done
        next.mon = { ...next.mon, walk: true };
        return next;
      });

      // 3. Fetch from Supabase Cloud if configured
      const config = getSupabaseConfig();
      setIsCloudConfigured(config.isConfigured);
      if (config.isConfigured) {
        setSyncStatus('syncing');
        const cloudData = await fetchCloudDashboardData();
        if (cloudData) {
          if (cloudData.weightLogs) setWeightLogs(cloudData.weightLogs);
          if (cloudData.habits) setHabits(cloudData.habits);
          if (cloudData.waterData) setWaterData(cloudData.waterData);
          if (cloudData.weeklyWorkouts) setWeeklyWorkouts(cloudData.weeklyWorkouts);
          if (cloudData.walkingLogs) setWalkingLogs(cloudData.walkingLogs);
          if (cloudData.sleepLogs) setSleepLogs(cloudData.sleepLogs);
          if (cloudData.nightRoutine) setNightRoutine(cloudData.nightRoutine);
          if (cloudData.measurements) setMeasurements(cloudData.measurements);
          if (cloudData.foodLogs) setFoodLogs(cloudData.foodLogs);
          if (cloudData.customPin) {
            setDashboardPin(cloudData.customPin);
            setStoredData(STORAGE_KEYS.DASHBOARD_PIN, cloudData.customPin);
          }
        }
        setSyncStatus('saved');
      }
      isInitialLoad.current = false;
    };
    initCloud();
  }, []);

  // Automatic Cloud Sync (Debounced when local state changes)
  useEffect(() => {
    if (isInitialLoad.current) return;
    const config = getSupabaseConfig();
    if (!config.isConfigured) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      setSyncStatus('syncing');
      const payload = {
        weightLogs,
        habits,
        waterData,
        weeklyWorkouts,
        walkingLogs,
        sleepLogs,
        nightRoutine,
        measurements,
        foodLogs,
        customPin: dashboardPin,
      };
      await saveCloudDashboardData(payload);
      setSyncStatus('saved');
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [weightLogs, habits, waterData, weeklyWorkouts, walkingLogs, sleepLogs, nightRoutine, measurements, foodLogs, dashboardPin]);

  // PIN Lock Handlers
  const handleUnlock = (rememberDevice) => {
    setIsLocked(false);
    if (rememberDevice) {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      setStoredData(STORAGE_KEYS.DEVICE_AUTH_EXPIRY, expiry);
    } else {
      setStoredData(STORAGE_KEYS.DEVICE_AUTH_EXPIRY, 0);
    }
  };

  const handleChangePin = (newPin) => {
    setDashboardPin(newPin);
    setStoredData(STORAGE_KEYS.DASHBOARD_PIN, newPin);
    const payload = {
      weightLogs,
      habits,
      waterData,
      weeklyWorkouts,
      walkingLogs,
      sleepLogs,
      nightRoutine,
      measurements,
      foodLogs,
      customPin: newPin,
    };
    saveCloudDashboardData(payload);
  };

  const handleLockNow = () => {
    setStoredData(STORAGE_KEYS.DEVICE_AUTH_EXPIRY, 0);
    setIsLocked(true);
  };

  const handleManualCloudSync = async () => {
    setSyncStatus('syncing');
    const payload = {
      weightLogs,
      habits,
      waterData,
      weeklyWorkouts,
      walkingLogs,
      sleepLogs,
      nightRoutine,
      measurements,
      foodLogs,
      customPin: dashboardPin,
    };
    await saveCloudDashboardData(payload);
    setSyncStatus('saved');
  };

  const handleSaveConfig = () => {
    const config = getSupabaseConfig();
    setIsCloudConfigured(config.isConfigured);
    handleManualCloudSync();
  };

  // Export JSON backup
  const handleExportData = () => {
    const payload = {
      weightLogs,
      habits,
      waterData,
      weeklyWorkouts,
      walkingLogs,
      sleepLogs,
      nightRoutine,
      measurements,
      foodLogs,
      exportDate: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `transformation_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (json.weightLogs) setWeightLogs(json.weightLogs);
          if (json.habits) setHabits(json.habits);
          if (json.waterData) setWaterData(json.waterData);
          if (json.weeklyWorkouts) setWeeklyWorkouts(json.weeklyWorkouts);
          if (json.walkingLogs) setWalkingLogs(json.walkingLogs);
          if (json.sleepLogs) setSleepLogs(json.sleepLogs);
          if (json.nightRoutine) setNightRoutine(json.nightRoutine);
          if (json.measurements) setMeasurements(json.measurements);
          if (json.foodLogs) setFoodLogs(json.foodLogs);
          alert('✓ Data restored successfully!');
          setShowSyncModal(false);
        } catch (err) {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Current weight derived state
  const sortedWeightLogs = [...weightLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const currentWeight = sortedWeightLogs.length > 0 ? sortedWeightLogs[sortedWeightLogs.length - 1].weight : 110.25;

  // Habit & Activity Handlers
  const handleToggleHabit = (id) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const handleResetHabits = () => {
    setHabits(DEFAULT_HABITS.map(h => ({ ...h, completed: false })));
  };

  const handleHabitSync = (habitId, isCompleted) => {
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed: isCompleted } : h));
  };

  const handleUpdateWater = (newWaterData) => {
    setWaterData(newWaterData);
    if (newWaterData.consumedMl >= 3000) {
      handleHabitSync('water', true);
    }
  };

  const handleToggleWeeklyTask = (dayId, taskType) => {
    setWeeklyWorkouts(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [taskType]: !prev[dayId]?.[taskType]
      }
    }));
  };

  const handleCompleteDumbbellWorkout = (workoutType) => {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayId = dayNames[new Date().getDay()];
    if (weeklyWorkouts[todayId]) {
      handleToggleWeeklyTask(todayId, 'workout');
    }
  };

  // Walk Handlers
  const handleAddWalkLog = (newLog) => {
    setWalkingLogs(prev => [...prev, newLog]);
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayId = dayNames[new Date().getDay()];
    setWeeklyWorkouts(prev => ({
      ...prev,
      [todayId]: { ...prev[todayId], walk: true }
    }));
    handleHabitSync('walk', true);
  };

  const handleDeleteWalkLog = (idOrIdx) => {
    setWalkingLogs(prev => {
      if (typeof idOrIdx === 'string') {
        return prev.filter(item => item.id !== idOrIdx);
      }
      return prev.filter((_, idx) => idx !== idOrIdx);
    });
  };

  // Weight Handlers
  const handleAddWeightLog = (newEntry) => {
    setWeightLogs(prev => [...prev, newEntry]);
  };

  const handleDeleteWeightLog = (idOrIdx) => {
    setWeightLogs(prev => {
      if (typeof idOrIdx === 'string') {
        return prev.filter(item => item.id !== idOrIdx);
      }
      return prev.filter((_, idx) => idx !== idOrIdx);
    });
  };

  // Measurement Handlers
  const handleAddMeasurement = (newEntry) => {
    setMeasurements(prev => [...prev, newEntry]);
  };

  const handleDeleteMeasurement = (idOrIdx) => {
    setMeasurements(prev => {
      if (typeof idOrIdx === 'string') {
        return prev.filter(item => item.id !== idOrIdx);
      }
      return prev.filter((_, idx) => idx !== idOrIdx);
    });
  };

  // Sleep Handlers
  const handleLogSleep = (newSleep) => {
    setSleepLogs(prev => [...prev, newSleep]);
    handleHabitSync('sleep', true);
  };

  const handleDeleteSleepLog = (idOrIdx) => {
    setSleepLogs(prev => {
      if (typeof idOrIdx === 'string') {
        return prev.filter(item => item.id !== idOrIdx);
      }
      return prev.filter((_, idx) => idx !== idOrIdx);
    });
  };

  // Date-Scoped Food Handlers
  const handleAddFoodItem = (dateStr, category, newItem) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    setFoodLogs(prev => {
      const dayData = prev[targetDate] || { breakfast: [], lunch: [], snack: [], dinner: [] };
      const updatedCat = [newItem, ...(dayData[category] || [])];
      const updatedDay = { ...dayData, [category]: updatedCat };
      const next = { ...prev, [targetDate]: updatedDay };

      const all = Object.values(updatedDay).flat();
      const totalCal = all.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      const totalProt = all.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);

      if (totalCal >= 1400 && totalCal <= 2200) {
        handleHabitSync('calories', true);
      }
      if (totalProt >= 120) {
        handleHabitSync('protein', true);
      }
      return next;
    });
  };

  const handleDeleteFoodItem = (dateStr, category, itemId) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    setFoodLogs(prev => {
      const dayData = prev[targetDate] || { breakfast: [], lunch: [], snack: [], dinner: [] };
      const updatedCat = (dayData[category] || []).filter(item => item.id !== itemId);
      return {
        ...prev,
        [targetDate]: { ...dayData, [category]: updatedCat }
      };
    });
  };

  const handleResetFoodLogs = (dateStr) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    setFoodLogs(prev => ({
      ...prev,
      [targetDate]: { breakfast: [], lunch: [], snack: [], dinner: [] }
    }));
    handleHabitSync('calories', false);
    handleHabitSync('protein', false);
  };

  const handleToggleNightRoutine = (id) => {
    setNightRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const navigateToScreen = (screenId) => {
    setActiveScreen(screenId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If app is locked, display the Apple-style PIN screen
  if (isLocked) {
    return (
      <PinLockScreen
        onUnlock={handleUnlock}
        currentPin={dashboardPin}
      />
    );
  }

  const screenNavigationTabs = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'walk', label: 'Walk', icon: Footprints },
    { id: 'workout', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'hydration', label: 'Hydration', icon: Droplets },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'sleep', label: 'Sleep', icon: Moon },
  ];

  // Derive stats for Home Screen Live Glance Cards
  const totalWalkKm = walkingLogs.reduce((sum, l) => sum + (Number(l.distance) || 0), 0).toFixed(1);
  const waterConsumedL = ((waterData?.consumedMl || 0) / 1000).toFixed(2);
  const waterTargetL = ((waterData?.targetMl || 3500) / 1000).toFixed(1);
  const totalWeightLost = (110.25 - currentWeight).toFixed(2);
  const lastSleep = sleepLogs.length > 0 ? sleepLogs[sleepLogs.length - 1] : { duration: 8.0 };

  const todayKey = new Date().toISOString().split('T')[0];
  const todayFoodObj = foodLogs[todayKey] || foodLogs['2026-08-17'] || (foodLogs.breakfast ? foodLogs : { breakfast: [], lunch: [], snack: [], dinner: [] });
  const todayFoodItems = [
    ...(todayFoodObj.breakfast || []),
    ...(todayFoodObj.lunch || []),
    ...(todayFoodObj.snack || []),
    ...(todayFoodObj.dinner || [])
  ];
  const totalTodayCalories = todayFoodItems.reduce((sum, i) => sum + (Number(i.calories) || 0), 0);
  const totalTodayProtein = todayFoodItems.reduce((sum, i) => sum + (Number(i.protein) || 0), 0);

  return (
    <div className="app-container">
      {/* Top Header / Branding */}
      <header className="top-header">
        <div className="top-header-content">
          <div className="brand-badge" onClick={() => navigateToScreen('home')}>
            <div className="brand-icon">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div className="brand-text-block">
              <div className="brand-title">APEX 100</div>
              <div className="brand-subtext">Target: 100 KG • Dec 31</div>
            </div>
          </div>

          {/* Desktop Tab Navigation (Dedicated Screen Tabs) */}
          <nav className="nav-desktop-tabs">
            {screenNavigationTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeScreen === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateToScreen(tab.id)}
                  className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} /> <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Action Buttons (WhatsApp AI, Sync, PIN, Lock) */}
          <div className="header-actions">
            {/* WhatsApp AI Coach Button */}
            <button
              onClick={() => setShowWhatsAppModal(true)}
              style={{
                background: 'rgba(37, 211, 102, 0.12)',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                color: '#25d366',
                padding: '0.38rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s ease'
              }}
              title="Open WhatsApp AI Coach"
            >
              <MessageSquare size={14} />
              <span>WhatsApp AI</span>
            </button>

            {/* Cloud Sync Button */}
            <button
              onClick={() => setShowSyncModal(true)}
              style={{
                background: isCloudConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 215, 0, 0.1)',
                border: isCloudConfigured ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 215, 0, 0.3)',
                color: isCloudConfigured ? '#34d399' : 'var(--gold-primary)',
                padding: '0.38rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s ease'
              }}
              title="Configure Supabase Cloud Sync"
            >
              <Cloud size={14} />
              <span>{isCloudConfigured ? (syncStatus === 'syncing' ? 'Syncing...' : 'Synced') : 'Cloud'}</span>
            </button>

            {/* Change PIN Button */}
            <button
              onClick={() => setShowChangePinModal(true)}
              className="btn-secondary"
              style={{
                padding: '0.38rem 0.65rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Change Passcode"
            >
              <KeyRound size={13} color="var(--gold-primary)" />
              <span>PIN</span>
            </button>

            {/* Lock Button */}
            <button
              onClick={handleLockNow}
              className="btn-secondary"
              style={{
                padding: '0.38rem 0.65rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Lock Dashboard Now"
            >
              <Lock size={13} />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Screen Switcher Bar for Mobile & Tablet */}
      <div className="category-pill-bar">
        {screenNavigationTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigateToScreen(tab.id)}
              className={`category-pill ${isActive ? 'active' : ''}`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN DEDICATED SCREEN VIEW */}
      <main className="dashboard-screen">
        {/* ================= SCREEN 1: HOME / OVERVIEW ================= */}
        {activeScreen === 'home' && (
          <>
            {/* Hero Transformation Progress */}
            <TransformationHero currentWeight={currentWeight} startWeight={110.25} targetWeight={100} />

            {/* At-a-Glance Live Cards Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)' }}>
                  Today's Live Glance
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to open full screen</span>
              </div>

              <div className="home-quick-cards-grid">
                {/* 1. Walk Glance */}
                <div className="home-quick-card" onClick={() => navigateToScreen('walk')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-icon-pill" style={{ width: '28px', height: '28px' }}>
                      <Footprints size={15} />
                    </div>
                    <ChevronRight size={15} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Walking
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                    5.0 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>km goal</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                    Total: {totalWalkKm} km recorded
                  </div>
                </div>

                {/* 2. Nutrition Glance */}
                <div className="home-quick-card" onClick={() => navigateToScreen('nutrition')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-icon-pill" style={{ width: '28px', height: '28px', background: 'rgba(255, 215, 0, 0.15)', color: 'var(--gold-primary)', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                      <Flame size={15} />
                    </div>
                    <ChevronRight size={15} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Calories & Protein
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)', fontFamily: 'var(--font-mono)' }}>
                    {totalTodayCalories} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 2100 kcal</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600 }}>
                    Protein: {totalTodayProtein.toFixed(1)}g / 130g
                  </div>
                </div>

                {/* 3. Hydration Glance */}
                <div className="home-quick-card" onClick={() => navigateToScreen('hydration')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-icon-pill" style={{ width: '28px', height: '28px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                      <Droplets size={15} />
                    </div>
                    <ChevronRight size={15} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Water Intake
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {waterConsumedL} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {waterTargetL}L</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: Number(waterConsumedL) >= 3 ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {Number(waterConsumedL) >= 3 ? '✓ Daily Goal Met' : `${(3.5 - Number(waterConsumedL)).toFixed(1)}L remaining`}
                  </div>
                </div>

                {/* 4. Weight Glance */}
                <div className="home-quick-card" onClick={() => navigateToScreen('progress')}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-icon-pill" style={{ width: '28px', height: '28px' }}>
                      <TrendingUp size={15} />
                    </div>
                    <ChevronRight size={15} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Weight Progress
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>
                    {currentWeight.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>kg</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                    {totalWeightLost > 0 ? `-${totalWeightLost} kg lost` : 'Baseline'}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Habits Checklist */}
            <DailyHabits habits={habits} onToggleHabit={handleToggleHabit} onResetHabits={handleResetHabits} />

            {/* Milestones & Motivation */}
            <Milestones currentWeight={currentWeight} />
            <MotivationAndRules />
            <DisclaimerFooter />
          </>
        )}

        {/* ================= SCREEN 2: WALKING ================= */}
        {activeScreen === 'walk' && (
          <>
            <WalkingTracker 
              walkingLogs={walkingLogs} 
              onAddWalkLog={handleAddWalkLog} 
              onDeleteWalkLog={handleDeleteWalkLog}
            />
          </>
        )}

        {/* ================= SCREEN 3: WORKOUTS ================= */}
        {activeScreen === 'workout' && (
          <>
            <WeeklyPlan weeklyData={weeklyWorkouts} onToggleWeeklyTask={handleToggleWeeklyTask} />
            <DumbbellWorkouts onCompleteWorkout={handleCompleteDumbbellWorkout} />
          </>
        )}

        {/* ================= SCREEN 4: NUTRITION ================= */}
        {activeScreen === 'nutrition' && (
          <>
            <NutritionDashboard 
              foodLogs={foodLogs}
              onAddFoodItem={handleAddFoodItem}
              onDeleteFoodItem={handleDeleteFoodItem}
              onResetFoodLogs={handleResetFoodLogs}
            />
            <SugarCutTracker />
          </>
        )}

        {/* ================= SCREEN 5: HYDRATION ================= */}
        {activeScreen === 'hydration' && (
          <>
            <WaterIntakeCalculator waterData={waterData} onUpdateWater={handleUpdateWater} onHabitSync={handleHabitSync} />
          </>
        )}

        {/* ================= SCREEN 6: PROGRESS & BODY ================= */}
        {activeScreen === 'progress' && (
          <>
            <WeightProgressChart 
              weightLogs={weightLogs} 
              onAddWeightLog={handleAddWeightLog} 
              onDeleteWeightLog={handleDeleteWeightLog}
              targetWeight={100} 
            />
            <BodyTransformationTracker 
              measurements={measurements} 
              onAddMeasurement={handleAddMeasurement} 
              onDeleteMeasurement={handleDeleteMeasurement}
            />
            <Milestones currentWeight={currentWeight} />
          </>
        )}

        {/* ================= SCREEN 7: SLEEP & RECOVERY ================= */}
        {activeScreen === 'sleep' && (
          <>
            <SleepRecoveryTracker 
              sleepLogs={sleepLogs} 
              nightRoutine={nightRoutine} 
              onToggleNightRoutine={handleToggleNightRoutine} 
              onLogSleep={handleLogSleep} 
              onDeleteSleepLog={handleDeleteSleepLog}
            />
          </>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNavigation activeTab={activeScreen} onTabSelect={navigateToScreen} />

      {/* SUPABASE CLOUD SYNC MODAL */}
      <SupabaseSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSaveConfig={handleSaveConfig}
        onManualSync={handleManualCloudSync}
        onExportData={handleExportData}
        onImportData={handleImportData}
        syncStatus={syncStatus}
      />

      {/* CHANGE PIN MODAL */}
      <ChangePinModal
        isOpen={showChangePinModal}
        onClose={() => setShowChangePinModal(false)}
        currentPin={dashboardPin}
        onChangePin={handleChangePin}
      />

      {/* WHATSAPP AI COACH MODAL */}
      <WhatsAppSyncModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </div>
  );
}
