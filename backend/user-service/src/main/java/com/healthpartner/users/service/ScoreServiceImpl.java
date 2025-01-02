package com.healthpartner.users.service;

import com.healthpartner.users.dto.UserDto;
import com.healthpartner.users.dto.UserNameScoreDto;
import com.healthpartner.users.exceptions.UserNotFoundException;
import com.healthpartner.users.feign.DietFeignClient;
import com.healthpartner.users.feign.FitnessFeignClient;
import com.healthpartner.users.feign.WellnessFeignClient;
import com.healthpartner.users.model.Score;
import com.healthpartner.users.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ScoreServiceImpl implements ScoreService{

    @Autowired
    private ScoreRepository scoreRepo;

    @Autowired
    private UserService userService;

    @Autowired
    FitnessFeignClient fitnessFeignClient;

    @Autowired
    DietFeignClient dietFeignClient;

    @Autowired
    WellnessFeignClient wellnessFeignClient;

    private double fitnessScoreCal(int userId, Double caloriesBurned, Double maxCaloriesBurned){
        if (caloriesBurned == null || maxCaloriesBurned == null)
            return 0;       //fitnessScore Not present

        UserDto userDto = userService.getUserByEmail(userId);   //fetch the user
        double bmi = UserServiceImpl.bmiIndexGenerator(userDto.getHeight(),userDto.getWeight());
        double bmiScore;
        if(bmi<18.5){
            bmiScore = (1-(18.5-bmi)/18.5)*100;
        } else if (bmi>24.9) {
            bmiScore = (1-(bmi-24.9)/24.9)*100;
        }
        else
            bmiScore = 100;
        double calorieScore = (caloriesBurned/maxCaloriesBurned)*100;
        return (bmiScore + calorieScore)/2;
    }

    private double wellnessScoreCal(Double sleepDuration, Double hydration){
        if (hydration == null || sleepDuration == null)
            return 0;

        double sleepScore;
        double hydrationScore;
        if(sleepDuration > 8) //8hrs
            sleepScore = 100;
        else
            sleepScore = sleepDuration/8;
        if (hydration > 4) //4L
            hydrationScore = 100;
        else
            hydrationScore = hydration/4;
        return (sleepScore + hydrationScore)*50;
    }

    @Override
    public Score createScore(int userId, LocalDate day){
        if(userService.getUserStatus(userId)){

            ResponseEntity<Double> response = fitnessFeignClient.getUserCaloriesForDay(userId, day);
            Double caloriesBurned = response.getBody();
            response = fitnessFeignClient.getMaxCaloriesForDay(day);
            Double maxCaloriesBurned = response.getBody();

            Score savedScore = scoreRepo.findScoreByUserIdAndDay(userId,day);
            Score score;
            if(savedScore == null){
                score = new Score();
                score.setUserId(userId);
                score.setDay(day);
            }
            else {
                score = savedScore;
            }
            double fitnessScore = fitnessScoreCal(userId, caloriesBurned, maxCaloriesBurned);
            score.setFitnessScore(fitnessScore);

            response = dietFeignClient.getUserCaloriesConsumedForDay(userId,day);
            Double caloriesConsumed = response.getBody();
            response = dietFeignClient.getMaxCalorieConsumptionForDay(day);
            Double maxCalorieConsumption = response.getBody();

            double dietScore;
            if (caloriesConsumed == null || maxCalorieConsumption == null)
                dietScore = 0;
            else{
                dietScore = (caloriesConsumed/maxCalorieConsumption)*100;
            }
            score.setDietScore(dietScore);

            response = wellnessFeignClient.getHydrationForDay(userId,day);
            Double hydration = response.getBody();
            response = wellnessFeignClient.getSleepDurationForDay(userId,day);
            Double sleepDuration = response.getBody();


            double wellnessScore = wellnessScoreCal(sleepDuration,hydration); //5 and 8 are the ideal values for hydration and sleep
            score.setWellnessScore(wellnessScore);

            double overallScore = (fitnessScore + wellnessScore + dietScore)/3;
            score.setOverallScore(overallScore);

            return scoreRepo.save(score);

        }
        else {
            throw new UserNotFoundException("User with id "+userId+" not found");
        }

    }

    @Override
    public List<Score> getAllScore() {
        return scoreRepo.findAll();
    }

    @Override
    public List<UserNameScoreDto> getUserNameAndScoreForDay(LocalDate day) {

        List<UserDto> listOfActiveUsers = userService.getAllUsers();

        //Make sure score is calculated for all the active users
        listOfActiveUsers.stream().filter(user -> scoreRepo.findScoreByUserIdAndDay(user.getUserId(), day)==null)
                .forEach(user ->  createScore(user.getUserId(), day));

        List<Object[]> userIdScoreList = scoreRepo.findUserIdsAndOverallScoresByDaySorted(day);

        // Only returns the scores of active users with score greater than 0;
        return userIdScoreList.stream().filter(obj -> userService.getUserStatus((Integer) obj[0]) && (Double) obj[1] >0)
                .map(objects -> new UserNameScoreDto(
                        (Integer) objects[0], userService.getUserNameByUserId((int) objects[0]), (Double) objects[1]
                )).toList();
    }

    @Override
    public List<UserNameScoreDto> getAllTimeUserNameAndScore(LocalDate day) {

        List<UserDto> listOfActiveUsers = userService.getAllUsers();

        listOfActiveUsers.stream().filter(user -> scoreRepo.findScoreByUserIdAndDay(user.getUserId(), day)==null)
                .forEach(user ->  createScore(user.getUserId(), day));

        List<Object[]> userIdAverageScoreList = scoreRepo.findUserIdsAndAverageScoresSorted();

        // Only returns the scores of active users with score greater than 0;
        return userIdAverageScoreList.stream().filter(obj -> userService.getUserStatus((Integer) obj[0]) && (Double) obj[1] >0)
                .map(objects -> new UserNameScoreDto(
                        (Integer) objects[0], userService.getUserNameByUserId((int) objects[0]), (Double) objects[1]
                )).toList();

    }
}
