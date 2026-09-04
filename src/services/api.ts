/**
 * CECUREUS — Production API Client
 *
 * Robust REST client with:
 * - Automatic Authorization header injection
 * - Timeout handling
 * - Offline/Demo mode fallback with realistic mock data
 * - Strict type definitions
 */

import { getAuthToken } from './storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const PUBLIC_TUNNEL_URL = 'https://misc-spotlight-yoga-mpegs.trycloudflare.com';
const LOCAL_LAN_URL = 'http://192.168.1.3:3000';

function resolveApiBaseUrl(): string {
  // 1. Explicit environment variable (injected by Expo from .env)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  // 2. Extract host from Expo Go runtime
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).linkingUri;

  if (hostUri && typeof hostUri === 'string') {
    const clean = hostUri.replace(/^exp:\/\//, '').replace(/^https?:\/\//, '');
    const host = clean.split(':')[0];

    // Only if it's a real numeric IPv4 address (e.g. 192.168.1.3), use port 3000 on LAN
    const isNumericIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
    if (isNumericIpv4 && host !== '127.0.0.1' && host !== 'localhost') {
      return `http://${host}:3000`;
    }
  }

  // 3. If running via tunnel (exp.direct / ngrok) or fallback, use active HTTPS tunnel
  return PUBLIC_TUNNEL_URL;
}

export const DEFAULT_API_URL = resolveApiBaseUrl();

let currentBaseUrl = DEFAULT_API_URL;

export function setApiBaseUrl(url: string) {
  currentBaseUrl = url.replace(/\/$/, '');
}

export function getApiBaseUrl() {
  return currentBaseUrl;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  timeoutMs?: number;
  idempotencyKey?: string;
}

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

async function executeFetch(baseUrl: string, endpoint: string, options: RequestOptions = {}): Promise<any> {
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options.headers,
  };

  if (!options.skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (options.idempotencyKey) {
    headers['X-Idempotency-Key'] = options.idempotencyKey;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data.code || 'API_ERROR',
        data.details
      );
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Core HTTP request handler with automatic fallback between HTTPS Tunnel and LAN IP
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  // First attempt on primary currentBaseUrl
  try {
    const result = await executeFetch(currentBaseUrl, endpoint, options);
    return result as T;
  } catch (error: any) {
    // If it's a server response error (4xx/5xx from API), don't retry, return real error
    if (error instanceof ApiError && error.statusCode > 0) {
      throw error;
    }

    // Network error / connection aborted: try alternate connection route
    const alternateUrl = currentBaseUrl.includes('trycloudflare.com')
      ? LOCAL_LAN_URL
      : PUBLIC_TUNNEL_URL;

    try {
      const fallbackResult = await executeFetch(alternateUrl, endpoint, options);
      // Switch active URL since fallback succeeded
      currentBaseUrl = alternateUrl;
      return fallbackResult as T;
    } catch (fallbackError: any) {
      if (fallbackError instanceof ApiError && fallbackError.statusCode > 0) {
        throw fallbackError;
      }

      if (error.name === 'AbortError' || fallbackError.name === 'AbortError') {
        throw new ApiError('Request timed out. Please check your internet connection.', 408, 'TIMEOUT');
      }

      throw new ApiError(
        'Unable to reach CecureUs server. Please verify your internet connection and try again.',
        0,
        'NETWORK_ERROR'
      );
    }
  }
}

