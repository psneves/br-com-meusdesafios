import NetInfo from "@react-native-community/netinfo";
import { api, NetworkError } from "../api/client";
import { useOfflineQueueStore } from "../stores/offline-queue.store";

const MAX_RETRIES = 5;

export async function flushQueue(): Promise<void> {
  const store = useOfflineQueueStore.getState();
  if (store.isFlushing) return;
  if (store.queue.length === 0) return;

  store.setFlushing(true);

  try {
    // Process sequentially — stop on network errors
    for (const entry of [...store.queue]) {
      if (entry.retryCount >= MAX_RETRIES) {
        store.dequeue(entry.id);
        continue;
      }

      try {
        await api.post("/api/trackables/log", {
          userTrackableId: entry.userTrackableId,
          valueNum: entry.valueNum,
          date: entry.date,
          meta: entry.meta,
        });
        store.dequeue(entry.id);
      } catch (err) {
        if (err instanceof NetworkError) {
          // Still offline, stop flushing
          break;
        }
        // Other error (validation, auth, etc.) — increment retry
        store.incrementRetry(entry.id);
      }
    }
  } finally {
    store.setFlushing(false);
  }
}

/**
 * Subscribe to network state changes and flush the queue when
 * connectivity is restored. Returns an unsubscribe function.
 */
export function startQueueFlushListener(): () => void {
  let wasConnected = true;

  const unsubscribe = NetInfo.addEventListener((state) => {
    const isConnected = state.isConnected ?? false;

    // Flush when transitioning from offline → online
    if (isConnected && !wasConnected) {
      flushQueue();
    }

    wasConnected = isConnected;
  });

  // Also flush once on start in case there are queued items
  flushQueue();

  return unsubscribe;
}
