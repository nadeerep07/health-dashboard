/**
 * Database Migration Script: Legacy JSONB -> Normalized Tables
 * Safely extracts user_transformation_data payload and inserts into normalized PostgreSQL schema
 */

import { createClient } from '@supabase/supabase-js';

// Auto-load .env
try {
  if (typeof process.loadEnvFile === 'function') process.loadEnvFile();
} catch (e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase URL or Anon Key in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function migrateLegacyJsonb(targetUserId = null) {
  console.log('🔄 Starting migration from user_transformation_data...');

  // 1. Fetch legacy JSONB payload
  const { data: legacyRow, error: fetchErr } = await supabase
    .from('user_transformation_data')
    .select('payload, updated_at')
    .eq('id', 'primary_user')
    .single();

  if (fetchErr) {
    console.error('Error fetching legacy payload:', fetchErr.message);
    return { success: false, error: fetchErr.message };
  }

  const payload = legacyRow?.payload;
  if (!payload) {
    console.log('No legacy payload found to migrate.');
    return { success: true, migratedCount: 0 };
  }

  console.log('📦 Found legacy payload. Migrating records...');

  // 2. Weight logs
  if (Array.isArray(payload.weightLogs) && payload.weightLogs.length > 0) {
    console.log(`Migrating ${payload.weightLogs.length} weight logs...`);
    for (const w of payload.weightLogs) {
      if (w.date && w.weight) {
        await supabase.from('weight_logs').upsert({
          user_id: targetUserId,
          date: w.date,
          weight: Number(w.weight),
          notes: w.notes || null,
          time_of_day: w.time || 'Morning'
        }, { onConflict: 'user_id,date' });
      }
    }
  }

  // 3. Walking logs
  if (Array.isArray(payload.walkingLogs) && payload.walkingLogs.length > 0) {
    console.log(`Migrating ${payload.walkingLogs.length} walking logs...`);
    for (const wl of payload.walkingLogs) {
      if (wl.date && wl.distance) {
        await supabase.from('walking_logs').upsert({
          user_id: targetUserId,
          date: wl.date,
          day: wl.day || null,
          distance_km: Number(wl.distance),
          duration_min: Number(wl.duration) || 60,
          pace: wl.pace || '11:07',
          calories_burned: Number(wl.calories) || 350,
          avg_heart_rate: Number(wl.avgHeartRate) || null,
          elevation_m: Number(wl.elevation) || 0,
          notes: wl.notes || null
        });
      }
    }
  }

  // 4. Water data
  if (payload.waterData && payload.waterData.consumedMl !== undefined) {
    const today = new Date().toISOString().split('T')[0];
    console.log('Migrating water data...');
    await supabase.from('water_logs').upsert({
      user_id: targetUserId,
      date: today,
      consumed_ml: Number(payload.waterData.consumedMl) || 0,
      target_ml: Number(payload.waterData.targetMl) || 3500,
      history: payload.waterData.history || []
    }, { onConflict: 'user_id,date' });
  }

  console.log('✅ Legacy migration completed successfully!');
  return { success: true };
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('migrateLegacyData.js')) {
  migrateLegacyJsonb().then(res => {
    console.log('Migration Result:', res);
    process.exit(0);
  });
}
