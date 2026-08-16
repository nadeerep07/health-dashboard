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

import { Flame, Shield, Trophy, Activity, Moon, Dumbbell, Utensils, Home, TrendingUp, Droplets, Cloud, Database, Lock, KeyRound } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState('home');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
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

  // Initial Cloud Fetch on Mount (if Supabase is configured)
  useEffect(() => {
    const initCloud = async () => {
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
        customPin: dashboardPin,
      };
      await saveCloudDashboardData(payload);
      setSyncStatus('saved');
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [weightLogs, habits, waterData, weeklyWorkouts, walkingLogs, sleepLogs, nightRoutine, measurements, dashboardPin]);

  // PIN Lock Handlers
  const handleUnlock = (rememberDevice) => {
    setIsLocked(false);
    if (rememberDevice) {
      // 30 days expiry
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      setStoredData(STORAGE_KEYS.DEVICE_AUTH_EXPIRY, expiry);
    } else {
      setStoredData(STORAGE_KEYS.DEVICE_AUTH_EXPIRY, 0);
    }
  };

  const handleChangePin = (newPin) => {
    setDashboardPin(newPin);
    setStoredData(STORAGE_KEYS.DASHBOARD_PIN, newPin);
    // Cloud sync new PIN immediately
    const payload = {
      weightLogs,
      habits,
      waterData,
      weeklyWorkouts,
      walkingLogs,
      sleepLogs,
      nightRoutine,
      measurements,
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
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 110.25;

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

  const handleAddWalkLog = (newLog) => {
    setWalkingLogs(prev => [...prev.slice(1), newLog]);
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayId = dayNames[new Date().getDay()];
    setWeeklyWorkouts(prev => ({
      ...prev,
      [todayId]: { ...prev[todayId], walk: true }
    }));
  };

  const handleAddWeightLog = (newEntry) => {
    setWeightLogs(prev => [...prev, newEntry]);
  };

  const handleAddMeasurement = (newEntry) => {
    setMeasurements(prev => [...prev, newEntry]);
  };

  const handleLogSleep = (newSleep) => {
    setSleepLogs(prev => [...prev.slice(1), newSleep]);
  };

  const handleToggleNightRoutine = (id) => {
    setNightRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const scrollToSection = (sectionId, tabName) => {
    setActiveTab(tabName);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  return (
    <div className="app-container">
      {/* Top Header / Branding */}
      <header className="top-header">
        <div className="top-header-content">
          <div className="brand-badge">
            <div className="brand-icon">
              <Activity size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="brand-title">TRANSFORMATION DASHBOARD</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: 100 KG • Dec 31, 2026</div>
            </div>
          </div>

          {/* Desktop Tab Navigation + Supabase Cloud Button + Change PIN + Lock Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <nav className="nav-desktop-tabs">
              <button onClick={() => scrollToSection('hero-section', 'home')} className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}>
                <Home size={15} /> Overview
              </button>
              <button onClick={() => scrollToSection('weekly-plan', 'workout')} className={`nav-tab-btn ${activeTab === 'workout' ? 'active' : ''}`}>
                <Dumbbell size={15} /> Workouts
              </button>
              <button onClick={() => scrollToSection('water-calculator', 'hydration')} className={`nav-tab-btn ${activeTab === 'hydration' ? 'active' : ''}`}>
                <Droplets size={15} /> Hydration
              </button>
              <button onClick={() => scrollToSection('nutrition-dashboard', 'nutrition')} className={`nav-tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}>
                <Utensils size={15} /> Nutrition
              </button>
              <button onClick={() => scrollToSection('weight-chart', 'progress')} className={`nav-tab-btn ${activeTab === 'progress' ? 'active' : ''}`}>
                <TrendingUp size={15} /> Progress
              </button>
              <button onClick={() => scrollToSection('sleep-recovery', 'sleep')} className={`nav-tab-btn ${activeTab === 'sleep' ? 'active' : ''}`}>
                <Moon size={15} /> Sleep
              </button>
            </nav>

            {/* Cloud Storage Connect Button */}
            <button
              onClick={() => setShowSyncModal(true)}
              style={{
                background: isCloudConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 215, 0, 0.1)',
                border: isCloudConfigured ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 215, 0, 0.3)',
                color: isCloudConfigured ? '#34d399' : 'var(--gold-primary)',
                padding: '0.42rem 0.8rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
              title="Configure Supabase Cloud Sync"
            >
              <Cloud size={14} />
              <span>{isCloudConfigured ? (syncStatus === 'syncing' ? 'Syncing...' : 'Cloud Synced') : 'Connect Cloud'}</span>
            </button>

            {/* Change PIN Button */}
            <button
              onClick={() => setShowChangePinModal(true)}
              className="btn-secondary"
              style={{
                padding: '0.42rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
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
                padding: '0.42rem 0.75rem',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Lock Dashboard Now"
            >
              <Lock size={13} />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-body">
        {/* 1. HERO / TRANSFORMATION HEADER */}
        <TransformationHero currentWeight={currentWeight} startWeight={110.25} targetWeight={100} />

        {/* 2. DAILY HABITS */}
        <DailyHabits habits={habits} onToggleHabit={handleToggleHabit} onResetHabits={handleResetHabits} />

        {/* WATER DRINKING CALCULATOR */}
        <WaterIntakeCalculator waterData={waterData} onUpdateWater={handleUpdateWater} onHabitSync={handleHabitSync} />

        {/* 3. WEEKLY WORKOUT PLAN */}
        <WeeklyPlan weeklyData={weeklyWorkouts} onToggleWeeklyTask={handleToggleWeeklyTask} />

        {/* 4. HOME DUMBBELL WORKOUTS */}
        <DumbbellWorkouts onCompleteWorkout={handleCompleteDumbbellWorkout} />

        {/* 5. WALKING TRACKER */}
        <WalkingTracker walkingLogs={walkingLogs} onAddWalkLog={handleAddWalkLog} />

        {/* 6 & 7. NUTRITION DASHBOARD & FLEXIBLE FOODS */}
        <NutritionDashboard />

        {/* 8. SUGAR CUT TRACKER */}
        <SugarCutTracker />

        {/* 9. WEIGHT PROGRESS CHART */}
        <WeightProgressChart weightLogs={weightLogs} onAddWeightLog={handleAddWeightLog} targetWeight={100} />

        {/* 10. BODY TRANSFORMATION TRACKER */}
        <BodyTransformationTracker measurements={measurements} onAddMeasurement={handleAddMeasurement} />

        {/* SLEEP & RECOVERY TRACKER */}
        <SleepRecoveryTracker 
          sleepLogs={sleepLogs} 
          nightRoutine={nightRoutine} 
          onToggleNightRoutine={handleToggleNightRoutine} 
          onLogSleep={handleLogSleep} 
        />

        {/* 12. MILESTONES */}
        <Milestones currentWeight={currentWeight} />

        {/* 11 & 13. MOTIVATION & LIFESTYLE RULES */}
        <MotivationAndRules />

        {/* 14. DISCLAIMER FOOTER */}
        <DisclaimerFooter />
      </main>

      {/* 15. MOBILE BOTTOM NAVIGATION */}
      <MobileNavigation activeTab={activeTab} onTabSelect={setActiveTab} />

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
    </div>
  );
}
