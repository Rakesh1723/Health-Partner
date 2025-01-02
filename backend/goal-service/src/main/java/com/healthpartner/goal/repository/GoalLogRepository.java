package com.healthpartner.goal.repository;

import com.healthpartner.goal.model.GoalLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface GoalLogRepository extends JpaRepository<GoalLog,Integer> {

    Optional<GoalLog> findByUserId(int userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM GoalLog g WHERE g.userId = :userId")
    void deleteAllByUserId(@Param("userId") int userId);
}
