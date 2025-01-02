package com.healthpartner.goal.dto;

import com.healthpartner.goal.model.GoalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class GoalLogDto {
    private int id;
    private int userId;
    private GoalType goalType;
    private String description;
    private int currentWeight;
    private int targetWeight;
    private LocalDate startDate;
    private LocalDate targetEndDate;
    private double progress;
    private String suggestion;
}
