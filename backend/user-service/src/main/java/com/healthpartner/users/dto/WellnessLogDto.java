package com.healthpartner.users.dto;

import java.time.LocalDate;
import java.util.List;

public record WellnessLogDto(
        int logId,
        int userId,
        Mood mood,
        List<String> triggers,
        int sleepDuration,
        double hydration,
        String notes,
        LocalDate createdAt,
        LocalDate updatedAt
) {
}
