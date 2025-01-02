package com.healthpartner.users.service;

import com.healthpartner.users.dto.*;
import com.healthpartner.users.exceptions.UserNotFoundException;
import com.healthpartner.users.feign.DietFeignClient;
import com.healthpartner.users.feign.FitnessFeignClient;
import com.healthpartner.users.feign.GoalFeignClient;
import com.healthpartner.users.feign.WellnessFeignClient;
import com.healthpartner.users.mapper.Conversions;
import com.healthpartner.users.model.State;
import com.healthpartner.users.model.Users;
import com.healthpartner.users.repository.UserRepository;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class UserDashboardServiceImpl implements UserDashboardService{

    @Autowired
    UserRepository userRepo;

    @Autowired
    FitnessFeignClient fitnessFeignClient;

    @Autowired
    DietFeignClient dietFeignClient;

    @Autowired
    WellnessFeignClient wellnessFeignClient;

    @Autowired
    GoalFeignClient goalFeignClient;

    @Override
    public UserDetailsDto getUserDetailsByUserId(int userId) {
        Users user = userRepo.findPartnerById(userId).orElseThrow(()->new UserNotFoundException("Users with id "+userId+" not found"));
        UserDetailsDto userDetails= Conversions.UsersToUserDetails(user);
        userDetails.setFitnessLogs(getAllFitnessLogsByUserId(userId));
        userDetails.setDietLogs(getAllDietLogsByUserId(userId));
        userDetails.setWellnessLogs(getAllWellnessLogsByUserId(userId));
        return userDetails;
    }

    @Override
    public List<FitnessLogDto> getAllFitnessLogsByUserId(int userId) {

        if(userRepo.existsByUserIdAndState(userId, State.ACTIVE)) {
            return fitnessFeignClient.getAllFitnessLogsByUserId(userId);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");

    }

    @Override
    public List<DietLogDto> getAllDietLogsByUserId(int userId) {
        if(userRepo.existsByUserIdAndState(userId,State.ACTIVE))
            return dietFeignClient.getAllDietLogsByUserId(userId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public List<WellnessLogDto> getAllWellnessLogsByUserId(int userId) {
        if(userRepo.existsByUserIdAndState(userId,State.ACTIVE))
            return wellnessFeignClient.getAllWellnessLogsByUserId(userId);
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public GoalLogDto getAllGoalLogsByUserId(int userId,LocalDate currentDate) {
        if(userRepo.existsByUserIdAndState(userId,State.ACTIVE)) {
            GoalLogDto goals=goalFeignClient.getAllGoalLogsByUserId(userId);
           return  updateGoal(userId,goals,currentDate);
        }
        else
            throw new UserNotFoundException("Users with id "+userId+" not found");
    }

    @Override
    public List<UserDetailsDto> getUserDetails() {
        return userRepo.findAllPartners().stream().map(i->getUserDetailsByUserId(i.getUserId())).toList();
    }

    public GoalLogDto updateGoal(int userId,GoalLogDto goal,LocalDate currentDate) {

        LocalDate goalStartDate = goal.getStartDate();
        LocalDate goalEndDate = goal.getTargetEndDate() ;

        if (currentDate.isBefore(goalStartDate)) {
            currentDate = goalStartDate;
        }

        List<FitnessLogDto> fitnessLogs = getAllFitnessLogsByUserId(userId);
        LocalDate finalCurrentDate = currentDate;

        double totalCaloriesBurned = fitnessLogs.stream()
                .filter(log->{
                    LocalDate logDate = log.createdAt();
                    return !logDate.isBefore(goalStartDate) && !logDate.isAfter(finalCurrentDate);
                }).mapToDouble(FitnessLogDto::caloriesBurned).sum();

        List<DietLogDto> dietLogs = dietFeignClient.getAllDietLogsByUserId(userId);

        double totalCaloriesConsumed = dietLogs.stream().filter(log->{
            LocalDate logDate = log.createdAt();
            return !logDate.isBefore(goalStartDate) && !logDate.isAfter(finalCurrentDate);
        }).mapToDouble(DietLogDto::caloriesConsumed).sum();

        double weightChangeInKg = (totalCaloriesConsumed - totalCaloriesBurned) / 7700;
        double startingWeight = goal.getCurrentWeight();
        double currentWeight=startingWeight + weightChangeInKg;
        double progress = 0;

        if (goal.getGoalType() == GoalType.WEIGHT_LOSS) {
            progress = (goal.getCurrentWeight() - currentWeight) / (goal.getCurrentWeight() - goal.getTargetWeight()) * 100;
        }
        else if (goal.getGoalType() == GoalType.WEIGHT_GAIN) {
            progress = (currentWeight - goal.getCurrentWeight()) / (goal.getTargetWeight() - goal.getCurrentWeight()) * 100;
        }

        if (progress < 0) {
            progress = 0;
        } else if (progress > 100) {
            progress = 100;
        }

        String progressMessage = getProgressMessage(progress,goal);
        goal.setProgress(progress);
        goal.setSuggestion(progressMessage);
        return goal;
    }

    private String getProgressMessage(double progress, GoalLogDto goalLog) {
        if (progress < 30) {
            return "Mild progress, you need to try harder to achieve your goal within time.";
        } else if (progress >= 30 && progress < 60) {
            return "You are making progress, keep going!";
        } else if (progress >= 60 && progress < 90) {
            return "You're on track, keep pushing!";
        } else if (progress >= 90 && progress < 100) {
            return "Almost there! Just a little more effort!";
        } else {
            return "Goal achieved! Well done!";
        }
    }

}
