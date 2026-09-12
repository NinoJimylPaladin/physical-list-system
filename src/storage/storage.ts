/**
 * Storage wrapper conforming to the AsyncStorage interface.
 * Implements asynchronous methods (getItem, setItem, removeItem, clear)
 * backed by localStorage with error handling and fallback.
 */

class AsyncStorageService {
  private memoryFallback: Map<string, string> = new Map();

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
    } catch {
      return false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isLocalStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
      return this.memoryFallback.get(key) ?? null;
    } catch (error) {
      console.warn(`[AsyncStorage] getItem failed for key "${key}":`, error);
      return this.memoryFallback.get(key) ?? null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.setItem(key, value);
      }
      this.memoryFallback.set(key, value);
    } catch (error) {
      console.warn(`[AsyncStorage] setItem failed for key "${key}":`, error);
      this.memoryFallback.set(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
      }
      this.memoryFallback.delete(key);
    } catch (error) {
      console.warn(`[AsyncStorage] removeItem failed for key "${key}":`, error);
      this.memoryFallback.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.clear();
      }
      this.memoryFallback.clear();
    } catch (error) {
      console.warn('[AsyncStorage] clear failed:', error);
      this.memoryFallback.clear();
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (this.isLocalStorageAvailable()) {
        return Object.keys(window.localStorage);
      }
      return Array.from(this.memoryFallback.keys());
    } catch (error) {
      console.warn('[AsyncStorage] getAllKeys failed:', error);
      return Array.from(this.memoryFallback.keys());
    }
  }
}

export const AsyncStorage = new AsyncStorageService();
export default AsyncStorage;
