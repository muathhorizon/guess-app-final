import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import {
  ArrowLeft,
  User,
  Mail,
  Trophy,
  Target,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { colors, mode, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  const stats = [
    { icon: Trophy, label: 'Total Score', value: user?.score || 0 },
    { icon: Target, label: 'Games Played', value: 0 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <User size={48} color="#fff" />
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
          <View style={styles.emailContainer}>
            <Mail size={16} color={colors.secondaryText} />
            <Text style={[styles.email, { color: colors.secondaryText }]}>
              {user?.email}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View
                key={index}
                style={[styles.statCard, { backgroundColor: colors.card }]}
              >
                <Icon size={32} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                  {stat.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Settings
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={toggleTheme}
          >
            <View style={styles.settingLeft}>
              {mode === 'dark' ? (
                <Moon size={24} color={colors.text} />
              ) : (
                <Sun size={24} color={colors.text} />
              )}
              <Text style={[styles.settingText, { color: colors.text }]}>
                {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.secondaryText }]}>
              {mode === 'dark' ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              styles.logoutButton,
              { backgroundColor: colors.error + '20' },
            ]}
            onPress={handleLogout}
          >
            <View style={styles.settingLeft}>
              <LogOut size={24} color={colors.error} />
              <Text style={[styles.settingText, { color: colors.error }]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  email: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 8,
  },
});
