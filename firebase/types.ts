export type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  isOnboarded: boolean;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  fcmToken: string;
  createdAt: any;
  updatedAt: any;
};

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: any;
  image?: string; // Base64 data for user uploads
  isSaved?: boolean; // For Astrology readings
}

export type AIConversation = {
  id: string;
  createdAt: any;
  updatedAt: any;
  messages: Message[];
  userId: string;
  conversationType: string;
};

export interface GeminiConfig {
  model: string;
  systemInstruction: string;
  temperature?: number;
}

export interface GeminiConfigData {
  title: string;
  description: string;
  systemPrompt: string;
  examples: string[];
}
export type GeminiConfigDB = {
  config: GeminiConfigData[];
};
