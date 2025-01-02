import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CaloriesAnalysisChartComponent } from './calories-analysis-chart/calories-analysis-chart.component';
import { SleepAnalysisChartComponent } from './sleep-analysis-chart/sleep-analysis-chart.component';
import { MacronutrientsChartComponent } from './macronutrients-chart/macronutrients-chart.component';
import { GoalComponent } from '../goal/goal.component';
import { HttpClient } from '@angular/common/http';
import { GoalCommunicationService } from '../services/goal-communication.service';
import { GoalType } from '../models/goal-log.model';
import { GoalEditModalComponent } from '../shared/goal-edit-modal/goal-edit-modal.component';
import { GoalLog } from '../models/goal-log.model';
import { GoalService } from '../services/goal.service';
import { UserDto } from '../models/user.dto';
import { firstValueFrom } from 'rxjs';

const API_URL = 'http://localhost:9000/api/v1/wellnessLogs';
const API_URL_FITNESS = 'http://localhost:9000/api/v1/fitnessLogs';
const API_URL_DIET = 'http://localhost:9000/api/v1/dietLogs';
const API_URL_FWD = 'http://localhost:9000/api/v1/goalLogs';

interface FitnessLog {
  duration: number;
  caloriesBurned: number;
}

interface DietLog {
  caloriesConsumed: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NavBarComponent,
    RouterModule,
    FormsModule,
    CaloriesAnalysisChartComponent,
    SleepAnalysisChartComponent,
    MacronutrientsChartComponent,
    GoalComponent,
    GoalEditModalComponent,
  ],
})
export class DashboardComponent implements OnInit {
  @ViewChild(GoalComponent) goalComponent!: GoalComponent;

  currentDate = new Date();

  selectedPeriod = 'week';
  viewType: 'total' | 'average' = 'total';

  macrosPeriod = 'week';
  macrosViewType: 'total' | 'average' = 'total';

  sleepPeriod = 'week';
  sleepViewType: 'total' | 'average' = 'total';

  showGoalDropdown = false;
  showGoalModal = false;

  avgSleepHours: number = 0;
  avgWaterIntake: number = 0;
  sleepTrend: { value: number; isPositive: boolean } = {
    value: 0,
    isPositive: true,
  };
  waterTrend: { value: number; isPositive: boolean } = {
    value: 0,
    isPositive: true,
  };

  totalCaloriesConsumed: number = 0;
  totalCaloriesBurned: number = 0;
  avgWorkoutDuration: number = 0;
  caloriesTrend: { value: number; isPositive: boolean } = {
    value: 0,
    isPositive: true,
  };
  workoutTrend: { value: number; isPositive: boolean } = {
    value: 0,
    isPositive: true,
  };

  selectedGoalType: GoalType | null = null;
  currentGoal: GoalLog | null = null;

  userName: string = '';

  constructor(
    private goalCommunicationService: GoalCommunicationService,
    private http: HttpClient,
    private goalService: GoalService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.calculateAverageSleep();
    this.calculateAverageWaterIntake();
    this.calculateCaloriesAndWorkout();
  }

  private async getUserId(): Promise<number> {
    try {
      const token = sessionStorage.getItem('hp-token');
      if (!token) {
        throw new Error('No token found');
      }

      const userEmail = await firstValueFrom(
        this.http.get(`http://localhost:9000/jwtToken/${token}`, { 
          responseType: 'text'
        })
      );

      if (!userEmail) {
        throw new Error('No email found');
      }

      const userId = await firstValueFrom(
        this.http.get<number>(`http://localhost:9000/api/v1/users/userId/${userEmail}`)
      );

      if (userId === undefined || userId === null) {
        throw new Error('No user ID found');
      }

      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 1;
    }
  }

  async loadUserData() {
    try {
      const userId = await this.getUserId();
      this.http
        .get<UserDto>(`http://localhost:9000/api/v1/users/${userId}`)
        .subscribe({
          next: (response) => {
            this.userName = `${response.userName} ${response.surName}`.trim();
          },
          error: (error) => {
            console.error('Error loading user data:', error);
            this.userName = 'User';
          },
        });
    } catch (error) {
      console.error('Error in loadUserData:', error);
      this.userName = 'User';
    }
  }

