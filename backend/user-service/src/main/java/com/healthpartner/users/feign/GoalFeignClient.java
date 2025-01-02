package com.healthpartner.users.feign;

import com.healthpartner.users.dto.GoalLogDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient("GOAL-SERVICE")
public interface GoalFeignClient {
    
    @GetMapping("/api/v1/goalLogs/{userId}/Goal-logs")
    GoalLogDto getAllGoalLogsByUserId(@PathVariable("userId") int userId);

    @DeleteMapping("/api/v1/goalLogs/{userId}/delete-logs")
    void deleteAllGoalLogsByUserId(@PathVariable("userId") int userId);
}
