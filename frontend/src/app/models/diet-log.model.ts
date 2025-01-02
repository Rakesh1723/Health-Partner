export enum MealType {
    BREAKFAST = 'BREAKFAST',
    LUNCH = 'LUNCH',
    DINNER = 'DINNER',
    SNACK = 'SNACK'
}

export interface DietLog {
    logId: number;
    userId: number;
    mealType: MealType;
    foodItems: string[];
    protein: number;
    carbs: number;
    fat: number;
    caloriesConsumed: number;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DietLogDTO {
    mealType: MealType;
    foodItems: string[];
    protein: number;
    carbs: number;
    fat: number;
    caloriesConsumed: number;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
} 