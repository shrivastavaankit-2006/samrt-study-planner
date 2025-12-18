// User type from Firebase Auth
export interface User {
    uid: string;
    name: string | null;
    email: string | null;
    photoURL: string | null;
}

// Study Plan types
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Subject {
    name: string;
    difficulty: DifficultyLevel;
    examDate?: string;
    dailyHours?: number;
}

export interface StudyPlanInput {
    subjects: Subject[];
    examDate: string;
    dailyHours: number;
}

export interface StudyPlan {
    id?: string;
    userId: string;
    subjects: Subject[];
    examDate: string;
    dailyHours: number;
    aiPlan: string;
    createdAt: Date;
}

// Auth context types
export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

// API response types
export interface GeneratePlanResponse {
    success: boolean;
    plan?: string;
    error?: string;
}
