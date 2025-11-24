import { create } from 'zustand';
import { Theme, Level, Category, Question, QuestionOption, ConversationItem, GameEntity, User } from '../types';
import { apiService } from '../services/api';
import { useAuthStore } from './authStore';

interface GameStoreState {
  sessionId: string | null;
  user: User | null;
  selectedTheme: Theme | null;
  selectedLevel: Level | null;
  categories: Category[];
  selectedCategory: Category | null;
  questions: Question[];
  currentQuestion: string | null;
  currentOptions: QuestionOption[];
  conversation: ConversationItem[];
  conversationHistory: { id: string; question: string; answer: 'yes' | 'no' }[];
  questionsAsked: number;
  maxQuestions: number;
  categoriesCount: number;
  timeLimit: number;
  timeRemaining: number;
  status: 'idle' | 'playing' | 'won' | 'lost';
  gameStatus: 'category-selection' | 'questioning' | 'ended';
  entity: GameEntity | null;
  score: number;
  resultSummary: { type: 'win' | 'lose'; message: string } | null;
  loading: boolean;
  error: string | null;

  setTheme: (theme: Theme) => void;
  setLevel: (level: Level) => void;
  startGame: (theme: Theme, level: Level) => Promise<boolean>;
  fetchQuestionsByCategory: (categoryId: number | string) => Promise<Question[]>;
  askQuestion: (option: QuestionOption) => Promise<boolean | null>;
  verifyGuess: (guess: string) => Promise<any>;
  fetchSuggestions: () => Promise<string[]>;
  fetchThemes: () => Promise<Theme[]>;
  fetchLevels: () => Promise<Level[]>;
  resetGame: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  clearError: () => void;
}

let timerInterval: NodeJS.Timeout | null = null;

