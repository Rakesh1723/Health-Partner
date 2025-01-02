export enum ActivityType {
    GENERAL = 'GENERAL',
    RUNNING = 'RUNNING',
    WALKING = 'WALKING',
    CYCLING = 'CYCLING',
    SWIMMING = 'SWIMMING',
    BASKETBALL = 'BASKETBALL',
    FOOTBALL = 'FOOTBALL',
    BADMINTON = 'BADMINTON',
    SKIPPING = 'SKIPPING',
    CRICKET = 'CRICKET',
    WEIGHTLIFTING = 'WEIGHTLIFTING'
}

export enum Intensity {
    LOW = 'LOW',
    MODERATE = 'MODERATE',
    HIGH = 'HIGH'
}

export interface FitnessLog {
    logId: number;
    userId: number;
    workoutType: ActivityType;
    duration: number;
    workoutIntensity: Intensity;
    caloriesBurned: number;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface FitnessLogDTO {
    userId: number;
    workoutType: ActivityType;
    duration: number;
    workoutIntensity: Intensity;
    caloriesBurned: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
} 