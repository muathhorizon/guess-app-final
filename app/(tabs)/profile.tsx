import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import ProfileScreen from '@/components/ProfileScreen';

export default function ProfileTab() {
  const { isAuthenticated } = useAuthStore();
  const { colors } = useThemeStore();

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.text }]}>
          Please sign in to view your profile
        </Text>
      </View>
    );
  }

  return <ProfileScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
  },
});
