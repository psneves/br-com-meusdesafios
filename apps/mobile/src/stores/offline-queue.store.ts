import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface QueuedLog {
  id: string;
  userTrackableId: string;
  valueNum: number;
  date?: string;
  meta?: Record<string, unknown>;
  queuedAt: number;
  retryCount: number;
}

interface OfflineQueueState {
  queue: QueuedLog[];
  isFlushing: boolean;
  enqueue: (
    entry: Omit<QueuedLog, "id" | "queuedAt" | "retryCount">
  ) => void;
  dequeue: (id: string) => void;
  incrementRetry: (id: string) => void;
  setFlushing: (val: boolean) => void;
}

let idCounter = 0;
function generateId(): string {
  return `q_${Date.now()}_${++idCounter}`;
}

export const useOfflineQueueStore = create<OfflineQueueState>()(
  persist(
    (set) => ({
      queue: [],
      isFlushing: false,

      enqueue: (entry) =>
        set((state) => ({
          queue: [
            ...state.queue,
            { ...entry, id: generateId(), queuedAt: Date.now(), retryCount: 0 },
          ],
        })),

      dequeue: (id) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        })),

      incrementRetry: (id) =>
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id
              ? { ...item, retryCount: item.retryCount + 1 }
              : item
          ),
        })),

      setFlushing: (val) => set({ isFlushing: val }),
    }),
    {
      name: "offline-log-queue",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
