package com.healthpartner.wellness.dto;

import com.healthpartner.wellness.model.Mood;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WellnessLogDto {

    private Mood mood;
    private List<String> triggers;
    private int sleepDuration;
    private double hydration;
    private String notes;

    private LocalDate createdAt;
    private LocalDate updatedAt;
}
