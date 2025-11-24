import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useThemeStore } from '../stores/themeStore';
import { Theme, Level } from '../types';
import { LogOut, Play, User, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    selectedTheme,
    selectedLevel,
    setTheme,
    setLevel,
    fetchThemes,
    fetchLevels,
    loading
  } = useGameStore();
  const { colors, playSound } = useThemeStore();

  const [themes, setThemes] = useState<Theme[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);
  const [isLoadingLevels, setIsLoadingLevels] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | number | null>(null);

  useEffect(() => {
    loadThemes();
  }, []);

  useEffect(() => {
    if (selectedTheme) {
      loadLevels();
    }
  }, [selectedTheme]);

  const loadThemes = async () => {
    setIsLoadingThemes(true);
    const fetchedThemes = await fetchThemes();
    setThemes(fetchedThemes);
    setIsLoadingThemes(false);
  };

  const loadLevels = async () => {
    setIsLoadingLevels(true);
    const fetchedLevels = await fetchLevels();
    setLevels(fetchedLevels);
    setIsLoadingLevels(false);
  };

  const handleThemeSelect = (theme: Theme) => {
    playSound('click');
    setTheme(theme);
  };

  const handleLevelSelect = (level: Level) => {
    playSound('click');
    setLevel(level);
  };

  const handleStartGame = () => {
    if (!selectedTheme || !selectedLevel) return;

    playSound('click');
    router.push('/game');
  };

  const handleLogout = async () => {
    playSound('click');
    await logout();
    router.replace('/auth');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getThemeName = (theme: Theme) => {
    if (typeof theme.name === 'string') return theme.name;
    return theme.name?.en || theme.name?.ar || '';
  };

  const getThemeDescription = (theme: Theme) => {
    if (typeof theme.description === 'string') return theme.description;
    return theme.description?.en || theme.description?.ar || '';
  };

  const getLevelName = (level: Level) => {
    if (typeof level.name === 'string') return level.name;
    return level.name?.en || level.name?.ar || '';
  };

  const getLevelHint = (level: Level) => {
    if (typeof level.hint === 'string') return level.hint;
    return level.hint?.en || level.hint?.ar || '';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.userChip, { backgroundColor: colors.secondaryBackground }]}
          onPress={() => {
            playSound('click');
            router.push('/profile');
          }}
        >
          <User size={20} color={colors.text} />
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.name}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.secondaryBackground }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Choose Theme
        </Text>

        {isLoadingThemes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.themeGrid}>
            {themes.map((theme, index) => (
              <Animated.View
                key={theme.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <TouchableOpacity
                  style={[
                    styles.themeCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selectedTheme?.id === theme.id && {
                      borderColor: colors.primary,
                      borderWidth: 3,
                    },
                  ]}
                  onPress={() => handleThemeSelect(theme)}
                >
                  <Text style={styles.themeIcon}>{theme.icon}</Text>
                  <Text style={[styles.themeName, { color: colors.text }]}>
                    {getThemeName(theme)}
                  </Text>
                  <Text style={[styles.themeDescription, { color: colors.secondaryText }]}>
                    {getThemeDescription(theme)}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {selectedTheme && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Select Difficulty
            </Text>

            {isLoadingLevels ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.levelList}>
                {levels.map((level, index) => (
                  <Animated.View
                    key={level.id}
                    entering={FadeInDown.delay(index * 100)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.levelCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        selectedLevel?.id === level.id && {
                          borderColor: colors.primary,
                          borderWidth: 3,
                        },
                      ]}
                      onPress={() => handleLevelSelect(level)}
                    >
                      <View style={styles.levelHeader}>
                        <View style={styles.levelTop}>
                          <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.levelBadgeText}>
                              {getLevelName(level)}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={[styles.infoButton, { borderColor: colors.border }]}
                            onPress={(e) => {
                              e.stopPropagation();
                              playSound('click');
                              setShowTooltip(showTooltip === level.id ? null : level.id);
                            }}
                          >
                            <Info size={16} color={colors.text} />
                          </TouchableOpacity>
                        </View>

                        {showTooltip === level.id && (
                          <View style={[styles.tooltip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.tooltipText, { color: colors.text }]}>
                              {getLevelHint(level)}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.levelStats}>
                        <View style={styles.statRow}>
                          <Text style={[styles.statKey, { color: colors.secondaryText }]}>
                            Categories:
                          </Text>
                          <Text style={[styles.statValue, { color: colors.primary }]}>
                            {level.categories_count}
                          </Text>
                        </View>
                        <View style={styles.statRow}>
                          <Text style={[styles.statKey, { color: colors.secondaryText }]}>
                            Time Available:
                          </Text>
                          <Text style={[styles.statValue, { color: colors.primary }]}>
                            {formatTime(level.time_per_attempt)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {selectedTheme && selectedLevel && (
        <View style={[styles.footer, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: colors.primary },
              loading && styles.disabledButton,
            ]}
            onPress={handleStartGame}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Play size={24} color="#fff" />
                <Text style={styles.startButtonText}>Begin Game</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: width < 768 ? (width - 52) / 2 : (width - 80) / 3,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 160,
  },
  themeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  themeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  levelList: {
    gap: 16,
  },
  levelCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  levelHeader: {
    marginBottom: 16,
  },
  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  tooltipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  levelStats: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statKey: {
    fontSize: 15,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
