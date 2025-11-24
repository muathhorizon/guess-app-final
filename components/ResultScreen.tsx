import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../stores/gameStore';
import { useThemeStore } from '../stores/themeStore';
import { Trophy, Home, RotateCcw } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

export default function ResultScreen() {
  const router = useRouter();
  const { score, resetGame } = useGameStore();
  const { colors } = useThemeStore();

  const handlePlayAgain = () => {
    resetGame();
    router.replace('/(tabs)');
  };

  const handleGoHome = () => {
    resetGame();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeIn.duration(500)}
        style={styles.content}
      >
        <Animated.View
          entering={SlideInUp.delay(200).duration(500)}
          style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}
        >
          <Trophy size={80} color={colors.primary} />
        </Animated.View>

        <Animated.Text
          entering={SlideInUp.delay(400).duration(500)}
          style={[styles.title, { color: colors.text }]}
        >
          Game Complete!
        </Animated.Text>

        <Animated.View
          entering={SlideInUp.delay(600).duration(500)}
          style={[styles.scoreCard, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.scoreLabel, { color: colors.secondaryText }]}>
            Your Score
          </Text>
          <Text style={[styles.scoreValue, { color: colors.primary }]}>
            {score}
          </Text>
          <Text style={[styles.scoreSubtext, { color: colors.secondaryText }]}>
            points
          </Text>
        </Animated.View>

        <Animated.View
          entering={SlideInUp.delay(800).duration(500)}
          style={styles.buttons}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handlePlayAgain}
          >
            <RotateCcw size={24} color="#fff" />
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={handleGoHome}
          >
            <Home size={24} color={colors.text} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Go Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    marginBottom: 40,
    minWidth: 200,
  },
  scoreLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  scoreSubtext: {
    fontSize: 18,
    marginTop: 4,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
