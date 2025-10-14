import type { AIAdvice } from "./provider_interface.js";
import aiConfig from "#config/ai";
import crypto from "node:crypto";

interface CacheEntry {
  advice: AIAdvice;
  timestamp: number;
}

/**
 * Simple in-memory cache for deduplicating AI requests
 * Prevents redundant LLM calls when users spam the button or have multiple tabs
 *
 * Key strategy: ${userId}_${programId}_${hash(logIds)}
 * - If logs change (new log added), hash changes → cache miss (correct)
 * - If same user+program+logs within TTL → cache hit (saves cost)
 */
class DeduplicationCache {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Generate cache key from user, program, and log IDs
   * Hash of log IDs ensures cache invalidates when logs change
   */
  generateKey(userId: number, programId: number, logIds: number[]): string {
    const logHash = crypto
      .createHash("sha256")
      .update(logIds.sort().join(","))
      .digest("hex")
      .substring(0, 16);

    return `${userId}_${programId}_${logHash}`;
  }

  /**
   * Get cached advice if still valid
   * Auto-cleans expired entries
   */
  get(key: string): AIAdvice | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL
    const age = Date.now() - entry.timestamp;
    if (age > aiConfig.cacheTtl) {
      this.cache.delete(key);
      return null;
    }

    return entry.advice;
  }

  /**
   * Cache advice with current timestamp
   */
  set(key: string, advice: AIAdvice): void {
    this.cache.set(key, {
      advice,
      timestamp: Date.now(),
    });

    // Periodic cleanup: remove expired entries every 100 sets
    if (this.cache.size % 100 === 0) {
      this.cleanup();
    }
  }

  /**
   * Remove all expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > aiConfig.cacheTtl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
  }

  /**
   * Clear entire cache (useful for testing)
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats for monitoring
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: aiConfig.cacheTtl,
    };
  }
}

// Export singleton instance
export default new DeduplicationCache();
