import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivityType, Intensity, FitnessLog, FitnessLogDTO } from '../models/fitness-log.model';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';
import { UserService } from '../services/user.service';
import { FitnessService } from '../services/fitness.service';
import { switchMap } from 'rxjs/operators';
import { UserDto } from '../models/user.dto';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

const API_URL = 'http://localhost:9000/api/v1/fitnessLogs';
const API_URL_FWD = 'http://localhost:9000/api/v1/goalLogs';

@Component({
  selector: 'app-fitness',
  templateUrl: './fitness.component.html',
  styleUrls: ['./fitness.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NavBarComponent
  ]
})
export class FitnessComponent implements OnInit {
  private userService = inject(UserService);
  private fitnessService = inject(FitnessService);

  fitnessLogs: FitnessLog[] = [];
  isSearchOpen = false;
  selectedPeriod: string = 'Today';
  startDate: string = '';
  endDate: string = '';
  logForm: FormGroup;
  isEditing = false;
  currentLogId?: number;
  modal: any;
  totalDuration: number = 0;
  totalCalories: number = 0;
  viewType: 'daily' | 'average' = 'daily';
  averageDuration: number = 0;
  averageCalories: number = 0;

  activityTypes = Object.values(ActivityType);
  intensityLevels = Object.values(Intensity);

  weekDays: { date: Date; name: string; isToday: boolean }[] = [];
  selectedDate: Date = new Date();

  isGoalSettingsOpen = false;
  hasActiveGoal = false;
  targetCalories = 0;
  calorieProgress = 0;
  showGoalInput = false;
  showAlert = false;
  alertMessage = '';
  alertType = '';

  today: string = new Date().toISOString().split('T')[0];  

  userWeight: number = 70; 
  isCalculatingCalories: boolean = false;

  showNotification = false;
  notificationMessage = '';

  showSuccessView = false;
  savedWorkout: any = null;

  hasLogs: boolean = false;

  maxDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.logForm = this.fb.group({
      workoutType: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      workoutIntensity: ['', Validators.required],
      notes: [''],
      logDate: [this.maxDate, [Validators.required]]
    });
  }

  ngOnInit() {
    this.initializeWeekDays();
    this.loadTodayLogs();
    this.loadGoalSettings();
    this.modal = new bootstrap.Modal(document.getElementById('logModal'));
    this.loadUserData();
  }

  initializeWeekDays() {
    const today = new Date();
    const weekDays = [];
    
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        weekDays.push({
            date: date,
            name: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
            isToday: this.isSameDay(date, today)
        });
    }

    this.weekDays = weekDays;
    this.selectedDate = today;
  }

  public isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  async selectDay(date: Date) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      this.selectedDate = date;
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      await this.searchByDateRange(userId, start, end);
    } catch (error) {
      console.error('Error in selectDay:', error);
    }
  }

  async loadTodayLogs() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      const start = new Date(this.selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(this.selectedDate);
      end.setHours(23, 59, 59, 999);
      
      await this.searchByDateRange(userId, start, end);
    } catch (error) {
      console.error('Error in loadTodayLogs:', error);
    }
  }

  async loadLogs() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      this.http.get<FitnessLog[]>(`${API_URL}/${userId}/fitness-logs`)
        .subscribe({
          next: (logs) => {
            this.fitnessLogs = logs.sort((a, b) => b.logId - a.logId);
            this.calculateSummary(logs);
          },
          error: (error) => {
            console.error('Error loading logs:', error);
          }
        });
    } catch (error) {
      console.error('Error in loadLogs:', error);
    }
  }

  toggleSearchOptions(event: Event) {
    event.stopPropagation();
    this.isSearchOpen = !this.isSearchOpen;

    if (this.isSearchOpen) {
      document.addEventListener('click', () => {
        this.isSearchOpen = false;
      }, { once: true });
    }
  }

  async selectPeriod(period: string) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      this.selectedPeriod = period;
      this.isSearchOpen = false;
      this.viewType = period === 'Custom' ? 'daily' : period === 'Today' ? 'daily' : 'average';

      const today = new Date();
      let start = new Date();
      let end = new Date();

      switch (period) {
        case 'Today':
          start = new Date(today.setHours(0, 0, 0, 0));
          end = new Date(today.setHours(23, 59, 59, 999));
          break;

        case 'Weekly':
          const currentDay = today.getDay();
          const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
          start = new Date(today);
          start.setDate(today.getDate() - daysToMonday);
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        
        case 'Monthly':
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
          break;

        case 'Yearly':
          start = new Date(today.getFullYear(), 0, 1);
          start.setHours(0, 0, 0, 0);
          end = new Date(today.getFullYear(), 11, 31);
          end.setHours(23, 59, 59, 999);
          break;

        case 'Custom':
          this.viewType = 'daily';
          return;
      }

      await this.searchByDateRange(userId, start, end);
    } catch (error) {
      console.error('Error in selectPeriod:', error);
    }
  }

  async searchLogs() {
    try {
      const userId = await this.getUserId();
      if (!userId || !this.startDate || !this.endDate) return;

      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      await this.searchByDateRange(userId, start, end);
    } catch (error) {
      console.error('Error in searchLogs:', error);
    }
  }

  searchByDateRange(userId: number, start: Date, end: Date) {
    const startStr = this.formatDate(start);
    const endStr = this.formatDate(end);
  
    this.http.get<FitnessLog[]>(
      `${API_URL}/search/fitnessLogs/${userId}/?startDate=${startStr}&endDate=${endStr}`
    ).subscribe({
      next: (logs) => {
        this.fitnessLogs = logs.sort((a, b) => b.logId - a.logId);
        this.hasLogs = logs.length > 0;
        this.calculateSummary(logs);
      },
      error: (error) => {
        console.error('Error searching logs:', error);
        this.hasLogs = false;
      }
    });
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  openAddModal() {
    this.isEditing = false;
    this.currentLogId = undefined;
    this.logForm.reset({
      logDate: this.maxDate
    });
    this.logForm.get('logDate')?.enable();
    this.modal.show();
  }

  openEditModal(log: FitnessLog) {
    if (!log || !log.logId) {
      console.error('Invalid log data:', log);
      return;
    }

    this.isEditing = true;
    this.currentLogId = log.logId;
    
    const logDate = log.createdAt ? 
      new Date(log.createdAt).toISOString().split('T')[0] : 
      this.maxDate;

    this.logForm.patchValue({
      workoutType: log.workoutType,
      duration: log.duration,
      workoutIntensity: log.workoutIntensity,
      notes: log.notes,
      logDate: logDate
    });
    
    this.logForm.get('logDate')?.disable();
    
    this.modal.show();
  }

  async updateLog() {
    if (this.logForm.valid && this.currentLogId) {
      try {
        const userId = await this.getUserId();
        if (!userId) {
          this.router.navigate(['/login']);
          return;
        }

        this.isCalculatingCalories = true;
        const formData = this.logForm.value;
        const currentDate = new Date().toISOString();
        
        this.fitnessService.calculateCalories(
          formData.workoutType,
          this.userWeight,
          formData.duration,
          formData.workoutIntensity
        ).subscribe({
          next: (calories: number) => {
            const fitnessLog: FitnessLogDTO = {
              userId: userId,
              workoutType: formData.workoutType,
              duration: formData.duration,
              workoutIntensity: formData.workoutIntensity,
              caloriesBurned: calories,
              notes: formData.notes || '',
              createdAt: currentDate,
              updatedAt: currentDate
            };

            this.http.put(`${API_URL}/users/${userId}/fitness-logs/${this.currentLogId}`, fitnessLog)
              .subscribe({
                next: () => {
                  this.isCalculatingCalories = false;
                  this.savedWorkout = {
                    ...fitnessLog,
                    logId: this.currentLogId
                  };
                  this.showSuccessView = true;
                  this.showNotification = true;
                  this.notificationMessage = 'Workout updated successfully!';
                  this.alertType = 'success';
                  this.loadTodayLogs();
                  setTimeout(() => {
                    this.showNotification = false;
                  }, 3000);
                },
                error: (error) => {
                  this.isCalculatingCalories = false;
                  console.error('Error updating workout:', error);
                  this.showNotification = true;
                  this.notificationMessage = 'Failed to update workout';
                  this.alertType = 'error';
                  setTimeout(() => {
                    this.showNotification = false;
                  }, 3000);
                }
              });
          }
        });
      } catch (error) {
        console.error('Error in updateLog:', error);
      }
    }
  }

  getActivityIcon(type: ActivityType): string {
    const icons: { [key in ActivityType]: string } = {
      [ActivityType.RUNNING]: 'fa-running',
      [ActivityType.WALKING]: 'fa-walking',
      [ActivityType.CYCLING]: 'fa-bicycle',
      [ActivityType.SWIMMING]: 'fa-swimmer',
      [ActivityType.BASKETBALL]: 'fa-basketball-ball',
      [ActivityType.FOOTBALL]: 'fa-football-ball',
      [ActivityType.BADMINTON]: 'fa-table-tennis',
      [ActivityType.SKIPPING]: 'fa-running',
      [ActivityType.CRICKET]: 'fa-baseball-ball',
      [ActivityType.WEIGHTLIFTING]: 'fa-dumbbell',
      [ActivityType.GENERAL]: 'fa-star'
    };
    return icons[type] || 'fa-star';
  }

  getIntensityIcon(intensity: Intensity): string {
    const icons: { [key in Intensity]: string } = {
      [Intensity.LOW]: 'fa-chart-line transform-rotate-180',
      [Intensity.MODERATE]: 'fa-chart-line transform-rotate-270',
      [Intensity.HIGH]: 'fa-chart-line'
    };
    return icons[intensity] || 'fa-chart-line transform-rotate-270';
  }

  calculateSummary(logs: FitnessLog[]) {
    if (this.viewType === 'daily') {
      const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0);
      this.totalDuration = totalMinutes;
      this.totalCalories = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
      this.updateCalorieProgress();
    } else {
      const uniqueDays = new Set(
        logs.map(log => {
          const date = log.createdAt ? new Date(log.createdAt) : new Date();
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })
      );
      
      const daysWithLogs = uniqueDays.size;
      
      if (daysWithLogs > 0) {
        const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0);
        this.averageDuration = Math.round(totalMinutes / daysWithLogs);
        
        this.averageCalories = Math.round(
          logs.reduce((sum, log) => sum + log.caloriesBurned, 0) / daysWithLogs
        );
      } else {
        this.averageDuration = 0;
        this.averageCalories = 0;
      }
    }
  }

  private getDaysInPeriod(): number {
    switch (this.selectedPeriod) {
      case 'Weekly':
        return 7;
      case 'Monthly':
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      case 'Yearly':
        return 365;
      default:
        return 1;
    }
  }

  async deleteFitnessLog(logId: number) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      if (confirm('Are you sure you want to delete this log?')) {
        this.http.delete(`${API_URL}/users/${userId}/fitness-logs/${logId}`)
          .subscribe({
            next: () => {
              this.loadTodayLogs();
            },
            error: (error) => {
              console.error('Error deleting log:', error);
            }
          });
      }
    } catch (error) {
      console.error('Error in deleteFitnessLog:', error);
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

  toggleGoalSettings() {
    this.isGoalSettingsOpen = !this.isGoalSettingsOpen;
    if (!this.isGoalSettingsOpen) {
      this.showGoalInput = false;
    }
    if (this.isGoalSettingsOpen) {
      this.loadGoalSettings();
    }
  }

  async loadGoalSettings() {
    try {
      const userId = await this.getUserId();
      this.http.get<any>(`${API_URL_FWD}/FWD/${userId}`).subscribe({
        next: (response) => {
          this.hasActiveGoal = response.targetCaloriesBurned !== -1;
          if (this.hasActiveGoal) {
            this.targetCalories = response.targetCaloriesBurned;
            this.updateCalorieProgress();
          } else {
            this.targetCalories = 0;
          }
        },
        error: (error) => {
          console.error('Error loading goal settings:', error);
        }
      });
    } catch (error) {
      console.error('Error in loadGoalSettings:', error);
    }
  }

  toggleGoalActive(active: boolean) {
    this.hasActiveGoal = active;
    if (!active) {
      this.targetCalories = -1;
    }
  }

  async saveGoalSettings() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      const goalData = {
        userId: userId,
        targetCaloriesBurned: this.hasActiveGoal ? this.targetCalories : -1,
        targetCaloriesConsumed: 0,
        targetProteinConsumption: 0,
        targetCarbsConsumption: 0,
        targetFatConsumption: 0,
        targetSleepDuration: "00:00",
        targetHydration: 0
      };

      this.http.put(`${API_URL_FWD}/FWD/${userId}`, goalData).subscribe({
        next: () => {
          this.isGoalSettingsOpen = false;
          this.showGoalInput = false;
          this.updateCalorieProgress();
          this.loadGoalSettings();
          if (this.hasActiveGoal) {
            this.showAlertMessage('Goal', 'Goal has been set successfully!', 'success');
          }
        },
        error: (error: Error) => {
          console.error('Error saving goal settings:', error);
          this.showAlertMessage('Error', 'Failed to set goal. Please try again.', 'error');
        }
      });
    } catch (error) {
      console.error('Error in saveGoalSettings:', error);
    }
  }

  updateCalorieProgress() {
    if (this.hasActiveGoal && this.targetCalories > 0) {
      if (this.totalCalories > 0) {
        this.calorieProgress = Math.min(
          Math.round((this.totalCalories / this.targetCalories) * 100),
          100
        );
      } else {
        this.calorieProgress = 0;
      }
      console.log('Progress updated:', this.calorieProgress, '%', 'Total calories:', this.totalCalories);
    } else {
      this.calorieProgress = 0;
    }
  }

  getProgressLevel(progress: number): string {
    if (progress === 0) return '';
    if (progress < 33) return 'low';
    if (progress < 66) return 'medium';
    return 'high';
  }

  showSetGoal() {
    this.showGoalInput = true;
  }

  cancelSetGoal() {
    this.showGoalInput = false;
    this.targetCalories = this.hasActiveGoal ? this.targetCalories : 0;
  }

  async unsetGoal() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      this.hasActiveGoal = false;
      this.targetCalories = -1;
      this.isGoalSettingsOpen = false;
      
      const goalData = {
        userId: userId,
        targetCaloriesBurned: -1,
        targetCaloriesConsumed: 0,
        targetProteinConsumption: 0,
        targetCarbsConsumption: 0,
        targetFatConsumption: 0,
        targetSleepDuration: "00:00",
        targetHydration: 0
      };

      this.http.put(`${API_URL_FWD}/FWD/${userId}`, goalData).subscribe({
        next: () => {
          this.updateCalorieProgress();
          this.loadGoalSettings();
          this.showAlertMessage('Goal', 'Goal unset!', 'error');
        },
        error: (error: Error) => {
          console.error('Error unsetting goal:', error);
          this.showAlertMessage('Error', 'Failed to unset goal. Please try again.', 'error');
        }
      });
    } catch (error) {
      console.error('Error in unsetGoal:', error);
    }
  }

  showAlertMessage(title: string, message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    setTimeout(() => {
      this.showAlert = false;
      this.alertMessage = '';
    }, 3000);
  }

  openStartDatePicker(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const input = event.target as HTMLElement;
    const dateInput = input.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;
    dateInput.showPicker();
  }

  openEndDatePicker(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const input = event.target as HTMLElement;
    const dateInput = input.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;
    dateInput.showPicker();
  }

  async loadUserData() {
    try {
      const userId = await this.getUserId();
      this.userService.getUserById(userId).subscribe({
        next: (user: UserDto) => {
          this.userWeight = user.weight * 2.20462; 
        },
        error: (error: Error) => {
          console.error('Error loading user data:', error);
        }
      });
    } catch (error) {
      console.error('Error in loadUserData:', error);
    }
  }

  closeModal() {
    this.modal.hide();
    this.logForm.reset();
    this.showSuccessView = false;
    this.savedWorkout = null;
    this.isEditing = false;
    this.currentLogId = undefined;
  }

  async saveLog() {
    if (this.logForm.valid) {
      try {
        const userId = await this.getUserId();
        if (!userId) {
          this.router.navigate(['/login']);
          return;
        }

        this.isCalculatingCalories = true;
        const formData = this.logForm.value;
        const logDate = new Date(formData.logDate);
        logDate.setHours(new Date().getHours());
        logDate.setMinutes(new Date().getMinutes());
        
        this.fitnessService.calculateCalories(
          formData.workoutType,
          this.userWeight,
          formData.duration,
          formData.workoutIntensity
        ).subscribe({
          next: (calories: number) => {
            const fitnessLog: FitnessLogDTO = {
              userId: userId,
              workoutType: formData.workoutType,
              duration: formData.duration,
              workoutIntensity: formData.workoutIntensity,
              caloriesBurned: calories,
              notes: formData.notes || '',
              createdAt: logDate.toISOString(),
              updatedAt: logDate.toISOString()
            };

            this.http.post(`${API_URL}/users/${userId}`, fitnessLog)
              .subscribe({
                next: (response: any) => {
                  this.isCalculatingCalories = false;
                  this.savedWorkout = {
                    ...fitnessLog,
                    logId: response.logId
                  };
                  this.showSuccessView = true;
                  this.showNotification = true;
                  this.notificationMessage = 'Workout logged successfully!';
                  this.alertType = 'success';
                  this.loadTodayLogs();
                  setTimeout(() => {
                    this.showNotification = false;
                  }, 3000);
                },
                error: (error) => {
                  this.isCalculatingCalories = false;
                  console.error('Error saving workout:', error);
                  this.showNotification = true;
                  this.notificationMessage = 'Failed to save workout';
                  this.alertType = 'error';
                  setTimeout(() => {
                    this.showNotification = false;
                  }, 3000);
                }
              });
          }
        });
      } catch (error) {
        console.error('Error in saveLog:', error);
      }
    }
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
}
