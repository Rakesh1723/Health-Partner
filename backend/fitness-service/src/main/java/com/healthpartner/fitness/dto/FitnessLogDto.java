package com.healthpartner.fitness.dto;

import com.healthpartner.fitness.model.ActivityType;
import com.healthpartner.fitness.model.Intensity;

import java.time.LocalDate;

public record FitnessLogDto(ActivityType workoutType, int duration, Intensity workoutIntensity, double caloriesBurned, String notes,
                            LocalDate createdAt, LocalDate updatedAt){
}