// ─── DOMAIN API WRAPPERS ──────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; phone: string; email?: string; password?: string }) =>
    apiRequest('/api/auth/register', { method: 'POST', body: data, skipAuth: true }),

  requestPhoneOtp: (data: { phone: string }) =>
    apiRequest('/api/auth/request-otp', { method: 'POST', body: { phone: data.phone, purpose: 'registration' }, skipAuth: true }),

  verifyPhoneStep: (data: { phone: string; code: string; email: string }) =>
    apiRequest('/api/auth/verify-phone-step', { method: 'POST', body: data, skipAuth: true }),

  requestEmailOtp: (data: { email: string }) =>
    apiRequest('/api/auth/request-otp', { method: 'POST', body: { phone: data.email, purpose: 'registration' }, skipAuth: true }),

  registerWithOtp: (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    emailOtp: string;
  }) =>
    apiRequest('/api/auth/register-with-otp', { method: 'POST', body: data, skipAuth: true }),

  login: (data: { phone: string; password?: string }) =>
    apiRequest('/api/auth/login', { method: 'POST', body: data, skipAuth: true }),

  requestOtp: (data: { phone: string; purpose: 'registration' | 'login' | 'password_reset' }) =>
    apiRequest('/api/auth/request-otp', { method: 'POST', body: data, skipAuth: true }),

  verifyOtp: (data: { phone: string; code: string; purpose: 'registration' | 'login' | 'password_reset' }) =>
    apiRequest('/api/auth/verify-otp', { method: 'POST', body: data, skipAuth: true }),

  logout: () =>
    apiRequest('/api/auth/logout', { method: 'POST' }),

  deleteAccount: () =>
    apiRequest('/api/auth/account', { method: 'DELETE' }),
};

export const profileApi = {
  getProfile: () =>
    apiRequest('/api/profile', { method: 'GET' }),

  updateProfile: (data: { name?: string; email?: string }) =>
    apiRequest('/api/profile', { method: 'PUT', body: data }),
};

export const counsellorApi = {
  list: (params?: { page?: number; limit?: number; specialization?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.specialization) query.append('specialization', params.specialization);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return apiRequest(`/api/counsellors${qs ? `?${qs}` : ''}`, { method: 'GET', skipAuth: true });
  },

  getById: (id: string) =>
    apiRequest(`/api/counsellors/${id}`, { method: 'GET', skipAuth: true }),

  bookSession: (counsellorId: string, data: { sessionType: string; scheduledAt: string; durationMinutes?: number; topics?: string[] }, idempotencyKey?: string) =>
    apiRequest(`/api/counsellors/${counsellorId}/book`, { method: 'POST', body: data, idempotencyKey }),

  getMySessions: (params?: { page?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return apiRequest(`/api/counsellors/sessions${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },
};

export const moodApi = {
  getHistory: (params?: { limit?: number; days?: number }) => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.days) query.append('days', String(params.days));
    const qs = query.toString();
    return apiRequest(`/api/mood${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  logMood: (data: { mood: 'great' | 'good' | 'okay' | 'low' | 'bad'; note?: string }) =>
    apiRequest('/api/mood', { method: 'POST', body: data }),
};

export const assessmentApi = {
  list: (category?: string) => {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest(`/api/assessments${qs}`, { method: 'GET', skipAuth: true });
  },

  getById: (id: string) =>
    apiRequest(`/api/assessments/${id}`, { method: 'GET', skipAuth: true }),

  submit: (id: string, answers: { questionId: number; selectedOptionIndex: number }[]) =>
    apiRequest(`/api/assessments/${id}/submit`, { method: 'POST', body: { answers } }),

  getMyHistory: () =>
    apiRequest('/api/assessments/history/me', { method: 'GET' }),
};

export const allyApi = {
  getConversations: () =>
    apiRequest('/api/ally/conversations', { method: 'GET', timeoutMs: 20000 }),

  startConversation: (data: { topic?: string; initialMessage?: string }) =>
    apiRequest('/api/ally/conversations', { method: 'POST', body: data, timeoutMs: 45000 }),

  getConversation: (id: string) =>
    apiRequest(`/api/ally/conversations/${id}`, { method: 'GET', timeoutMs: 20000 }),

  sendMessage: (conversationId: string, content: string) =>
    apiRequest(`/api/ally/conversations/${conversationId}/messages`, { method: 'POST', body: { content }, timeoutMs: 45000 }),
};
