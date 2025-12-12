import { useEffect, useState, useCallback } from "react";

/**
 * BLOCK B PLACEHOLDER: Offline-First State Management
 *
 * This hook will provide offline-first state management using IndexedDB
 * and automatic sync when the connection is restored.
 *
 * API Shape (to be implemented in Block B):
 *
 * interface OfflineState<T> {
 *   data: T;
 *   isDirty: boolean;
 *   isSyncing: boolean;
 *   error: string | null;
 *   lastSyncedAt: Date | null;
 * }
 *
 * Usage:
 * const { data, isDirty, isSyncing, sync } = useOfflineState({
 *   key: "issues",
 *   initialData: [],
 *   fetch: () => api.getIssues(),
 *   sync: (data) => api.updateIssues(data),
 * });
 */

interface UseOfflineStateOptions<T> {
  key: string;
  initialData: T;
  fetch?: () => Promise<T>;
  sync?: (data: T) => Promise<void>;
  autoSync?: boolean;
  syncInterval?: number;
}

interface OfflineStateResult<T> {
  data: T;
  isDirty: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncedAt: Date | null;
  updateLocal: (data: T | ((prev: T) => T)) => void;
  sync: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing offline-first state with automatic sync
 *
 * Features (planned for Block B):
 * - Automatic syncing when online
 * - IndexedDB persistence
 * - Conflict resolution
 * - Change tracking (dirty state)
 * - Error handling and retry logic
 * - Configurable sync intervals
 */
export function useOfflineState<T>(
  options: UseOfflineStateOptions<T>
): OfflineStateResult<T> {
  const { key, initialData, fetch: fetchData, sync: syncData, autoSync = true, syncInterval = 30000 } = options;

  const [data, setData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Update local state and mark as dirty
  const updateLocal = useCallback(
    (newData: T | ((prev: T) => T)) => {
      setData((prev) => {
        const updated = typeof newData === "function" ? (newData as (prev: T) => T)(prev) : newData;
        setIsDirty(true);
        // TODO: Save to IndexedDB
        return updated;
      });
    },
    []
  );

  // Sync with server
  const sync = useCallback(async () => {
    if (!isDirty || !syncData) return;

    setIsSyncing(true);
    setError(null);

    try {
      // TODO: Implement CRDT merge logic
      // TODO: Handle conflicts
      await syncData(data);
      setIsDirty(false);
      setLastSyncedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
      // TODO: Queue for retry
    } finally {
      setIsSyncing(false);
    }
  }, [data, isDirty, syncData]);

  // Reset state
  const reset = useCallback(() => {
    setData(initialData);
    setIsDirty(false);
    setError(null);
    // TODO: Clear from IndexedDB
  }, [initialData]);

  // Initial load from server
  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: Try loading from IndexedDB first
        if (fetchData) {
          const remoteData = await fetchData();
          setData(remoteData);
          setLastSyncedAt(new Date());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        // TODO: Fall back to IndexedDB cached data
      }
    };

    loadData();
  }, [key, fetchData]);

  // Auto-sync on interval
  useEffect(() => {
    if (!autoSync || !isDirty) return;

    const timer = setInterval(() => {
      sync();
    }, syncInterval);

    return () => clearInterval(timer);
  }, [autoSync, isDirty, syncInterval, sync]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // Trigger sync when back online
      if (isDirty) {
        sync();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isDirty, sync]);

  return {
    data,
    isDirty,
    isSyncing,
    error,
    lastSyncedAt,
    updateLocal,
    sync,
    reset,
  };
}
