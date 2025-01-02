import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GoalLog } from '../models/goal-log.model';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private apiUrl = 'http://localhost:9000/api/v1/goalLogs';
  private goalUrl = 'http://localhost:9000/api/v1/users/dashboard';

  constructor(private http: HttpClient) {}

  getGoalLogs(userId: number): Observable<GoalLog> {
    const currentDate = formatDate(new Date(), 'dd-MM-yyyy', 'en-US');
    return this.http.get<GoalLog>(`${this.goalUrl}/GoalLogs/${userId}?currentDate=${currentDate}`);
  }

  updateGoalLog(goalLog: GoalLog, userId: number): Observable<GoalLog> {
    return this.http.put<GoalLog>(`${this.apiUrl}/users/${userId}/Goal-logs`, goalLog);
  }

  unsetGoal(userId: number): Observable<void> {
    return this.getGoalLogs(userId).pipe(
      switchMap(goal => {
        if (goal && goal.id) {
          return this.http.delete<void>(`${this.apiUrl}/users/${userId}/Goal-logs/${goal.id}`);
        }
        return EMPTY;
      })
    );
  }
} 