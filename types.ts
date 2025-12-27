export enum UserGoal {
  LOSE_FAT = 'Perder Gordura',
  GAIN_MUSCLE = 'Ganhar Massa',
  MAINTAIN = 'Manter o Físico',
  HYPERTROPHY = 'Hipertrofia'
}

export enum TrainingLevel {
  BEGINNER = 'Iniciante',
  ADVANCED = 'Avançado'
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  level?: TrainingLevel;
  goal?: UserGoal;
  onboarded: boolean;
  isAdmin?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  timestamp: number;
  groundingMetadata?: any; // Stores Google Search sources
}

export interface ChatSession {
  id: string;
  userId: string;
  type: 'trainer' | 'nutritionist';
  timestamp: number;
  lastMessage: string;
  messages: ChatMessage[];
}

export enum AppRoute {
  LOGIN = '/login',
  REGISTER = '/register',
  ONBOARDING = '/onboarding',
  DASHBOARD = '/',
  TRAINER = '/trainer',
  NUTRITIONIST = '/nutritionist',
  BODY_SCAN = '/body-scan',
  FOOD_SCAN = '/food-scan',
  ADMIN = '/admin'
}