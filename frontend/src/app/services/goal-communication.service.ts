import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GoalType } from '../models/goal-log.model';

@Injectable({
  providedIn: 'root'
})
export class GoalCommunicationService {
  private goalTypeSubject = new Subject<GoalType | null>();
  goalType$ = this.goalTypeSubject.asObservable();

  setGoalType(type: GoalType) {
    this.goalTypeSubject.next(type);
  }

  unsetGoal() {
    this.goalTypeSubject.next(null);
  }
} 