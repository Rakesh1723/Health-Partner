package com.healthpartner.wellness.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class WellnessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int logId;
    private int userId;
    @Enumerated(EnumType.STRING)
    private Mood mood;
    private List<String> triggers;
    private int sleepDuration;
    private double hydration;
    private String notes;

    @Column(name = "created_at")
    private LocalDate createdAt;
    @Column(name = "updated_at")
    private LocalDate updatedAt;

}
