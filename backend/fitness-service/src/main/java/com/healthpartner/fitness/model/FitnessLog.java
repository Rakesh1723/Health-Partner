package com.healthpartner.fitness.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class FitnessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int logId;
    private int userId;
    @Enumerated(EnumType.STRING)
    private ActivityType workoutType;
    private int duration;
    @Enumerated(EnumType.STRING)
    private Intensity workoutIntensity;
    private double caloriesBurned;
    private String notes;


    @Column(name = "created_at")
    private LocalDate createdAt;
    @Column(name = "updated_at")
    private LocalDate updatedAt;

}
