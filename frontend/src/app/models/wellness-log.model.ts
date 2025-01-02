export enum Mood {
    HAPPY = 'HAPPY',
    SAD = 'SAD',
    ANXIOUS = 'ANXIOUS',
    CALM = 'CALM',
    STRESSED = 'STRESSED',
    ENERGETIC = 'ENERGETIC',
    TIRED = 'TIRED'
}

export interface WellnessLog {
    logId: number;
    userId: number;
    mood: Mood;
    triggers: string[];
    sleepDuration: number;
    hydration: number;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface WellnessLogDTO {
    mood: Mood;
    triggers: string[];
    sleepDuration: number;
    hydration: number;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
} 