export interface User {
  id: string;
  name: string;
  email: string;
  score?: number;
  level?: number;
}

export interface Theme {
  id: number | string;
  name: string | { en: string; ar: string };
  slug: string;
  icon?: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Level {
  id: number | string;
  name: string | { en: string; ar: string };
  slug: string;
  categories_count: number;
  time_per_attempt: number;
  description?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Category {
  id: number | string;
  name: string | { en: string; ar: string };
  slug: string;
  description?: string | null;
  used?: boolean;
}

export interface QuestionOption {
  id: number | string;
  text: string | { en: string; ar: string };
  category_id?: number | string;
}

export interface Question {
  id: number | string;
  text: string | { en: string; ar: string };
  hint?: string | null;
  options: QuestionOption[];
}

export interface ConversationItem {
  option: QuestionOption;
  answer: boolean;
}

export interface GameEntity {
  name: string;
  image_url?: string;
  attributes?: Record<string, any>;
}
