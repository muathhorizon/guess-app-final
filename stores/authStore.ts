import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { apiService } from '../services/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  loginWithGoogle: (idToken: string) => Promise<void>;
  loginManual: (name: string, email: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  loginWithGoogle: async (idToken: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.post('/auth/google', { token: idToken });
      const data = response.data.data;

      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
      };

      const token = data.token;

      set({ user, token, isAuthenticated: true, loading: false });
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Google login failed',
        loading: false
      });
      throw error;
    }
  },

  loginManual: async (name: string, email: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.post('/auth/manual', { name, email });
      const data = response.data.data;

      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
      };

      const token = data.token;

      set({ user, token, isAuthenticated: true, loading: false });
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        loading: false
      });
      throw error;
    }
  },

  sendOtp: async (email: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.post('/auth/send-otp', { email });
      set({ loading: false });
      return response.data.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to send OTP',
        loading: false
      });
      throw error.response?.data || { message: 'Failed to send OTP' };
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.post('/auth/verify-otp', { email, otp });
      const data = response.data.data;

      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
      };

      const token = data.token;

      set({ user, token, isAuthenticated: true, loading: false });
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Invalid or expired OTP',
        loading: false
      });
      throw error.response?.data || { message: 'Invalid or expired OTP' };
    }
  },

  resendOtp: async (email: string) => {
    await get().sendOtp(email);
  },

  logout: async () => {
    set({ user: null, token: null, isAuthenticated: false });
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
  },

  loadFromStorage: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('auth_token');

      if (userStr && token) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
