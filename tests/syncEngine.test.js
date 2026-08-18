import { describe, it, expect, beforeEach } from 'vitest';
import { syncEngine } from '../src/services/sync/syncEngine';

describe('Offline-First Sync Engine & Mutation Queue', () => {
  beforeEach(() => {
    syncEngine.queue = [];
  });

  it('enqueues mutations with clientTimestamp and pending status', () => {
    const mutId = syncEngine.enqueueMutation('weight', 'INSERT', { date: '2026-08-18', weight: 110.50 });
    expect(mutId).toBeDefined();
    expect(syncEngine.queue.length).toBe(1);

    const first = syncEngine.queue[0];
    expect(first.entity).toBe('weight');
    expect(first.action).toBe('INSERT');
    expect(first.payload.weight).toBe(110.50);
    expect(first.status).toBe('pending');
    expect(first.clientTimestamp).toBeDefined();
  });

  it('notifies subscribers of status changes', () => {
    let observedStatus = '';
    const unsubscribe = syncEngine.subscribe((status) => {
      observedStatus = status;
    });

    syncEngine.setStatus('syncing');
    expect(observedStatus).toBe('syncing');

    syncEngine.setStatus('synced');
    expect(observedStatus).toBe('synced');

    unsubscribe();
  });
});