  async calculateAverageSleep() {
    try {
      const userId = await this.getUserId();
      const now = new Date();
      const startDate = new Date();
      const currentDay = now.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      startDate.setDate(now.getDate() + diff);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      this.http
        .get<any[]>(
          `${API_URL}/search/WellnessLogs/${userId}/?startDate=${this.formatDate(
            startDate
          )}&endDate=${this.formatDate(endDate)}`
        )
        .subscribe({
          next: (logs) => {
            const currentWeekTotal = logs.reduce(
              (sum, log) => sum + log.sleepDuration,
              0
            );
            const daysElapsed = Math.min(
              Math.floor(
                (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
              ) + 1,
              7
            );
            this.avgSleepHours = Math.round(currentWeekTotal / daysElapsed);

            const previousWeekEnd = new Date(startDate);
            previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
            const previousWeekStart = new Date(previousWeekEnd);
            previousWeekStart.setDate(previousWeekEnd.getDate() - 6);

            this.http
              .get<any[]>(
                `${API_URL}/search/WellnessLogs/${userId}/?startDate=${this.formatDate(
                  previousWeekStart
                )}&endDate=${this.formatDate(previousWeekEnd)}`
              )
              .subscribe({
                next: (previousLogs) => {
                  const previousWeekTotal = previousLogs.reduce(
                    (sum, log) => sum + log.sleepDuration,
                    0
                  );
                  const previousWeekAvg = previousWeekTotal / 7;

                  if (previousWeekAvg === 0 || isNaN(previousWeekAvg)) {
                    this.sleepTrend = {
                      value: 0,
                      isPositive: true,
                    };
                    return;
                  }

                  const trendValue =
                    ((this.avgSleepHours - previousWeekAvg) / previousWeekAvg) *
                    100;
                  this.sleepTrend = {
                    value: Math.abs(Math.round(trendValue)),
                    isPositive: trendValue >= 0,
                  };
                },
              });
          },
        });
    } catch (error) {
      console.error('Error in calculateAverageSleep:', error);
    }
  }

  async calculateAverageWaterIntake() {
    try {
      const userId = await this.getUserId();
      const now = new Date();
      const startDate = new Date();
      const currentDay = now.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      startDate.setDate(now.getDate() + diff);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      this.http
        .get<any[]>(
          `${API_URL}/search/WellnessLogs/${userId}/?startDate=${this.formatDate(
            startDate
          )}&endDate=${this.formatDate(endDate)}`
        )
        .subscribe({
          next: (logs) => {
            const currentWeekTotal = logs.reduce(
              (sum, log) => sum + log.hydration,
              0
            );
            const daysElapsed = Math.min(
              Math.floor(
                (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
              ) + 1,
              7
            );
            this.avgWaterIntake = Number(
              (currentWeekTotal / daysElapsed).toFixed(1)
            );

            const previousWeekEnd = new Date(startDate);
            previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
            const previousWeekStart = new Date(previousWeekEnd);
            previousWeekStart.setDate(previousWeekEnd.getDate() - 6);

            this.http
              .get<any[]>(
                `${API_URL}/search/WellnessLogs/${userId}/?startDate=${this.formatDate(
                  previousWeekStart
                )}&endDate=${this.formatDate(previousWeekEnd)}`
              )
              .subscribe({
                next: (previousLogs) => {
                  const previousWeekTotal = previousLogs.reduce(
                    (sum, log) => sum + log.hydration,
                    0
                  );
                  const previousWeekAvg = previousWeekTotal / 7;

                  if (previousWeekAvg === 0 || isNaN(previousWeekAvg)) {
                    this.waterTrend = {
                      value: 0,
                      isPositive: true,
                    };
                    return;
                  }

                  const trendValue =
                    ((this.avgWaterIntake - previousWeekAvg) / previousWeekAvg) *
                    100;
                  this.waterTrend = {
                    value: Math.abs(Math.round(trendValue)),
                    isPositive: trendValue >= 0,
                  };
                },
              });
          },
        });
    } catch (error) {
      console.error('Error in calculateAverageWaterIntake:', error);
    }
  }

  async calculateCaloriesAndWorkout() {
    try {
      const userId = await this.getUserId();
      const now = new Date();
      const startDate = new Date();
      const currentDay = now.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      startDate.setDate(now.getDate() + diff);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      this.http
        .get<FitnessLog[]>(
          `${API_URL_FITNESS}/search/fitnessLogs/${userId}/?startDate=${this.formatDate(
            startDate
          )}&endDate=${this.formatDate(endDate)}`
        )
        .subscribe({
          next: (fitnessLogs) => {
            const daysElapsed = Math.min(
              Math.floor(
                (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
              ) + 1,
              7
            );

            const currentWeekCaloriesBurned = fitnessLogs.reduce(
              (sum: number, log: FitnessLog) => sum + log.caloriesBurned,
              0
            );
            const currentWeekDuration = fitnessLogs.reduce(
              (sum: number, log: FitnessLog) => sum + log.duration,
              0
            );

            this.totalCaloriesBurned = Math.round(
              currentWeekCaloriesBurned / daysElapsed
            );
            this.avgWorkoutDuration = Math.round(currentWeekDuration / daysElapsed);

            const previousWeekEnd = new Date(startDate);
            previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);
            const previousWeekStart = new Date(previousWeekEnd);
            previousWeekStart.setDate(previousWeekEnd.getDate() - 6);

            this.http
              .get<FitnessLog[]>(
                `${API_URL_FITNESS}/search/fitnessLogs/${userId}/?startDate=${this.formatDate(
                  previousWeekStart
                )}&endDate=${this.formatDate(previousWeekEnd)}`
              )
              .subscribe({
                next: (previousFitnessLogs) => {
                  const previousWeekDuration = previousFitnessLogs.reduce(
                    (sum: number, log: FitnessLog) => sum + log.duration,
                    0
                  );
                  const previousWeekAvgDuration = previousWeekDuration / 7;

                  if (
                    previousWeekAvgDuration === 0 ||
                    isNaN(previousWeekAvgDuration)
                  ) {
                    this.workoutTrend = {
                      value: 0,
                      isPositive: true,
                    };
                  } else {
                    const workoutTrendValue =
                      ((this.avgWorkoutDuration - previousWeekAvgDuration) /
                        previousWeekAvgDuration) *
                      100;
                    this.workoutTrend = {
                      value: Math.abs(Math.round(workoutTrendValue)),
                      isPositive: workoutTrendValue >= 0,
                    };
                  }

                  const previousWeekAvgCaloriesBurned =
                    previousFitnessLogs.reduce(
                      (sum: number, log: FitnessLog) => sum + log.caloriesBurned,
                      0
                    ) / 7;

                  this.http
                    .get<DietLog[]>(
                      `${API_URL_DIET}/search/DietLogs/${userId}?startDate=${this.formatDate(
                        startDate
                      )}&endDate=${this.formatDate(endDate)}`
                    )
                    .subscribe({
                      next: (dietLogs) => {
                        const currentWeekCaloriesConsumed = dietLogs.reduce(
                          (sum: number, log: DietLog) =>
                            sum + log.caloriesConsumed,
                          0
                        );
                        this.totalCaloriesConsumed = Math.round(
                          currentWeekCaloriesConsumed / daysElapsed
                        );

                        this.http
                          .get<DietLog[]>(
                            `${API_URL_DIET}/search/DietLogs/${userId}?startDate=${this.formatDate(
                              previousWeekStart
                            )}&endDate=${this.formatDate(previousWeekEnd)}`
                          )
                          .subscribe({
                            next: (previousDietLogs) => {
                              const previousWeekAvgCaloriesConsumed =
                                previousDietLogs.reduce(
                                  (sum: number, log: DietLog) =>
                                    sum + log.caloriesConsumed,
                                  0
                                ) / 7;

                              if (
                                previousWeekAvgCaloriesConsumed === 0 ||
                                this.totalCaloriesConsumed === 0
                              ) {
                                this.caloriesTrend = {
                                  value: 0,
                                  isPositive: true,
                                };
                                return;
                              }

                              const currentRatio =
                                this.totalCaloriesBurned /
                                this.totalCaloriesConsumed;
                              const previousRatio =
                                previousWeekAvgCaloriesBurned /
                                previousWeekAvgCaloriesConsumed;

                              if (
                                isNaN(currentRatio) ||
                                isNaN(previousRatio) ||
                                previousRatio === 0
                              ) {
                                this.caloriesTrend = {
                                  value: 0,
                                  isPositive: true,
                                };
                                return;
                              }

                              const calorieTrendValue =
                                ((currentRatio - previousRatio) / previousRatio) *
                                100;
                              this.caloriesTrend = {
                                value: Math.abs(Math.round(calorieTrendValue)),
                                isPositive: calorieTrendValue >= 0,
                              };
                            },
                          });
                      },
                    });
                },
              });
          },
        });
    } catch (error) {
      console.error('Error in calculateCaloriesAndWorkout:', error);
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onPeriodChange() {}

  onViewTypeChange() {}

  onMacrosPeriodChange() {}

  onMacrosViewTypeChange() {}

  onSleepPeriodChange() {}

  onSleepViewTypeChange() {}

  toggleGoalDropdown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.showGoalDropdown = !this.showGoalDropdown;
    console.log('Dropdown toggled:', this.showGoalDropdown);
  }

  onSelectGoalType(type: string) {
    this.selectedGoalType = type as GoalType;
    this.showGoalModal = true;
    this.showGoalDropdown = false;
  }

  async onUnsetGoal() {
    try {
      const userId = await this.getUserId();
      this.showGoalDropdown = false;
      this.goalService.unsetGoal(userId).subscribe({
        next: () => {
          console.log('Goal unset successfully');
          this.goalCommunicationService.unsetGoal();
          if (this.goalComponent) {
            this.goalComponent.currentGoal = null;
            this.goalComponent.loadGoals();
          }
        },
        error: (error) => {
          console.error('Error unsetting goal:', error);
        },
      });
    } catch (error) {
      console.error('Error in onUnsetGoal:', error);
    }
  }

  onModalClose() {
    this.showGoalModal = false;
    this.selectedGoalType = null;
  }

  async onModalSave(goalData: GoalLog) {
    try {
      const userId = await this.getUserId();
      const goalLogData = {
        userId: userId,
        goalType: goalData.goalType,
        description: goalData.description,
        currentWeight: goalData.currentWeight,
        targetWeight: goalData.targetWeight,
        startDate: goalData.startDate,
        targetEndDate: goalData.targetEndDate,
      } as GoalLog;

      this.goalService.updateGoalLog(goalLogData, userId).subscribe({
        next: (response) => {
          console.log('Goal saved successfully:', response);
          this.showGoalModal = false;
          this.selectedGoalType = null;
          this.goalCommunicationService.setGoalType(goalData.goalType);
          if (this.goalComponent) {
            setTimeout(() => {
              this.goalComponent.loadGoals();
            }, 100);
          }
        },
        error: (error) => {
          console.error('Error saving goal:', error);
        },
      });
    } catch (error) {
      console.error('Error in onModalSave:', error);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown');
    if (!dropdown) {
      this.showGoalDropdown = false;
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hrs`;
    }
    return `${hours} hrs ${remainingMinutes} mins`;
  }

  calculateBurnRatio(): number {
    if (!this.totalCaloriesConsumed) return 0;
    return Math.round(
      (this.totalCaloriesBurned / this.totalCaloriesConsumed) * 100
    );
  }

  getBurnRatioClass(ratio: number): string {
    if (ratio < 30) return 'ratio-low';
    if (ratio < 50) return 'ratio-medium';
    if (ratio < 80) return 'ratio-good';
    return 'ratio-high';
  }
}
