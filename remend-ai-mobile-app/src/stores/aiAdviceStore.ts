import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AIAdvice, CachedAdvice } from "../types/aiAdvice";
import { getRehabAdvice } from "../api/aiAdvice";

interface AIAdviceState {
  // Current advice being displayed
  currentAdvice: AIAdvice | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAdvice: (programId: number, mostRecentLogDate: string) => Promise<void>;
  clearAdvice: () => void;
  invalidateCache: (programId: number) => Promise<void>;
}

const CACHE_KEY_PREFIX = "ai_advice_";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 1 day

// In-flight request tracker to prevent duplicate concurrent requests
const inFlightRequests = new Map<number, Promise<void>>();

/**
 * AI advice store with AsyncStorage caching
 *
 * Caching strategy:
 * - Cache is keyed by programId
 * - Cache is valid if: mostRecentLogDate matches AND TTL hasn't expired
 * - Cache invalidates when: new log is added OR TTL expires
 * - Prevents redundant API calls and reduces costs
 * - Request deduplication prevents double-tap race conditions
 */
export const useAIAdviceStore = create<AIAdviceState>((set, get) => ({
  currentAdvice: null,
  isLoading: false,
  error: null,

  /**
   * Fetch AI advice for a program
   * Checks cache first, falls back to API if cache miss or stale
   * Prevents duplicate concurrent requests via deduplication
   */
  fetchAdvice: async (programId: number, mostRecentLogDate: string) => {
    // Check if there's already a request in flight for this program
    const existingRequest = inFlightRequests.get(programId);
    if (existingRequest) {
      // Wait for the existing request to complete
      return existingRequest;
    }

    // Create new request
    const requestPromise = (async () => {
      set({ isLoading: true, error: null });

      try {
        // Check cache first
        const cacheKey = `${CACHE_KEY_PREFIX}${programId}`;
        const cachedJson = await AsyncStorage.getItem(cacheKey);

        if (cachedJson) {
          const cached: CachedAdvice = JSON.parse(cachedJson);

          // Check if cache is valid
          const isDateMatch = cached.asOfDate === mostRecentLogDate;
          const isNotExpired = Date.now() - cached.generatedAt < CACHE_TTL;

          if (isDateMatch && isNotExpired) {
            // Cache hit
            set({ currentAdvice: cached.advice, isLoading: false });
            return;
          }
        }

        // Cache miss or stale - fetch from API
        const advice = await getRehabAdvice(programId);

        // Cache the result
        const toCache: CachedAdvice = {
          advice,
          asOfDate: mostRecentLogDate,
          programId,
          generatedAt: Date.now(),
        };

        await AsyncStorage.setItem(cacheKey, JSON.stringify(toCache));

        set({ currentAdvice: advice, isLoading: false });
      } catch (error: any) {
        set({
          error: error.message || "Failed to get AI advice",
          isLoading: false,
          currentAdvice: null,
        });
      } finally {
        // Clean up in-flight request
        inFlightRequests.delete(programId);
      }
    })();

    // Track the in-flight request
    inFlightRequests.set(programId, requestPromise);

    return requestPromise;
  },

  /**
   * Clear current advice from UI state
   * Does not clear cache
   */
  clearAdvice: () => {
    set({ currentAdvice: null, error: null });
  },

  /**
   * Invalidate cache for a program
   * Called when a new log is added to force fresh advice
   */
  invalidateCache: async (programId: number) => {
    const cacheKey = `${CACHE_KEY_PREFIX}${programId}`;
    await AsyncStorage.removeItem(cacheKey);

    // Also clear UI state if showing advice for this program
    const currentAdvice = get().currentAdvice;
    if (currentAdvice) {
      set({ currentAdvice: null });
    }
  },
}));
