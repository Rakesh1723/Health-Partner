package com.healthpartner.goal.repository;

import com.healthpartner.goal.model.FWDGoalLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FWDGoalLogRepository extends JpaRepository<FWDGoalLog,Integer> {

    Optional<FWDGoalLog> findByUserId(int userId);
}
