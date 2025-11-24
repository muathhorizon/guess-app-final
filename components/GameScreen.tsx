import { useRouter } from 'expo-router';
import { Clock, MessageSquare, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { useThemeStore } from '../stores/themeStore';
import { Category, QuestionOption } from '../types';
import ResultScreen from './ResultScreen';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const router = useRouter();
  const {
    sessionId,
    categories,
    currentQuestion,
    currentOptions,
    conversationHistory,
    timeRemaining,
    gameStatus,
    questionsAsked,
    maxQuestions,
    entity,
    selectedTheme,
    selectedLevel,
    fetchQuestionsByCategory,
    askQuestion,
    verifyGuess,
    startGame,
    resetGame,
    loading,
  } = useGameStore();
  const { colors, playSound } = useThemeStore();
  const { user } = useAuthStore();

  // State management
  const [isStarting, setIsStarting] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showAnswerOverlay, setShowAnswerOverlay] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showGuessInput, setShowGuessInput] = useState(false);
  const [guessText, setGuessText] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ match: boolean; message: string } | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Initialize game with loading overlay
  useEffect(() => {
    const initGame = async () => {
      if (!selectedTheme || !selectedLevel) {
        console.error('No theme or level selected');
        router.replace('/home');
        return;
      }

      // Call startGame API
      const success = await startGame(selectedTheme, selectedLevel);

      if (!success) {
        console.error('Failed to start game');
        router.replace('/home');
        return;
      }

      // Show loading for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsStarting(false);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    };

    initGame();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryName = (category: Category) => {
    if (typeof category.name === 'string') return category.name;
    return category.name?.en || category.name?.ar || '';
  };

  const getOptionText = (option: QuestionOption) => {
    if (typeof option.text === 'string') return option.text;
    return option.text?.en || option.text?.ar || '';
  };

  // Handle category selection
  const handleCategorySelect = async (category: Category) => {
    if (category.used || isLoadingQuestions) return;

    playSound('click');
    setShowCategories(false);
    setIsLoadingQuestions(true);

    await fetchQuestionsByCategory(category.id);

    setIsLoadingQuestions(false);
  };

  // Handle option selection - CORRECT FLOW: Just send the option!
  const handleOptionSelect = async (option: QuestionOption) => {
    if (isAsking) return;

    setIsAsking(true);
    playSound('click');

    // Send option to backend, backend returns yes/no answer
    const answer = await askQuestion(option);

    if (answer !== null) {
      // Show answer overlay
      setCurrentAnswer({
        isCorrect: answer,
        text: answer ? 'Yes' : 'No'
      });
      setShowAnswerOverlay(true);
      playSound(answer ? 'correct' : 'wrong');

      // Hide overlay after delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      setShowAnswerOverlay(false);

      // Small delay then show categories again
      await new Promise(resolve => setTimeout(resolve, 300));
      setShowCategories(true);
    }

    setIsAsking(false);
  };

  // Handle guess submission
  const handleSubmitGuess = async () => {
    if (!guessText.trim() || isVerifying) return;

    setShowGuessInput(false);
    setIsVerifying(true);
    playSound('click');

    const result = await verifyGuess(guessText);

    setIsVerifying(false);

    if (result) {
      setVerificationResult(result);
      playSound(result.match ? 'win' : 'lose');
    } else {
      playSound('lose');
      setVerificationResult({ match: false, message: 'Verification failed' });
    }
  };

  const handlePlayAgain = () => {
    setVerificationResult(null);
    setGuessText('');
    resetGame();
    router.replace('/home');
  };

  const handleBackToMenu = () => {
    resetGame();
    router.replace('/home');
  };

  const categoriesRemaining = categories.filter(c => !c.used).length;

  // Initial Loading Overlay
  if (isStarting) {
    return (
      <View style={[styles.fullPageLoader, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.loaderContent, { opacity: fadeAnim }]}>
          <View style={styles.orbWrapperXL}>
            <View style={[styles.orbXL, { backgroundColor: colors.primary }]} />
            <View style={[styles.orbRingXL, { borderColor: colors.primary }]} />
          </View>
          <Text style={[styles.loaderTitleXL, { color: colors.text }]}>
            Loading Game...
          </Text>
          <View style={styles.loaderDots}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>
        </Animated.View>
      </View>
    );
  }

  // Show result screen if game ended
  if (verificationResult) {
    return (
      <ResultScreen
        status={verificationResult.match ? 'won' : 'lost'}
        entity={entity}
        questionsAsked={questionsAsked}
        score={0}
        timeElapsed={300 - timeRemaining}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Categories</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{categoriesRemaining}</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.giveUpButton, { borderColor: colors.error }]}
          onPress={handleBackToMenu}
        >
          <Text style={[styles.giveUpText, { color: colors.error }]}>Give Up</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Categories View */}
        {showCategories && !isLoadingQuestions && (
          <Animated.View style={[styles.categoriesSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Select a Category 🎮
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: category.used ? colors.border : colors.primary,
                      opacity: category.used ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => handleCategorySelect(category)}
                  disabled={category.used || isLoadingQuestions}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.used ? colors.border : colors.primary }]}>
                    <Text style={styles.categoryNumber}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {getCategoryName(category)}
                  </Text>
                  {category.used && (
                    <View style={styles.usedOverlay}>
                      <Text style={styles.usedText}>✓ Used</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Question Loading Overlay */}
        {isLoadingQuestions && (
          <View style={styles.questionLoader}>
            <View style={styles.loaderCard}>
              <View style={[styles.orbWrapperLarge, { borderColor: colors.primary }]}>
                <View style={[styles.orbLarge, { backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.loaderTitle, { color: colors.text }]}>
                Preparing Question...
              </Text>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          </View>
        )}

        {/* Question Options View */}
        {!showCategories && !isLoadingQuestions && currentOptions.length > 0 && (
          <View style={styles.questionArea}>
            <View style={styles.questionTitleWrapper}>
              <View style={[styles.questionIconRing, { borderColor: colors.primary }]}>
                <Text style={styles.questionIcon}>❓</Text>
              </View>
              <Text style={[styles.questionTitle, { color: colors.text }]}>
                {currentQuestion}
              </Text>
            </View>

            <View style={styles.optionsGrid}>
              {currentOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleOptionSelect(option)}
                  disabled={isAsking}
                >
                  <Text style={[styles.optionNumber, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {getOptionText(option)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.primary,
              width: `${maxQuestions > 0 ? (questionsAsked / maxQuestions) * 100 : 0}%`
            },
          ]}
        />
      </View>

      {/* Floating Conversation Button */}
      {conversationHistory.length > 0 && !isVerifying && (
        <TouchableOpacity
          style={[styles.floatingConversationButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowConversationModal(true)}
        >
          <MessageSquare size={24} color="#fff" />
          <Text style={styles.floatingButtonText}>View Chat</Text>
        </TouchableOpacity>
      )}

      {/* Floating Guess Button */}
      {!isVerifying && (
        <TouchableOpacity
          style={[styles.floatingGuessButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowGuessInput(!showGuessInput)}
        >
          <Text style={styles.floatingGuessText}>
            {showGuessInput ? '💭 Close' : '✍️ Make Guess'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Guess Input Section */}
      {showGuessInput && (
        <View style={[styles.guessInputSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.guessInputTitle, { color: colors.text }]}>Enter Your Guess</Text>
          <TextInput
            style={[
              styles.guessInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Type your guess here..."
            placeholderTextColor={colors.secondaryText}
            value={guessText}
            onChangeText={setGuessText}
            autoFocus
          />
          <TouchableOpacity
            style={[
              styles.submitGuessButton,
              { backgroundColor: colors.primary },
              (!guessText.trim() || isVerifying) && styles.disabledButton,
            ]}
            onPress={handleSubmitGuess}
            disabled={!guessText.trim() || isVerifying}
          >
            <Text style={styles.submitGuessText}>Submit Guess</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Answer Overlay */}
      <Modal visible={showAnswerOverlay} transparent animationType="fade">
        <View
          style={[
            styles.answerOverlay,
            { backgroundColor: currentAnswer?.isCorrect ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)' },
          ]}
        >
          <View style={styles.answerContent}>
            <View style={styles.answerIconWrapper}>
              <Text style={styles.answerIcon}>
                {currentAnswer?.isCorrect ? '✓' : '✗'}
              </Text>
            </View>
            <Text style={styles.answerTitle}>
              {currentAnswer?.isCorrect ? 'Yes!' : 'No!'}
            </Text>
            <Text style={styles.answerText}>{currentAnswer?.text}</Text>
          </View>
        </View>
      </Modal>

      {/* Conversation Modal */}
      <Modal visible={showConversationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.conversationModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Conversation History</Text>
              <TouchableOpacity onPress={() => setShowConversationModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.conversationList}>
              {conversationHistory.map((item: any, index: number) => (
                <View key={index} style={[styles.conversationItem, { backgroundColor: colors.background }]}>
                  <Text style={[styles.conversationQuestion, { color: colors.text }]}>
                    ❓ {item.question}
                  </Text>
                  <Text
                    style={[
                      styles.conversationAnswer,
                      { color: item.answer === 'yes' ? colors.success : colors.error },
                    ]}
                  >
                    {item.answer === 'yes' ? '✓ Yes' : '✗ No'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Verification Overlay */}
      <Modal visible={isVerifying} transparent animationType="fade">
        <View style={styles.verificationOverlay}>
          <View style={styles.verificationLoader}>
            <View style={[styles.orbWrapperVerification, { borderColor: colors.primary }]}>
              <View style={[styles.orbVerification, { backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.verificationTitle, { color: '#fff' }]}>
              Verifying Guess...
            </Text>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullPageLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    gap: 24,
  },
  orbWrapperXL: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbXL: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  orbRingXL: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  loaderTitleXL: {
    fontSize: 24,
    fontWeight: '800',
  },
  loaderDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  giveUpButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  giveUpText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  categoriesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 160,
    position: 'relative',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  usedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  usedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  questionLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loaderCard: {
    alignItems: 'center',
    gap: 20,
  },
  orbWrapperLarge: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 50,
  },
  orbLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  loaderTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  questionArea: {
    padding: 16,
  },
  questionTitleWrapper: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  questionIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionIcon: {
    fontSize: 40,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 30,
  },
  optionsGrid: {
    gap: 16,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 100,
    justifyContent: 'center',
  },
  optionNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
  },
  progressBar: {
    height: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  floatingConversationButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  floatingGuessButton: {
    position: 'absolute',
    bottom: 32,
    right: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingGuessText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  guessInputSection: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    padding: 20,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  guessInputTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  guessInput: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 2,
  },
  submitGuessButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitGuessText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  answerOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerContent: {
    alignItems: 'center',
    gap: 20,
  },
  answerIconWrapper: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerIcon: {
    fontSize: 60,
    fontWeight: '900',
  },
  answerTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  answerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  conversationModal: {
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  conversationList: {
    flex: 1,
  },
  conversationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  conversationQuestion: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  conversationAnswer: {
    fontSize: 16,
    fontWeight: '700',
  },
  verificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationLoader: {
    alignItems: 'center',
    gap: 24,
  },
  orbWrapperVerification: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: 60,
  },
  orbVerification: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
});
