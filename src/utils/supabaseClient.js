import { createClient } from '@supabase/supabase-js';

// Read from Vite env or user localStorage configuration
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem('transformation_supabase_url');
  const localKey = localStorage.getItem('transformation_supabase_key');

  const url = envUrl || localUrl || '';
  const anonKey = envKey || localKey || '';

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http')),
  };
};

let cachedClient = null;
let lastClientKey = '';

export const getSupabaseClient = () => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const clientKey = `${url}_${anonKey}`;
  if (cachedClient && lastClientKey === clientKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey);
    lastClientKey = clientKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
};

const TABLE_NAME = 'user_transformation_data';
const DEFAULT_USER_ID = 'primary_user';

// SQL table initialization script to provide to user
export const SUPABASE_SQL_SCHEMA = `
-- Run this in your Supabase SQL Editor to set up cloud synchronization:
CREATE TABLE IF NOT EXISTS user_transformation_data (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable public Row Level Security read/write for your dashboard
ALTER TABLE user_transformation_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON user_transformation_data FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert/update access" 
ON user_transformation_data FOR ALL 
USING (true) 
WITH CHECK (true);
`.trim();

/**
 * Fetch all dashboard data from Supabase
 */
export const fetchCloudDashboardData = async (userId = DEFAULT_USER_ID) => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('payload, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is row not found
        console.warn('Supabase fetch error:', error.message);
      }
      return null;
    }

    return data?.payload || null;
  } catch (e) {
    console.error('Error fetching cloud data:', e);
    return null;
  }
};

/**
 * Save all dashboard data to Supabase
 */
export const saveCloudDashboardData = async (payload, userId = DEFAULT_USER_ID) => {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Not configured' };

  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        id: userId,
        payload,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase save error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    console.error('Error saving to cloud:', e);
    return { success: false, error: e.message };
  }
};
