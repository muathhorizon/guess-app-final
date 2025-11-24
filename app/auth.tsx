import React from 'react';
import { useRouter } from 'expo-router';
import AuthScreen from '@/components/AuthScreen';

export default function AuthPage() {
  const router = useRouter();

  return (
    <AuthScreen
      onAuthSuccess={() => {
        router.replace('/(tabs)');
      }}
    />
  );
}
