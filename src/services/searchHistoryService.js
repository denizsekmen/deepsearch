/**
 * Search History Service
 * 
 * Manages search history storage and retrieval.
 * Uses MMKV for fast local storage.
 */
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const HISTORY_KEY = 'deepsearch_search_history';
const MAX_HISTORY_ITEMS = 100;

/**
 * Search History Item
 * @typedef {Object} SearchHistoryItem
 * @property {string} id - Unique ID
 * @property {string} type - Search type: 'name', 'phone', 'email', 'username'
 * @property {string} query - Search query
 * @property {string} timestamp - ISO timestamp
 * @property {number} resultCount - Number of results found
 */

/**
 * Add a search to history
 * @param {string} type - Search type
 * @param {string} query - Search query
 * @param {number} resultCount - Number of results
 */
export function addToHistory(type, query, resultCount = 0) {
  try {
    const history = getHistory();
    
    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      query: query.trim(),
      timestamp: new Date().toISOString(),
      resultCount,
    };

    // Add to beginning
    history.unshift(newItem);

    // Limit to MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }

    storage.set(HISTORY_KEY, JSON.stringify(history));
    return newItem;
  } catch (error) {
    console.error('Error adding to search history:', error);
    return null;
  }
}

/**
 * Get all search history
 * @returns {SearchHistoryItem[]} Array of history items
 */
export function getHistory() {
  try {
    const historyJson = storage.getString(HISTORY_KEY);
    if (!historyJson) {
      return [];
    }
    return JSON.parse(historyJson);
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
}

/**
 * Clear all search history
 */
export function clearHistory() {
  try {
    storage.delete(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing search history:', error);
    return false;
  }
}

/**
 * Remove a specific history item
 * @param {string} id - History item ID
 */
export function removeHistoryItem(id) {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    storage.set(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing history item:', error);
    return false;
  }
}

/**
 * Get history items by type
 * @param {string} type - Search type filter
 * @returns {SearchHistoryItem[]} Filtered history items
 */
export function getHistoryByType(type) {
  const history = getHistory();
  return history.filter(item => item.type === type);
}




