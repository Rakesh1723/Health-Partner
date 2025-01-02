package com.healthpartner.users.dto;

import java.time.LocalDate;

public record FitnessLogDto(int logId, int userId, String workoutType, int duration, String workoutIntensity, double caloriesBurned, String notes,
                            LocalDate createdAt, LocalDate updatedAt
) {
}

