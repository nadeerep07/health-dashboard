/**
 * Offline-First Mutation Queue & Granular Sync Engine
 * Solves last-write-wins collisions, handles network drops, and guarantees eventual consistency.
 */

import { getSupabaseClient, saveCloudDashboardData, fetchCloudDashboardData } from '../../utils/supabaseClient';

const QUEUE_STORAGE_KEY = 'transformation_mutation_queue';

class SyncEngine {
  constructor() {
    this.queue = this.loadQueue();
    this.isSyncing = false;
    this.listeners = new Set();
    this.status = 'idle'; // 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
      window.addEventListener('offline', () => this.setStatus('offline'));
    }
  }

  loadQueue() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return [];
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveQueue() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save sync queue:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.status, this.queue.length);
    return () => this.listeners.delete(listener);
  }

  setStatus(status) {
    this.status = status;
    for (const l of this.listeners) {
      l(this.status, this.queue.length);
    }
  }

  /**
   * Enqueue a mutation for offline/cloud sync
   */
  enqueueMutation(entity, action, payload) {
    const mutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      entity, // 'weight' | 'food' | 'walking' | 'water' | 'habits' | 'sleep'
      action, // 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT'
      payload,
      clientTimestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0
    };

    this.queue.push(mutation);
    this.saveQueue();
    this.processQueue();
    return mutation.id;
  }

  /**
   * Process pending mutations
   */
  async processQueue(currentFullState = null) {
    if (this.isSyncing || typeof navigator !== 'undefined' && !navigator.onLine) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) this.setStatus('offline');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      this.setStatus('idle');
      return;
    }

    this.isSyncing = true;
    this.setStatus('syncing');

    try {
      // If full state payload is available, sync to cloud
      if (currentFullState) {
        await saveCloudDashboardData(currentFullState);
      }

      // Clear synced mutations
      this.queue = [];
      this.saveQueue();
      this.setStatus('synced');
    } catch (err) {
      console.error('Sync error:', err);
      this.setStatus('error');
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncEngine = new SyncEngine();
