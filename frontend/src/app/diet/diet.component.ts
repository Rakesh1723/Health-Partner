import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MealType, DietLog, DietLogDTO } from '../models/diet-log.model';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';
import { NutritionService } from '../services/nutrition.service';
import { forkJoin } from 'rxjs';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

const API_URL = 'http://localhost:9000/api/v1/dietLogs';
const API_URL_FWD = 'http://localhost:9000/api/v1/goalLogs';

@Component({
  selector: 'app-diet',
  templateUrl: './diet.component.html',
  styleUrls: ['./diet.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NavBarComponent,
  ],
})
export class DietComponent implements OnInit {
  dietLogs: DietLog[] = [];
  isSearchOpen = false;
  selectedPeriod: string = '';
  startDate: string = '';
  endDate: string = '';
  logForm: FormGroup;
  isEditing = false;
  currentLogId?: number;
  modal: any;
  totalCalories: number = 0;
  totalMeals: number = 0;
  totalProtein: number = 0;
  totalCarbs: number = 0;
  totalFat: number = 0;

  mealTypes = Object.values(MealType);

  viewType: 'daily' | 'average' = 'daily';
  averageCalories: number = 0;
  averageProtein: number = 0;
  averageCarbs: number = 0;
  averageFat: number = 0;

  weekDays: { date: Date; name: string; isToday: boolean }[] = [];
  selectedDate: Date = new Date();

  isGoalSettingsOpen = false;
  hasActiveGoal = false;
  targetCalories = 0;
  targetProtein = 0;
  targetCarbs = 0;
  targetFat = 0;
  calorieProgress = 0;
  proteinProgress = 0;
  carbsProgress = 0;
  fatProgress = 0;
  showGoalInput = false;
  showAlert = false;
  alertMessage = '';
  alertType = '';

  today: string = new Date().toISOString().split('T')[0];

  calculatedNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  isCalculatingNutrition = false;

  showSuccessView = false;
  savedMeal: any = null;

  hasLogs: boolean = false;

  maxDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private nutritionService: NutritionService
  ) {
    this.logForm = this.fb.group({
      mealType: ['', Validators.required],
      foodItem: ['', Validators.required],
      notes: [''],
      logDate: [this.maxDate, [Validators.required]],
    });

    this.logForm.valueChanges.subscribe(() => {
      const protein = this.logForm.get('protein')?.value || 0;
      const carbs = this.logForm.get('carbs')?.value || 0;
      const fat = this.logForm.get('fat')?.value || 0;

      const calculatedCalories = protein * 4 + carbs * 4 + fat * 9;
      this.totalCalories = calculatedCalories;
    });

    this.selectedPeriod = 'Today';
  }

  private async getUserId(): Promise<number> {
    try {
      const token = sessionStorage.getItem('hp-token');
      if (!token) {
        throw new Error('No token found');
      }

      const userEmail = await firstValueFrom(
        this.http.get(`http://localhost:9000/jwtToken/${token}`, {
          responseType: 'text',
        })
      );

      if (!userEmail) {
        throw new Error('No email found');
      }

      const userId = await firstValueFrom(
        this.http.get<number>(
          `http://localhost:9000/api/v1/users/userId/${userEmail}`
        )
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

  ngOnInit() {
    this.initializeWeekDays();
    this.loadTodayLogs();
    this.loadGoalSettings();
    this.modal = new bootstrap.Modal(document.getElementById('logModal'));
  }

  initializeWeekDays() {
    const today = new Date();

    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);

      date.setDate(today.getDate() - i);
      return {
        date: date,
        name: date
          .toLocaleDateString('en-US', { weekday: 'short' })
          .slice(0, 3),
        isToday: this.isSameDay(date, today),
      };
    }).reverse();

    this.selectedDate = today;
  }

  public isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  async selectDay(date: Date) {
    this.selectedDate = date;
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      await this.searchByDateRange(userId, startDate, endDate);
    } catch (error) {
      console.error('Error in selectDay:', error);
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
      this.viewType =
        period === 'Custom'
          ? 'daily'
          : period === 'Today'
          ? 'daily'
          : 'average';

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

    this.http
      .get<DietLog[]>(
        `${API_URL}/search/DietLogs/${userId}?startDate=${startStr}&endDate=${endStr}`
      )
      .subscribe({
        next: (logs) => {
          this.dietLogs = logs.sort((a, b) => b.logId - a.logId);
          this.hasLogs = logs.length > 0;
          this.calculateSummary(logs);
        },
        error: (error) => {
          console.error('Error searching logs:', error);
          this.hasLogs = false;
        },
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
      logDate: this.maxDate,
    });
    this.logForm.get('logDate')?.enable();
    this.modal.show();
  }

  openEditModal(log: DietLog) {
    if (!log || !log.logId) {
      console.error('Invalid log data:', log);
      return;
    }

    this.isEditing = true;
    this.currentLogId = log.logId;

    const logDate = log.createdAt
      ? new Date(log.createdAt).toISOString().split('T')[0]
      : this.maxDate;

    this.logForm.patchValue({
      mealType: log.mealType,
      foodItem: log.foodItems.join(', '),
      notes: log.notes,
      logDate: logDate,
    });

    this.logForm.get('logDate')?.disable();

    this.modal.show();
  }

  async saveLog() {
    if (this.logForm.valid) {
      try {
        const userId = await this.getUserId();
        if (!userId) {
          this.router.navigate(['/login']);
          return;
        }

        this.isCalculatingNutrition = true;
        const formData = this.logForm.value;
        const foodItem = formData.foodItem;
        
        let logDate: Date;
        if (this.isEditing) {
          logDate = new Date();
        } else {
          logDate = new Date(formData.logDate);
          if (isNaN(logDate.getTime())) {
            logDate = new Date();
          }
        }

        this.nutritionService.getNutritionData(foodItem).subscribe({
          next: (nutrition) => {
            const defaultValues = {
              protein: 10,
              carbs: 30,
              fat: 7,
              calories: 225
            };

            const dietLog = {
              mealType: formData.mealType,
              foodItems: [foodItem],
              protein: Math.round(nutrition.protein) || defaultValues.protein,
              carbs: Math.round(nutrition.carbs) || defaultValues.carbs,
              fat: Math.round(nutrition.fat) || defaultValues.fat,
              caloriesConsumed: Math.round(nutrition.calories) || defaultValues.calories,
              notes: formData.notes || '',
              createdAt: logDate.toISOString(),
              updatedAt: new Date().toISOString()
            };

            if (!nutrition.protein || !nutrition.carbs || !nutrition.fat || !nutrition.calories) {
              this.showAlertMessage(
                'Exact nutritional information not found. Using estimated values.',
                'warning'
              );
            }

            if (this.isEditing && this.currentLogId) {
              this.http.put(
                `${API_URL}/users/${userId}/diet-logs/${this.currentLogId}`,
                dietLog
              ).subscribe({
                next: () => {
                  this.savedMeal = {
                    ...dietLog,
                    logId: this.currentLogId
                  };
                  this.showSuccessView = true;
                  this.showAlertMessage('Meal updated successfully!', 'success');
                  this.loadTodayLogs();
                },
                error: (error) => {
                  console.error('Error updating log:', error);
                  this.showAlertMessage('Failed to update meal', 'error');
                }
              });
            } else {
              this.http.post(`${API_URL}/users/${userId}`, dietLog).subscribe({
                next: (response: any) => {
                  this.savedMeal = {
                    ...dietLog,
                    logId: response.logId,
                  };
                  this.showSuccessView = true;
                  this.showAlertMessage('Meal logged successfully!', 'success');
                  this.loadTodayLogs();
                },
                error: (error) => {
                  console.error('Error saving log:', error);
                  this.showAlertMessage('Failed to save meal', 'error');
                },
              });
            }
            this.isCalculatingNutrition = false;
          },
          error: (error) => {
            this.isCalculatingNutrition = false;
            console.error('Error calculating nutrition:', error);
            this.showAlertMessage('Failed to calculate nutrition', 'error');
          }
        });
      } catch (error) {
        console.error('Error in saveLog:', error);
      }
    }
  }

  calculateSummary(logs: DietLog[]) {
    if (this.viewType === 'daily') {
      this.totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);
      this.totalCarbs = logs.reduce((sum, log) => sum + log.carbs, 0);
      this.totalFat = logs.reduce((sum, log) => sum + log.fat, 0);
      this.totalCalories = logs.reduce((sum, log) => sum + log.caloriesConsumed, 0);
      this.updateAllProgress();
    } else {
      // Get unique days from logs
      const uniqueDays = new Set(
        logs.map(log => {
          const date = log.createdAt ? new Date(log.createdAt) : new Date();
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })
      );
      
      const daysWithLogs = uniqueDays.size;
      
      if (daysWithLogs > 0) {
        // Calculate averages based on days with actual logs
        this.averageProtein = Math.round(
          logs.reduce((sum, log) => sum + log.protein, 0) / daysWithLogs
        );
        
        this.averageCarbs = Math.round(
          logs.reduce((sum, log) => sum + log.carbs, 0) / daysWithLogs
        );
        
        this.averageFat = Math.round(
          logs.reduce((sum, log) => sum + log.fat, 0) / daysWithLogs
        );
        
        this.averageCalories = Math.round(
          logs.reduce((sum, log) => sum + log.caloriesConsumed, 0) / daysWithLogs
        );
      } else {
        // If no logs, set averages to 0
        this.averageProtein = 0;
        this.averageCarbs = 0;
        this.averageFat = 0;
        this.averageCalories = 0;
      }
    }
  }

  private getDaysInPeriod(): number {
    // Keep this if you need it for other purposes
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

  getMealTypeIcon(type: MealType): string {
    const icons: { [key in MealType]: string } = {
      [MealType.BREAKFAST]: 'fa-coffee',
      [MealType.LUNCH]: 'fa-hamburger',
      [MealType.DINNER]: 'fa-utensils',
      [MealType.SNACK]: 'fa-cookie-bite',
    };
    return icons[type] || 'fa-utensils';
  }

  async deleteDietLog(logId: number) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      if (confirm('Are you sure you want to delete this log?')) {
        this.http
          .delete(`${API_URL}/users/${userId}/diet-logs/${logId}`)
          .subscribe({
            next: () => {
              console.log('Log deleted successfully');
              this.loadTodayLogs();
            },
            error: (error) => {
              console.error('Error deleting log:', error);
            },
          });
      }
    } catch (error) {
      console.error('Error in deleteDietLog:', error);
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

  toggleSearchOptions(event: Event) {
    event.stopPropagation();
    this.isSearchOpen = !this.isSearchOpen;

    if (this.isSearchOpen) {
      document.addEventListener(
        'click',
        () => {
          this.isSearchOpen = false;
        },
        { once: true }
      );
    }
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
          this.hasActiveGoal = response.targetCaloriesConsumed !== -1;
          if (this.hasActiveGoal) {
            this.targetCalories = response.targetCaloriesConsumed;
            this.targetProtein = response.targetProteinConsumption;
            this.targetCarbs = response.targetCarbsConsumption;
            this.targetFat = response.targetFatConsumption;
            this.updateAllProgress();
          } else {
            this.resetGoals();
          }
        },
        error: (error) => {
          console.error('Error loading goal settings:', error);
        },
      });
    } catch (error) {
      console.error('Error in loadGoalSettings:', error);
    }
  }

  resetGoals() {
    this.targetCalories = 0;
    this.targetProtein = 0;
    this.targetCarbs = 0;
    this.targetFat = 0;
    this.calorieProgress = 0;
    this.proteinProgress = 0;
    this.carbsProgress = 0;
    this.fatProgress = 0;
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
      this.targetProtein = -1;
      this.targetCarbs = -1;
      this.targetFat = -1;
      this.isGoalSettingsOpen = false;

      const goalData = {
        userId: userId,
        targetCaloriesBurned: 0,
        targetCaloriesConsumed: -1,
        targetProteinConsumption: -1,
        targetCarbsConsumption: -1,
        targetFatConsumption: -1,
        targetSleepDuration: '00:00',
        targetHydration: 0,
      };

      this.http.put(`${API_URL_FWD}/FWD/${userId}`, goalData).subscribe({
        next: () => {
          this.updateAllProgress();
          this.loadGoalSettings();
          this.showAlertMessage('Goal unset!', 'error');
        },
        error: (error) => {
          console.error('Error unsetting goal:', error);
          this.showAlertMessage(
            'Failed to unset goal. Please try again.',
            'error'
          );
        },
      });
    } catch (error) {
      console.error('Error in unsetGoal:', error);
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
        targetCaloriesBurned: 0,
        targetCaloriesConsumed: this.hasActiveGoal ? this.targetCalories : -1,
        targetProteinConsumption: this.hasActiveGoal ? this.targetProtein : -1,
        targetCarbsConsumption: this.hasActiveGoal ? this.targetCarbs : -1,
        targetFatConsumption: this.hasActiveGoal ? this.targetFat : -1,
        targetSleepDuration: '00:00',
        targetHydration: 0,
      };

      this.http.put(`${API_URL_FWD}/FWD/${userId}`, goalData).subscribe({
        next: () => {
          this.isGoalSettingsOpen = false;
          this.showGoalInput = false;
          this.updateAllProgress();
          this.loadGoalSettings();
          if (this.hasActiveGoal) {
            this.showAlertMessage('Goal has been set successfully!', 'success');
          }
        },
        error: (error) => {
          console.error('Error saving goal settings:', error);
          this.showAlertMessage(
            'Failed to set goal. Please try again.',
            'error'
          );
        },
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
    } else {
      this.calorieProgress = 0;
    }
  }

  updateProteinProgress() {
    if (this.hasActiveGoal && this.targetProtein > 0) {
      this.proteinProgress = Math.min(
        Math.round((this.totalProtein / this.targetProtein) * 100),
        100
      );
    } else {
      this.proteinProgress = 0;
    }
  }

  updateCarbsProgress() {
    if (this.hasActiveGoal && this.targetCarbs > 0) {
      this.carbsProgress = Math.min(
        Math.round((this.totalCarbs / this.targetCarbs) * 100),
        100
      );
    } else {
      this.carbsProgress = 0;
    }
  }

  updateFatProgress() {
    if (this.hasActiveGoal && this.targetFat > 0) {
      this.fatProgress = Math.min(
        Math.round((this.totalFat / this.targetFat) * 100),
        100
      );
    } else {
      this.fatProgress = 0;
    }
  }

  updateAllProgress() {
    this.updateCalorieProgress();
    this.updateProteinProgress();
    this.updateCarbsProgress();
    this.updateFatProgress();
  }

  getProgressLevel(progress: number): string {
    if (progress === 0 || this.totalCalories === 0) return '';
    if (progress < 33) return 'low';
    if (progress < 66) return 'medium';
    return 'high';
  }

  showAlertMessage(message: string, type: string) {
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
    const dateInput = input.parentElement?.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    dateInput.showPicker();
  }

  openEndDatePicker(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const input = event.target as HTMLElement;
    const dateInput = input.parentElement?.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    dateInput.showPicker();
  }

  closeModal() {
    this.modal.hide();
    this.logForm.reset();
    this.showSuccessView = false;
    this.savedMeal = null;
    this.isEditing = false;
    this.currentLogId = undefined;
  }
}
