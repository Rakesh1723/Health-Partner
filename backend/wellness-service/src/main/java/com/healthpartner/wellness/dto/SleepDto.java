package com.healthpartner.wellness.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SleepDto {
    private int number;
    private double sleepDuration;
}
