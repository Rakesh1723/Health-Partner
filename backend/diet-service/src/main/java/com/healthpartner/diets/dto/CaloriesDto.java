package com.healthpartner.diets.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CaloriesDto {
    private int number;
    private double totalCaloriesConsumed;
}
