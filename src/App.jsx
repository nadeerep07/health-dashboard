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

import { calculateWeightMetrics } from './services/weightService';
import { estimateNutrition } from './services/nutritionService';

import AppLayout from './components/layout/AppLayout';
import DashboardHome from './components/screens/DashboardHome';
import TodayScreen from './components/screens/TodayScreen';
import NutritionScreen from './components/screens/NutritionScreen';
import ProgressScreen from './components/screens/ProgressScreen';
import PlanScreen from './components/screens/PlanScreen';
import MoreScreen from './components/screens/MoreScreen';

import PinLockScreen from './components/PinLockScreen';
import ChangePinModal from './components/ChangePinModal';
import SupabaseSyncModal from './components/SupabaseSyncModal';

const MASTER_PIN = import.meta.env.VITE_MASTER_PIN || '68356';

export default function App() {
  // Authentication & Security State
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

  // Active screen: 'home' | 'today' | 'nutrition' | 'progress' | 'plan' | 'more'
  const [activeScreen, setActiveScreen] = useState('home');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [isCloudConfigured, setIsCloudConfigured] = useState(() => getSupabaseConfig().isConfigured);

  const isInitialLoad = useRef(true);
  const syncTimeoutRef = useRef(null);

  // Persistence Effects
  useEffect(() => setStoredData(STORAGE_KEYS.WEIGHT_LOGS, weightLogs), [weightLogs]);
  useEffect(() => setStoredData(STORAGE_KEYS.DAILY_HABITS, habits), [habits]);
  useEffect(() => setStoredData(STORAGE_KEYS.WATER_INTAKE, waterData), [waterData]);
  useEffect(() => setStoredData(STORAGE_KEYS.WEEKLY_WORKOUTS, weeklyWorkouts), [weeklyWorkouts]);
  useEffect(() => setStoredData(STORAGE_KEYS.WALKING_LOGS, walkingLogs), [walkingLogs]);
  useEffect(() => setStoredData(STORAGE_KEYS.SLEEP_LOGS, sleepLogs), [sleepLogs]);
  useEffect(() => setStoredData(STORAGE_KEYS.NIGHT_ROUTINE, nightRoutine), [nightRoutine]);
  useEffect(() => setStoredData(STORAGE_KEYS.BODY_MEASUREMENTS, measurements), [measurements]);
  useEffect(() => setStoredData(STORAGE_KEYS.FOOD_LOGS, foodLogs), [foodLogs]);
  useEffect(() => setStoredData(STORAGE_KEYS.DASHBOARD_PIN, dashboardPin), [dashboardPin]);

  // Initial cloud fetch
  useEffect(() => {
    async function loadCloudData() {
      if (!getSupabaseConfig().isConfigured) return;
      setSyncStatus('syncing');
      try {
        const cloud = await fetchCloudDashboardData();
        if (cloud) {
          if (cloud.weightLogs) setWeightLogs(cloud.weightLogs);
          if (cloud.habits) setHabits(cloud.habits);
          if (cloud.waterData) setWaterData(cloud.waterData);
          if (cloud.weeklyWorkouts) setWeeklyWorkouts(cloud.weeklyWorkouts);
          if (cloud.walkingLogs) setWalkingLogs(cloud.walkingLogs);
          if (cloud.sleepLogs) setSleepLogs(cloud.sleepLogs);
          if (cloud.nightRoutine) setNightRoutine(cloud.nightRoutine);
          if (cloud.measurements) setMeasurements(cloud.measurements);
          if (cloud.foodLogs) setFoodLogs(cloud.foodLogs);
        }
        setSyncStatus('saved');
      } catch (err) {
        console.error('Failed to load cloud data on startup:', err);
        setSyncStatus('idle');
      } finally {
        setTimeout(() => isInitialLoad.current = false, 500);
      }
    }
    loadCloudData();
  }, []);

  // Debounced auto-sync to Supabase
  useEffect(() => {
    if (isInitialLoad.current || !getSupabaseConfig().isConfigured) return;

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
        lastUpdated: new Date().toISOString(),
      };
      const success = await saveCloudDashboardData(payload);
      if (success) {
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('idle');
      }
    }, 1500);

    return () => clearTimeout(syncTimeoutRef.current);
  }, [weightLogs, habits, waterData, weeklyWorkouts, walkingLogs, sleepLogs, nightRoutine, measurements, foodLogs]);

  // Security handlers
  const handleUnlock = () => setIsLocked(false);
  const handleLockApp = () => {
    setStoredData(STORAGE_KEYS.DEVICE_AUTH_EXPIRY, 0);
    setIsLocked(true);
  };
  const handleChangePin = (newPin) => {
    setDashboardPin(newPin);
    setShowChangePinModal(false);
  };

  // Metrics Calculation
  const weightMetrics = calculateWeightMetrics(weightLogs, 110.80, 100.00);

  // Quick Action Handlers
  const handleQuickLogFood = async (foodText, category = 'lunch') => {
    const today = selectedDate || new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const parsed = await estimateNutrition(foodText);
      const newItem = {
        id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: parsed.name || foodText,
        calories: parsed.calories || 0,
        protein: parsed.protein || 0,
        carbs: parsed.carbs || 0,
        fat: parsed.fat || 0,
        weightGrams: parsed.weightGrams || null,
        weightType: parsed.weightType || 'cooked',
        confidence: parsed.confidence || 'verified',
        time: timeStr,
      };

      setFoodLogs(prev => {
        const dayData = prev[today] || { breakfast: [], lunch: [], snack: [], dinner: [] };
        const currentCategory = dayData[category] || [];
        return {
          ...prev,
          [today]: {
            ...dayData,
            [category]: [newItem, ...currentCategory],
          }
        };
      });
    } catch (err) {
      console.error('Failed to quick log food:', err);
    }
  };

  const handleQuickLogWeight = (newLog) => {
    setWeightLogs(prev => {
      const filtered = prev.filter(l => l.date !== newLog.date);
      return [...filtered, newLog].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  };

  const handleQuickLogWalk = (newLog) => {
    setWalkingLogs(prev => [newLog, ...prev]);
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayId = dayNames[new Date().getDay()];
    setWeeklyWorkouts(prev => ({
      ...prev,
      [todayId]: { ...prev[todayId], walk: true }
    }));
  };

  const handleQuickLogWater = (amountMl) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newConsumed = (waterData.consumedMl || 0) + amountMl;
    const newHistory = [{ time: timeStr, amount: amountMl, label: `+${amountMl}ml Quick Log` }, ...(waterData.history || []).slice(0, 7)];

    setWaterData({
      ...waterData,
      consumedMl: newConsumed,
      history: newHistory,
    });
  };

  // Food log modifications
  const handleAddFoodItem = (dateStr, category, newItem) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    setFoodLogs(prev => {
      const dayData = prev[targetDate] || { breakfast: [], lunch: [], snack: [], dinner: [] };
      const currentCategory = dayData[category] || [];
      return {
        ...prev,
        [targetDate]: {
          ...dayData,
          [category]: [newItem, ...currentCategory]
        }
      };
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
  };

  // Export JSON Backup
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
    downloadAnchor.setAttribute("download", `apex100_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
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
        } catch (err) {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Calculate dynamic 100-Day Challenge Day count (Started: Aug 17, 2026)
  const challengeStartDate = new Date('2026-08-17T00:00:00');
  const now = new Date();
  const currentChallengeDay = Math.max(1, Math.floor((now - challengeStartDate) / (1000 * 60 * 60 * 24)) + 1);

  // If locked, render PIN screen
  if (isLocked) {
    return <PinLockScreen onUnlock={handleUnlock} currentPin={dashboardPin} />;
  }

  return (
    <AppLayout
      activeScreen={activeScreen}
      onNavigate={(screenId) => {
        setActiveScreen(screenId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onOpenPinModal={handleLockApp}
      onOpenSyncModal={() => setShowSyncModal(true)}
      onLogFood={handleQuickLogFood}
      onLogWeight={handleQuickLogWeight}
      onLogWalk={handleQuickLogWalk}
      onLogWater={handleQuickLogWater}
      currentWeight={weightMetrics.currentWeight}
      waterTargetMl={waterData.targetMl || 3500}
      streakDays={currentChallengeDay}
      isSynced={syncStatus === 'saved' || syncStatus === 'idle'}
    >
      {/* 1. SCREEN: HOME (Daily Transformation Coach) */}
      {activeScreen === 'home' && (
        <DashboardHome
          userName="Nidhu"
          currentWeight={weightMetrics.currentWeight}
          startWeight={weightMetrics.startWeight}
          targetWeight={weightMetrics.goalWeight}
          sevenDayAvg={weightMetrics.sevenDayAvg}
          weeklyDeltaKg={weightMetrics.weeklyDeltaKg}
          foodLogs={foodLogs}
          selectedDate={selectedDate}
          walkingLogs={walkingLogs}
          waterData={waterData}
          sleepLogs={sleepLogs}
          habits={habits}
          weeklyWorkouts={weeklyWorkouts}
          onNavigate={setActiveScreen}
          onOpenQuickAdd={(tab) => {
            // Trigger Quick Add via custom event or helper
            const event = new KeyboardEvent('keydown', { key: tab === 'food' ? 'f' : tab === 'weight' ? 'w' : tab === 'walk' ? 'a' : 'h' });
            window.dispatchEvent(event);
          }}
        />
      )}

      {/* 2. SCREEN: TODAY (Consolidated Daily Compliance Ledger) */}
      {activeScreen === 'today' && (
        <TodayScreen
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          foodLogs={foodLogs}
          weightLogs={weightLogs}
          walkingLogs={walkingLogs}
          waterData={waterData}
          sleepLogs={sleepLogs}
          habits={habits}
          weeklyWorkouts={weeklyWorkouts}
          onToggleHabit={(id) => setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h))}
          onOpenQuickAdd={(tab) => {
            const event = new KeyboardEvent('keydown', { key: tab === 'food' ? 'f' : tab === 'weight' ? 'w' : tab === 'walk' ? 'a' : 'h' });
            window.dispatchEvent(event);
          }}
          onNavigate={setActiveScreen}
        />
      )}

      {/* 3. SCREEN: NUTRITION */}
      {activeScreen === 'nutrition' && (
        <NutritionScreen
          foodLogs={foodLogs}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onAddFoodItem={handleAddFoodItem}
          onDeleteFoodItem={handleDeleteFoodItem}
          onResetFoodLogs={handleResetFoodLogs}
        />
      )}

      {/* 4. SCREEN: PROGRESS & WEIGHT */}
      {activeScreen === 'progress' && (
        <ProgressScreen
          weightLogs={weightLogs}
          measurements={measurements}
          onAddWeightLog={handleQuickLogWeight}
          onDeleteWeightLog={(id) => setWeightLogs(prev => prev.filter(l => l.id !== id))}
          onUpdateMeasurements={setMeasurements}
          targetWeight={100.00}
        />
      )}

      {/* 5. SCREEN: PLAN & WORKOUTS */}
      {activeScreen === 'plan' && (
        <PlanScreen
          weeklyWorkouts={weeklyWorkouts}
          onToggleWeeklyTask={(dayId, taskType) => setWeeklyWorkouts(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], [taskType]: !prev[dayId]?.[taskType] }
          }))}
          onCompleteWorkout={(workoutType) => {
            const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
            const todayId = dayNames[new Date().getDay()];
            setWeeklyWorkouts(prev => ({
              ...prev,
              [todayId]: { ...prev[todayId], workout: true }
            }));
          }}
        />
      )}

      {/* 6. SCREEN: MORE & SETTINGS */}
      {activeScreen === 'more' && (
        <MoreScreen
          waterData={waterData}
          onUpdateWater={setWaterData}
          sleepLogs={sleepLogs}
          habits={habits}
          onToggleHabit={(id) => setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h))}
          onOpenSyncModal={() => setShowSyncModal(true)}
          onOpenPinModal={() => setShowChangePinModal(true)}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />
      )}

      {/* Modals */}
      <SupabaseSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        syncStatus={syncStatus}
        onManualSync={() => {}}
        onResetDefaults={() => {
          if (window.confirm('Reset all metrics to default transformation baseline?')) {
            setWeightLogs(DEFAULT_WEIGHT_LOGS);
            setHabits(DEFAULT_HABITS);
            setWaterData(DEFAULT_WATER_INTAKE);
            setWeeklyWorkouts(DEFAULT_WEEKLY_WORKOUTS);
            setWalkingLogs(DEFAULT_WALKING_LOGS);
            setSleepLogs(DEFAULT_SLEEP_LOGS);
            setNightRoutine(DEFAULT_NIGHT_ROUTINE);
            setMeasurements(DEFAULT_MEASUREMENTS);
            setFoodLogs(DEFAULT_FOOD_LOGS);
          }
        }}
        onExportData={handleExportData}
        onImportData={handleImportData}
        isConfigured={isCloudConfigured}
      />

      <ChangePinModal
        isOpen={showChangePinModal}
        onClose={() => setShowChangePinModal(false)}
        onSavePin={handleChangePin}
      />
    </AppLayout>
  );
}
