package com.healthpartner.users.service;

import com.healthpartner.users.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface UserDashboardService {
    UserDetailsDto getUserDetailsByUserId(int userId);
    List<FitnessLogDto> getAllFitnessLogsByUserId(int userId);
    List<DietLogDto> getAllDietLogsByUserId(int userId);
    List<WellnessLogDto> getAllWellnessLogsByUserId(int userId);
    GoalLogDto getAllGoalLogsByUserId(int userId, LocalDate currentDate);
    List<UserDetailsDto> getUserDetails();

}
