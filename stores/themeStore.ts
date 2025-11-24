import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Colors, ThemeMode } from '../constants/colors';

interface ThemeState {
  mode: ThemeMode;
  colors: typeof Colors.light;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  loadTheme: () => Promise<void>;
  toggleSound: () => void;
  toggleAnimations: () => void;
  playSound: (type: 'click' | 'correct' | 'wrong' | 'win' | 'lose') => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  colors: Colors.dark,
  soundEnabled: true,
  animationsEnabled: true,

  toggleTheme: async () => {
    const newMode = get().mode === 'dark' ? 'light' : 'dark';
    set({
      mode: newMode,
      colors: newMode === 'dark' ? Colors.dark : Colors.light
    });
    await AsyncStorage.setItem('themeMode', newMode);
  },

  setTheme: async (mode: ThemeMode) => {
    set({
      mode,
      colors: mode === 'dark' ? Colors.dark : Colors.light
    });
    await AsyncStorage.setItem('themeMode', mode);
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      const savedSound = await AsyncStorage.getItem('soundEnabled');
      const savedAnimations = await AsyncStorage.getItem('animationsEnabled');

      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({
          mode: savedTheme,
          colors: savedTheme === 'dark' ? Colors.dark : Colors.light
        });
      }

      if (savedSound !== null) {
        set({ soundEnabled: savedSound === 'true' });
      }

      if (savedAnimations !== null) {
        set({ animationsEnabled: savedAnimations === 'true' });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },

  toggleSound: async () => {
    const newValue = !get().soundEnabled;
    set({ soundEnabled: newValue });
    await AsyncStorage.setItem('soundEnabled', newValue.toString());
  },

  toggleAnimations: async () => {
    const newValue = !get().animationsEnabled;
    set({ animationsEnabled: newValue });
    await AsyncStorage.setItem('animationsEnabled', newValue.toString());
  },

  playSound: (type: 'click' | 'correct' | 'wrong' | 'win' | 'lose') => {
    if (!get().soundEnabled) return;
  },
}));
