package com.healthpartner.users.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;

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
