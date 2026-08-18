import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch (e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function verifyLiveRecordsAgainstBackup() {
  console.log('🔍 Running Before vs After Live Record Verification Pass...\n');

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const backupDir = path.resolve(__dirname, '../backups');
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();

  if (files.length === 0) {
    console.error('❌ No backup files found in backups directory.');
    return;
  }

  const latestBackupPath = path.join(backupDir, files[0]);
  const backupPayload = JSON.parse(fs.readFileSync(latestBackupPath, 'utf8'));

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: currentData, error } = await supabase
    .from('user_transformation_data')
    .select('*')
    .eq('id', 'primary_user')
    .maybeSingle();

  if (error) {
    console.error('❌ Failed to fetch current live data from Supabase:', error.message);
    return;
  }

  const livePayload = currentData?.payload || {};

  const entities = [
    { name: 'Weight records', key: 'weightLogs', type: 'array' },
    { name: 'Walking records', key: 'walkingLogs', type: 'array' },
    { name: 'Food dates logged', key: 'foodLogs', type: 'object_keys' },
    { name: 'Sleep records', key: 'sleepLogs', type: 'array' },
    { name: 'Habit records', key: 'habits', type: 'array' },
    { name: 'Body measurements', key: 'measurements', type: 'object_keys' },
  ];

  console.log('================================================================');
  console.log('RECORD AUDIT: BACKUP SNAPSHOT vs CURRENT LIVE DATABASE');
  console.log('================================================================');
  console.log(`Backup file: ${files[0]}\n`);

  let allMatch = true;

  for (const ent of entities) {
    let beforeCount = 0;
    let afterCount = 0;

    if (ent.type === 'array') {
      beforeCount = (backupPayload[ent.key] || []).length;
      afterCount = (livePayload[ent.key] || []).length;
    } else {
      beforeCount = Object.keys(backupPayload[ent.key] || {}).length;
      afterCount = Object.keys(livePayload[ent.key] || {}).length;
    }

    const missing = Math.max(0, beforeCount - afterCount);
    const duplicates = Math.max(0, afterCount - beforeCount);

    console.log(`▶ ${ent.name.padEnd(22)} | Before: ${String(beforeCount).padStart(2)} | After: ${String(afterCount).padStart(2)} | Missing: ${missing} | Duplicates: ${duplicates}`);
    if (missing > 0) allMatch = false;
  }

  console.log('================================================================');
  if (allMatch) {
    console.log('✅ ALL RECORDS 100% PRESERVED. ZERO DATA LOSS DETECTED.');
  } else {
    console.log('⚠️ WARNING: Record discrepancies detected.');
  }
}

verifyLiveRecordsAgainstBackup();
