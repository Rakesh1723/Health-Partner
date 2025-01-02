package com.healthpartner.diets.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class DietLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int logId;
    private int userId;
    private String mealType;
    private List<String> foodItems;
    private double protein;
    private double carbs;
    private double fat;
    private double caloriesConsumed;
    private String notes;

    @Column(name = "created_at")
    private LocalDate createdAt;
    @Column(name = "updated_at")
    private LocalDate updatedAt;

}
