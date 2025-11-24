import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import AuthScreen from '@/components/AuthScreen';
import HomePage from '@/components/HomePage';

export default function HomeTab() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { colors } = useThemeStore();

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  return <HomePage />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
