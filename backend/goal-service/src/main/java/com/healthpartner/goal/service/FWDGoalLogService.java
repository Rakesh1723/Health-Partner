package com.healthpartner.goal.service;

import com.healthpartner.goal.model.FWDGoalLog;

public interface FWDGoalLogService {

    FWDGoalLog updateGoalLog(int userId, FWDGoalLog goalLog);
    FWDGoalLog getGoalLog(int userId);}
