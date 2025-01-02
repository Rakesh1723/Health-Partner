package com.healthpartner.diets.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DietLogDto {

    private String mealType;
    private List<String> foodItems;
    private double protein;
    private double carbs;
    private double fat;
    private double caloriesConsumed;
    private String notes;

    private LocalDate createdAt;
    private LocalDate updatedAt;

}
