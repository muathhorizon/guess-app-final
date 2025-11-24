import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { LeaderboardEntry } from '../types';
import { apiService } from '../services/api';
import { Trophy, Medal, Award } from 'lucide-react-native';

export default function LeaderboardScreen() {
  const { colors } = useThemeStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/leaderboard?filter=${filter}`);
      setLeaderboard(response.data.leaderboard || mockLeaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard(mockLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy size={28} color="#FFD700" />;
      case 2:
        return <Medal size={28} color="#C0C0C0" />;
      case 3:
        return <Award size={28} color="#CD7F32" />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Leaderboard</Text>

        <View style={styles.filterContainer}>
          {(['all', 'weekly', 'monthly'] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[
                styles.filterButton,
                { borderColor: colors.border },
                filter === filterOption && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setFilter(filterOption)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      filter === filterOption ? '#fff' : colors.text,
                  },
                ]}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {leaderboard.map((entry, index) => (
            <View
              key={entry.user.id}
              style={[
                styles.entryCard,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    entry.rank <= 3 ? colors.primary : colors.border,
                },
                entry.rank <= 3 && styles.topEntry,
              ]}
            >
              <View style={styles.rankContainer}>
                {getRankIcon(entry.rank) || (
                  <Text style={[styles.rankText, { color: colors.text }]}>
                    {entry.rank}
                  </Text>
                )}
              </View>

              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {entry.user.name}
                </Text>
                <Text
                  style={[styles.gamesPlayed, { color: colors.secondaryText }]}
                >
                  {entry.gamesPlayed} games played
                </Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={[styles.score, { color: colors.primary }]}>
                  {entry.score}
                </Text>
                <Text
                  style={[styles.scoreLabel, { color: colors.secondaryText }]}
                >
                  pts
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user: { id: '1', name: 'Ahmed Hassan', email: 'ahmed@example.com' },
    score: 2500,
    gamesPlayed: 45,
  },
  {
    rank: 2,
    user: { id: '2', name: 'Sara Ali', email: 'sara@example.com' },
    score: 2350,
    gamesPlayed: 42,
  },
  {
    rank: 3,
    user: { id: '3', name: 'Omar Ibrahim', email: 'omar@example.com' },
    score: 2200,
    gamesPlayed: 38,
  },
  {
    rank: 4,
    user: { id: '4', name: 'Fatima Youssef', email: 'fatima@example.com' },
    score: 2100,
    gamesPlayed: 35,
  },
  {
    rank: 5,
    user: { id: '5', name: 'Khaled Mohamed', email: 'khaled@example.com' },
    score: 1950,
    gamesPlayed: 32,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  topEntry: {
    borderWidth: 2,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  gamesPlayed: {
    fontSize: 14,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 12,
  },
});
