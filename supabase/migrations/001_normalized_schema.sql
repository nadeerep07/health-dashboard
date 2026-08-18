-- ==============================================================================
-- APEX 100 — Production Normalized PostgreSQL / Supabase Schema with Strict RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  target_weight NUMERIC(5,2) DEFAULT 100.00,
  start_weight NUMERIC(5,2) DEFAULT 110.80,
  calorie_budget INTEGER DEFAULT 2100,
  protein_goal_g INTEGER DEFAULT 130,
  water_target_ml INTEGER DEFAULT 3500,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. WEIGHT LOGS TABLE
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(5,2) NOT NULL CHECK (weight >= 30.0 AND weight <= 300.0),
  time_of_day TEXT DEFAULT 'Morning',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, date DESC);

-- 3. FOOD LOGS TABLE (Daily meal aggregate)
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner')),
  total_calories INTEGER DEFAULT 0 CHECK (total_calories >= 0 AND total_calories <= 5000),
  total_protein NUMERIC(5,1) DEFAULT 0 CHECK (total_protein >= 0),
  total_carbs NUMERIC(5,1) DEFAULT 0 CHECK (total_carbs >= 0),
  total_fat NUMERIC(5,1) DEFAULT 0 CHECK (total_fat >= 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date, meal_type)
);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, date DESC);

-- 4. FOOD ITEMS TABLE (Individual dish breakdown)
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_log_id UUID REFERENCES food_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(6,2) DEFAULT 1.0,
  unit TEXT DEFAULT 'g',
  weight_grams NUMERIC(6,1) CHECK (weight_grams >= 0 AND weight_grams <= 5000),
  weight_type TEXT DEFAULT 'cooked' CHECK (weight_type IN ('raw', 'cooked', 'edible')),
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein NUMERIC(5,1) NOT NULL CHECK (protein >= 0),
  carbs NUMERIC(5,1) NOT NULL CHECK (carbs >= 0),
  fat NUMERIC(5,1) NOT NULL CHECK (fat >= 0),
  fiber NUMERIC(5,1) DEFAULT 0,
  confidence TEXT DEFAULT 'verified' CHECK (confidence IN ('verified', 'ai_estimated', 'needs_review')),
  source TEXT DEFAULT 'verified_db',
  health_tip TEXT,
  time_logged TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_food_items_log_id ON food_items(food_log_id);
CREATE INDEX IF NOT EXISTS idx_food_items_user_id ON food_items(user_id);

-- 5. WALKING LOGS TABLE
CREATE TABLE IF NOT EXISTS walking_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day TEXT,
  distance_km NUMERIC(5,2) NOT NULL CHECK (distance_km >= 0 AND distance_km <= 100.0),
  duration_min INTEGER NOT NULL CHECK (duration_min >= 0),
  pace TEXT NOT NULL,
  calories_burned INTEGER NOT NULL CHECK (calories_burned >= 0),
  avg_heart_rate INTEGER CHECK (avg_heart_rate >= 30 AND avg_heart_rate <= 240),
  elevation_m INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_walking_logs_user_date ON walking_logs(user_id, date DESC);

-- 6. WATER LOGS TABLE
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  consumed_ml INTEGER DEFAULT 0 CHECK (consumed_ml >= 0 AND consumed_ml <= 15000),
  target_ml INTEGER DEFAULT 3500,
  history JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, date DESC);

-- 7. SLEEP LOGS TABLE
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day TEXT,
  bed_time TEXT NOT NULL,
  wake_time TEXT NOT NULL,
  duration_hours NUMERIC(4,2) NOT NULL CHECK (duration_hours >= 0 AND duration_hours <= 24.0),
  consistency TEXT DEFAULT 'On Time',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON sleep_logs(user_id, date DESC);

-- 8. HABIT LOGS TABLE
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  habit_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date, habit_id)
);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, date DESC);

-- 9. BODY MEASUREMENTS TABLE
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(5,2),
  waist_cm NUMERIC(5,2) CHECK (waist_cm >= 30.0 AND waist_cm <= 250.0),
  chest_cm NUMERIC(5,2) CHECK (chest_cm >= 30.0 AND chest_cm <= 250.0),
  hips_cm NUMERIC(5,2) CHECK (hips_cm >= 30.0 AND hips_cm <= 250.0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON body_measurements(user_id, date DESC);

-- 10. PROGRESS PHOTOS TABLE
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  weight NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user ON progress_photos(user_id, date DESC);

-- 11. TELEGRAM USERS LINKING TABLE
CREATE TABLE IF NOT EXISTS telegram_users (
  telegram_chat_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  first_name TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures complete multi-user isolation so users only access their own data
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE walking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Weight Logs Policies
CREATE POLICY "Users can manage own weight logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Food Logs Policies
CREATE POLICY "Users can manage own food logs" ON food_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Food Items Policies
CREATE POLICY "Users can manage own food items" ON food_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Walking Logs Policies
CREATE POLICY "Users can manage own walking logs" ON walking_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Water Logs Policies
CREATE POLICY "Users can manage own water logs" ON water_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sleep Logs Policies
CREATE POLICY "Users can manage own sleep logs" ON sleep_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit Logs Policies
CREATE POLICY "Users can manage own habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Body Measurements Policies
CREATE POLICY "Users can manage own body measurements" ON body_measurements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Progress Photos Policies
CREATE POLICY "Users can manage own progress photos" ON progress_photos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Telegram Users Policies
CREATE POLICY "Users can manage own telegram mapping" ON telegram_users
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
