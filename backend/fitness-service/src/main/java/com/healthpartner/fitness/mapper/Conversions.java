package com.healthpartner.fitness.mapper;

import com.healthpartner.fitness.dto.FitnessLogDto;
import com.healthpartner.fitness.model.FitnessLog;

public class Conversions {
    public static FitnessLog FitnessLogDtoToFitnessLog(FitnessLogDto fitnessLogDTO){
        return new FitnessLog(0,0
                   ,fitnessLogDTO.workoutType()
                   ,fitnessLogDTO.duration()
                   ,fitnessLogDTO.workoutIntensity()
                   ,fitnessLogDTO.caloriesBurned()
                   ,fitnessLogDTO.notes()
                   ,fitnessLogDTO.createdAt()
                   ,fitnessLogDTO.updatedAt()
                );
    }
    public static FitnessLogDto FitnessLogToFitnessLogDto(FitnessLog fitnessLog){
        return new FitnessLogDto(
                fitnessLog.getWorkoutType(),
                fitnessLog.getDuration(),
                fitnessLog.getWorkoutIntensity(),
                fitnessLog.getCaloriesBurned(),
                fitnessLog.getNotes(),
                fitnessLog.getCreatedAt(),
                fitnessLog.getUpdatedAt()
        );
    }
}
