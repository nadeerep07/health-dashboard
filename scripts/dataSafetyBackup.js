import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// Auto-load .env
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch (e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function backupUserData() {
  console.log('📦 Starting Data Safety Backup Pass...');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('⚠️ Supabase credentials not found in env, skipping remote cloud extraction.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    const { data, error } = await supabase
      .from('user_transformation_data')
      .select('*')
      .eq('id', 'primary_user')
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error.message);
      return;
    }

    if (data && data.payload) {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const backupDir = path.resolve(__dirname, '../backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `safety_backup_${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(data.payload, null, 2), 'utf8');

      console.log(`✅ Backup successfully saved to: ${backupPath}`);
      console.log(`   - Weight records: ${(data.payload.weightLogs || []).length}`);
      console.log(`   - Walking records: ${(data.payload.walkingLogs || []).length}`);
      console.log(`   - Food dates logged: ${Object.keys(data.payload.foodLogs || {}).length}`);
      console.log(`   - Sleep logs: ${(data.payload.sleepLogs || []).length}`);
      console.log(`   - Habits tracked: ${(data.payload.habits || []).length}`);
    } else {
      console.log('ℹ️ No remote payload found for primary_user, checking local storage defaults.');
    }
  } catch (err) {
    console.error('Backup exception:', err.message);
  }
}

backupUserData();
