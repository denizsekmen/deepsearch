/**
 * Free Usage Service
 * 
 * Manages daily free usage limits for non-premium users.
 * Tracks searches per day and sources per search.
 * 
 * Limits:
 * - FREE_SEARCHES_PER_DAY: 1 search per day
 * - FREE_SOURCES_PER_SEARCH: 2 sources per search
 * 
 * Resets daily at midnight local time.
 */
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const STORAGE_KEYS = {
  SEARCHES_COUNT: 'deepsearch_free_searches_count',
  LAST_RESET_DATE: 'deepsearch_last_reset_date',
  DAILY_SEARCHES: 'deepsearch_daily_searches', // Array of search timestamps
};

export const FREE_SEARCHES_PER_DAY = 1;
export const FREE_SOURCES_PER_SEARCH = 2;

/**
 * Check if we need to reset the daily counter
 */
function checkAndResetDaily() {
  const today = new Date().toDateString();
  const lastReset = storage.getString(STORAGE_KEYS.LAST_RESET_DATE);

  if (lastReset !== today) {
    // Reset counters
    storage.set(STORAGE_KEYS.SEARCHES_COUNT, '0');
    storage.set(STORAGE_KEYS.LAST_RESET_DATE, today);
    storage.set(STORAGE_KEYS.DAILY_SEARCHES, JSON.stringify([]));
    return true;
  }
  return false;
}

/**
 * Get current daily search count
 */
export function getDailySearchCount() {
  checkAndResetDaily();
  const count = storage.getString(STORAGE_KEYS.SEARCHES_COUNT);
  return parseInt(count || '0', 10);
}

/**
 * Check if user can perform a free search
 */
export function canPerformFreeSearch() {
  checkAndResetDaily();
  const count = getDailySearchCount();
  return count < FREE_SEARCHES_PER_DAY;
}

/**
 * Record a search attempt
 * @returns {boolean} true if search was allowed, false if limit reached
 */
export function recordSearch() {
  checkAndResetDaily();
  const count = getDailySearchCount();
  
  if (count >= FREE_SEARCHES_PER_DAY) {
    return false;
  }

  const newCount = count + 1;
  storage.set(STORAGE_KEYS.SEARCHES_COUNT, newCount.toString());
  
  // Record timestamp
  const searches = JSON.parse(storage.getString(STORAGE_KEYS.DAILY_SEARCHES) || '[]');
  searches.push(new Date().toISOString());
  storage.set(STORAGE_KEYS.DAILY_SEARCHES, JSON.stringify(searches));
  
  return true;
}

/**
 * Get remaining free searches for today
 */
export function getRemainingSearches() {
  const count = getDailySearchCount();
  return Math.max(0, FREE_SEARCHES_PER_DAY - count);
}

/**
 * Limit results array to free tier limit
 * @param {Array} results - Full results array
 * @param {boolean} isPremium - Whether user is premium
 * @returns {Array} Limited results if not premium, full results if premium
 */
export function limitResultsForFreeTier(results, isPremium) {
  if (isPremium) {
    return results;
  }
  return results.slice(0, FREE_SOURCES_PER_SEARCH);
}

/**
 * Reset all usage data (for testing or manual reset)
 */
export function resetUsageData() {
  storage.delete(STORAGE_KEYS.SEARCHES_COUNT);
  storage.delete(STORAGE_KEYS.LAST_RESET_DATE);
  storage.delete(STORAGE_KEYS.DAILY_SEARCHES);
}


