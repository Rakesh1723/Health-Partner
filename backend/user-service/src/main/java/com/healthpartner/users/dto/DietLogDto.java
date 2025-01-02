package com.healthpartner.users.dto;

import java.time.LocalDate;
import java.util.List;

public record DietLogDto(
        int logId,
        int userId,
        String mealType,
        List<String> foodItems,
        double protein,
        double carbs,
        double fat,
        double caloriesConsumed,
        String notes,
        LocalDate createdAt,
        LocalDate updatedAt
) {
}
