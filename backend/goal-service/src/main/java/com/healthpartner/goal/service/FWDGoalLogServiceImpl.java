package com.healthpartner.goal.service;

import com.healthpartner.goal.exception.GoalLogNotFoundException;
import com.healthpartner.goal.exception.UserNotFoundException;
import com.healthpartner.goal.fiegn.UserFeignClient;
import com.healthpartner.goal.model.FWDGoalLog;
import com.healthpartner.goal.repository.FWDGoalLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
public class FWDGoalLogServiceImpl implements FWDGoalLogService{

    @Autowired
    private FWDGoalLogRepository repository;

    @Autowired
    UserFeignClient userFeignClient;

    @Override
    public FWDGoalLog updateGoalLog(int userId, FWDGoalLog goalLog) {

        if(!userFeignClient.getUserStatus(userId))
            throw new UserNotFoundException("Users with id "+userId+" not found");

        FWDGoalLog savedGoalLog = repository.findByUserId(userId).orElse(null);
        if (savedGoalLog == null){
            goalLog.setUserId(userId);
            return (repository.save(goalLog));
        }

        double caloriesConsumed = goalLog.getTargetCaloriesConsumed();
        double caloriesBurned = goalLog.getTargetCaloriesBurned();
        double proteinConsumption = goalLog.getTargetProteinConsumption();
        double carbsConsumption = goalLog.getTargetCarbsConsumption();
        double fatConsumption = goalLog.getTargetFatConsumption();
        LocalTime sleepDuration = goalLog.getTargetSleepDuration();
        double hydration = goalLog.getTargetHydration();

        if(caloriesConsumed == -1){ //Reset the field for -1
            savedGoalLog.setTargetCaloriesConsumed(0);
        }
        else if (caloriesConsumed != 0) // updates only if the value is updated from the frontend
            savedGoalLog.setTargetCaloriesConsumed(caloriesConsumed);

        if (caloriesBurned == -1)
            savedGoalLog.setTargetCaloriesBurned(0);
        else if (caloriesBurned != 0)
            savedGoalLog.setTargetCaloriesBurned(caloriesBurned);

        // Protein Consumption
        if (proteinConsumption == -1) {
            savedGoalLog.setTargetProteinConsumption(0);
        } else if (proteinConsumption != 0) {
            savedGoalLog.setTargetProteinConsumption(proteinConsumption);
        }

// Carbs Consumption
        if (carbsConsumption == -1) {
            savedGoalLog.setTargetCarbsConsumption(0);
        } else if (carbsConsumption != 0) {
            savedGoalLog.setTargetCarbsConsumption(carbsConsumption);
        }

// Fat Consumption
        if (fatConsumption == -1) {
            savedGoalLog.setTargetFatConsumption(0);
        } else if (fatConsumption != 0) {
            savedGoalLog.setTargetFatConsumption(fatConsumption);
        }

// Sleep Duration
        if (sleepDuration == null) {
            savedGoalLog.setTargetSleepDuration(LocalTime.of(0,0)); // Assuming a zero time object
        } else if(!sleepDuration.equals(LocalTime.of(0,0))){
            savedGoalLog.setTargetSleepDuration(sleepDuration);
        }

// Hydration
        if (hydration == -1) {
            savedGoalLog.setTargetHydration(0);
        } else if (hydration != 0) {
            savedGoalLog.setTargetHydration(hydration);
        }

        return repository.save(savedGoalLog);
    }

    @Override
    public FWDGoalLog getGoalLog(int userId) {

        if(!userFeignClient.getUserStatus(userId))
            throw new UserNotFoundException("Users with id "+userId+" not found");

        return repository.findByUserId(userId).orElseThrow(()-> new GoalLogNotFoundException("Set up and FWDGoal to proceed with this feature"));
    }
}