export const useGameStore = create<GameStoreState>((set, get) => ({
  sessionId: null,
  user: null,
  selectedTheme: null,
  selectedLevel: null,
  categories: [],
  selectedCategory: null,
  questions: [],
  currentQuestion: null,
  currentOptions: [],
  conversation: [],
  conversationHistory: [],
  questionsAsked: 0,
  maxQuestions: 0,
  categoriesCount: 0,
  timeLimit: 0,
  timeRemaining: 0,
  status: 'idle',
  gameStatus: 'category-selection',
  entity: null,
  score: 0,
  resultSummary: null,
  loading: false,
  error: null,

  setTheme: (theme: Theme) => {
    set({ selectedTheme: theme });
  },

  setLevel: (level: Level) => {
    set({ selectedLevel: level });
  },

  startGame: async (theme: Theme, level: Level) => {
    try {
      const auth = useAuthStore.getState();
      if (!auth.user) {
        console.error('No authenticated user found!');
        return false;
      }

      set({ loading: true, error: null });

      const response = await apiService.post('/start-game', {
        theme_id: typeof theme.id === 'number' ? theme.id : parseInt(theme.id as string),
        level_id: typeof level.id === 'number' ? level.id : parseInt(level.id as string),
      });

      const data = response.data.data || response.data;

      const categories = (data.categories || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        used: cat.used ?? false,
      }));

      set({
        sessionId: data.session_token,
        user: auth.user,
        selectedTheme: theme,
        selectedLevel: level,
        questions: [],
        currentQuestion: null,
        currentOptions: [],
        conversation: [],
        conversationHistory: [],
        questionsAsked: 0,
        categories,
        categoriesCount: data.categories_count || level.categories_count,
        maxQuestions: data.categories_count || level.categories_count,
        timeLimit: data.time_per_attempt || level.time_per_attempt,
        timeRemaining: data.time_per_attempt || level.time_per_attempt,
        status: 'idle',
        gameStatus: 'category-selection',
        entity: null,
        score: 0,
        loading: false,
      });

      return true;
    } catch (error) {
      console.error('Error starting game:', error);
      set({ loading: false, error: 'Failed to start game' });
      return false;
    }
  },

  fetchQuestionsByCategory: async (categoryId: number | string) => {
    const { sessionId } = get();
    if (!sessionId) {
      console.error('No active session to fetch questions.');
      return [];
    }

    try {
      set({ loading: true });

      const response = await apiService.post('/fetch-questions', {
        session_token: sessionId,
        category_id: typeof categoryId === 'number' ? categoryId : parseInt(categoryId as string),
      });

      const q = response.data.questions;

      const questions: Question[] = [{
        id: q.question_id,
        text: q.text,
        hint: q.hint,
        options: q.options
      }];

      const selectedCategory = get().categories.find(c => c.id === categoryId) || null;

      const questionText = typeof q.text === 'string' ? q.text : (q.text?.en || q.text?.ar || '');

      set({
        questions,
        currentQuestion: questionText,
        currentOptions: q.options || [],
        selectedCategory,
        status: 'playing',
        gameStatus: 'questioning',
        loading: false,
      });

      return questions;
    } catch (error) {
      console.error('Error fetching category questions:', error);
      set({ loading: false, error: 'Failed to fetch questions' });
      return [];
    }
  },

  askQuestion: async (option: QuestionOption) => {
    const { sessionId } = get();
    if (!sessionId) return null;

    try {
      set({ loading: true });

      const response = await apiService.post('/ask-question', {
        session_token: sessionId,
        option_id: option.id,
      });

      const data = response.data;
      const answer = data.answer;
      const isYes = answer === 'yes' || answer === true;

      const optionText = typeof option.text === 'string' ? option.text : (option.text?.en || option.text?.ar || '');

      const newConversation = [
        ...get().conversation,
        {
          option,
          answer: isYes
        }
      ];

      const newConversationHistory = [
        ...get().conversationHistory,
        {
          id: `${Date.now()}-${option.id}`,
          question: optionText,
          answer: isYes ? 'yes' : 'no',
        }
      ];

      const updatedCategories = data.categories || get().categories;

      set({
        conversation: newConversation,
        conversationHistory: newConversationHistory,
        questionsAsked: get().questionsAsked + 1,
        categories: updatedCategories,
        questions: [],
        currentQuestion: null,
        currentOptions: [],
        selectedCategory: null,
        status: 'idle',
        gameStatus: 'category-selection',
        loading: false,
      });

      return isYes;
    } catch (error) {
      console.error('Error asking option:', error);
      set({ loading: false, error: 'Failed to ask question' });
      return null;
    }
  },

  verifyGuess: async (guess: string) => {
    const { sessionId } = get();
    if (!sessionId) {
      console.error('No active session to verify guess.');
      return null;
    }

    try {
      set({ loading: true });

      const response = await apiService.post('/verify-guess', {
        session_token: sessionId,
        guess_name: guess,
      });

      const data = response.data.data || response.data;

      if (data.entity) {
        set({
          entity: {
            name: data.entity.name,
            image_url: data.entity.image_url,
            attributes: data.entity.attributes || {},
          },
        });
      }

      const match = data.match === true || data.match === 'true';
      const message = data.message || '';
      const categoriesUsed = data.categories_used || 0;
      const entityName = data.entity_name || '';

      if (match) {
        set({
          status: 'won',
          gameStatus: 'ended',
          resultSummary: {
            type: 'win',
            message: `You used ${categoriesUsed} ${categoriesUsed > 1 ? 'categories' : 'category'} to guess correctly!`,
          },
          loading: false,
        });
      } else {
        set({
          status: 'lost',
          gameStatus: 'ended',
          resultSummary: {
            type: 'lose',
            message: `The correct answer was: ${entityName}`,
          },
          loading: false,
        });
      }

      return { correct: match, match, message, categoriesUsed, entityName };
    } catch (error) {
      console.error('Error verifying guess:', error);
      set({ loading: false, error: 'Failed to verify guess' });
      return null;
    }
  },

  fetchSuggestions: async (): Promise<string[]> => {
    const { sessionId, selectedTheme } = get();
    if (!sessionId || !selectedTheme) {
      console.warn('No active session or theme for suggestions.');
      return [];
    }

    try {
      const response = await apiService.post('/suggestions', {
        session_token: sessionId,
      });

      const raw = response.data.suggestions || response.data.data || [];

      return raw.map((item: any) => typeof item === 'string' ? item : item.name);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  },

  fetchThemes: async (): Promise<Theme[]> => {
    try {
      const response = await apiService.get('/themes');
      const rawData = response.data.data || response.data;

      return rawData.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        icon: item.icon,
        description: item.description || null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching themes:', error);
      return [];
    }
  },

  fetchLevels: async (): Promise<Level[]> => {
    try {
      const res = await apiService.get('/levels');
      const raw = Array.isArray(res.data) ? res.data : res.data.data;
      return raw as Level[];
    } catch (e) {
      console.error('Error fetching levels:', e);
      return [];
    }
  },

  startTimer: () => {
    get().stopTimer();
    timerInterval = setInterval(() => {
      const { timeRemaining } = get();
      if (timeRemaining > 0) {
        set({ timeRemaining: timeRemaining - 1 });
      } else {
        get().stopTimer();
        set({ status: 'lost' });
      }
    }, 1000);
  },

  stopTimer: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  },

  resetGame: () => {
    get().stopTimer();
    const auth = useAuthStore.getState();
    set({
      sessionId: null,
      user: auth.user,
      selectedTheme: null,
      selectedLevel: null,
      questions: [],
      conversation: [],
      conversationHistory: [],
      questionsAsked: 0,
      categories: [],
      selectedCategory: null,
      categoriesCount: 0,
      maxQuestions: 0,
      timeLimit: 0,
      timeRemaining: 0,
      status: 'idle',
      gameStatus: 'category-selection',
      entity: null,
      score: 0,
      resultSummary: null,
      loading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
