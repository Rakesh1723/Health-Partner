package com.healthpartner.diets.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MicroDto {

    private int number;
    private double totalCalories;
    private double totalProteins;
    private double totalCarbs;
    private double totalFats;

}
