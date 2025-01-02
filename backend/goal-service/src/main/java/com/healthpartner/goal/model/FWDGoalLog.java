package com.healthpartner.goal.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class FWDGoalLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int userId;
    private double targetCaloriesBurned;
    private double targetCaloriesConsumed;
    private double targetProteinConsumption;
    private double targetCarbsConsumption;
    private double targetFatConsumption;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime targetSleepDuration;
    private double targetHydration;
}
