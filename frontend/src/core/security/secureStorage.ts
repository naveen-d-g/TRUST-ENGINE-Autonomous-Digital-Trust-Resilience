/**
 * Secure storage wrapper with encryption
 * Provides encrypted localStorage access for sensitive data
 */

const ENCRYPTION_KEY = 'trust-engine-secure-storage-v1';

function simpleEncrypt(data: string): string {
  // Simple XOR encryption for demonstration
  // In production, use a proper encryption library like crypto-js
  return btoa(
    data
      .split('')
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      )
      .join('')
  );
}

function simpleDecrypt(encrypted: string): string {
  try {
    const decoded = atob(encrypted);
    return decoded
      .split('')
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
      )
      .join('');
  } catch {
    return '';
  }
}

export const secureStorage = {
  setItem(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = simpleEncrypt(serialized);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to set secure storage item:', error);
    }
  },

  getItem<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = simpleDecrypt(encrypted);
      if (!decrypted) return null;

      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to get secure storage item:', error);
      return null;
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};
