/**
 * CECUREUS — Secure Storage Service
 *
 * Stores session tokens and sensitive credentials using platform-native hardware security
 * (iOS Keychain, Android KeyStore via expo-secure-store).
 * Provides in-memory / local storage fallback for web.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'cecureus_auth_token';
const USER_KEY = 'cecureus_user_profile';

// Memory fallback for environments without SecureStore
const memoryStorage: Record<string, string> = {};

export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        memoryStorage[key] = value;
      }
      return;
    }
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch (error) {
    memoryStorage[key] = value;
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    return memoryStorage[key] || null;
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete memoryStorage[key];
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    delete memoryStorage[key];
  }
}

// Token helper methods
export async function saveAuthToken(token: string): Promise<void> {
  await setSecureItem(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await getSecureItem(TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  await deleteSecureItem(TOKEN_KEY);
}

// User profile cache helpers
export async function saveUserProfile(user: any): Promise<void> {
  await setSecureItem(USER_KEY, JSON.stringify(user));
}

export async function getUserProfile(): Promise<any | null> {
  const json = await getSecureItem(USER_KEY);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function removeUserProfile(): Promise<void> {
  await deleteSecureItem(USER_KEY);
}
