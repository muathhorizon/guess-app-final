import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

export default function RootLayout() {
  useFrameworkReady();

  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  useEffect(() => {
    loadFromStorage();
    loadTheme();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="game" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="result" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
