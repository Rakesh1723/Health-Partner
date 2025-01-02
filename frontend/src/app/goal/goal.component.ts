import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalService } from '../services/goal.service';
import { GoalLog, GoalType } from '../models/goal-log.model';
import { GoalCommunicationService } from '../services/goal-communication.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [GoalService]
})
export class GoalComponent implements OnInit, OnDestroy {
  currentGoal: GoalLog | null = null;
  private subscription: Subscription;

  constructor(
    private goalService: GoalService,
    private goalCommunicationService: GoalCommunicationService,
    private http: HttpClient
  ) {
    this.subscription = this.goalCommunicationService.goalType$.subscribe(
      (goalType: GoalType | null) => {
        if (goalType === null && this.currentGoal?.id) {
          this.goalService.unsetGoal(1).subscribe({
            next: () => {
              this.currentGoal = null;
          
            },
            error: (error: Error) => console.error('Error unsetting goal:', error)
          });
        } else if (goalType) {
          this.loadGoals();
        }
      }
    );
  }

  ngOnInit() {
    this.loadGoals();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async getUserId(): Promise<number> {
    try {
      const token = sessionStorage.getItem('hp-token');
      if (!token) {
        throw new Error('No token found');
      }

      // Get email from token
      const userEmail = await firstValueFrom(
        this.http.get(`http://localhost:9000/jwtToken/${token}`, { 
          responseType: 'text'
        })
      );

      if (!userEmail) {
        throw new Error('No email found');
      }

      // Get userId using email - expect direct number response
      const userId = await firstValueFrom(
        this.http.get<number>(`http://localhost:9000/api/v1/users/userId/${userEmail}`)
      );

      if (userId === undefined || userId === null) {
        throw new Error('No user ID found');
      }

      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 1; // Fallback to default user ID
    }
  }

  async loadGoals() {
    try {
      const userId = await this.getUserId();
      this.goalService.getGoalLogs(userId).subscribe({
        next: (goal: GoalLog) => {
          this.currentGoal = goal;
        },
        error: (error: Error) => console.error('Error loading goal:', error)
      });
    } catch (error) {
      console.error('Error in loadGoals:', error);
    }
  }

  getProgressColor(progress: number): string {
    if (progress < 33) return '#ff4444'; 
    if (progress < 66) return '#ffa000'; 
    return '#00C851'; 
  }

  getRoundedProgress(progress: number): number {
    return Math.round(progress);
  }
}
