import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Mood, WellnessLog, WellnessLogDTO } from '../models/wellness-log.model';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

const API_URL = 'http://localhost:9000/api/v1/wellnessLogs';
const API_URL_FWD = 'http://localhost:9000/api/v1/goalLogs';

@Component({
  selector: 'app-wellness',
  templateUrl: './wellness.component.html',
  styleUrls: ['./wellness.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NavBarComponent
  ]
})
export class WellnessComponent implements OnInit {
  wellnessLogs: WellnessLog[] = [];
  isSearchOpen = false;
  selectedPeriod: string = 'Today';
  startDate: string = '';
  endDate: string = '';
  logForm: FormGroup;
  isEditing = false;
  currentLogId?: number;
  modal: any;
  totalSleep: number = 0;
  totalHydration: number = 0;
  weekDays: { date: Date; name: string; isToday: boolean }[] = [];
  selectedDate: Date = new Date();
  viewType: 'daily' | 'average' = 'daily';
  averageSleep: number = 0;
  averageHydration: number = 0;

  moods = Object.values(Mood);

  isGoalSettingsOpen = false;
  hasActiveGoal = false;
  targetSleep = "00:00";  
  targetHydration = 0;    
  sleepProgress = 0;
  hydrationProgress = 0;
  showGoalInput = false;
  showAlert = false;
  alertMessage = '';
  alertType = '';
  totalSleepDuration: string = "00:00";  
  totalWaterIntake: number = 0;          
  alertTimeout: any;
  today: string = new Date().toISOString().split('T')[0];  
  hasLogs: boolean = false;
  maxDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.logForm = this.fb.group({
      mood: ['', Validators.required],
      triggers: this.fb.array([this.createTrigger()]),
      sleepDuration: ['', [Validators.required, Validators.min(0), Validators.max(24)]],
      hydration: ['', [Validators.required, Validators.min(0)]],
      notes: [''],
      logDate: [this.maxDate, [Validators.required]]
    });
  }

  ngOnInit() {
    this.initializeWeekDays();
    this.loadTodayLogs();
    this.loadGoalSettings();
    this.modal = new bootstrap.Modal(document.getElementById('logModal'));
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

  searchByDateRange(userId: number, start: Date, end: Date) {
    const startStr = this.formatDate(start);
    const endStr = this.formatDate(end);
    
    this.http.get<WellnessLog[]>(
      `${API_URL}/search/WellnessLogs/${userId}/?startDate=${startStr}&endDate=${endStr}`
    ).subscribe({
      next: (logs) => {
        this.wellnessLogs = logs.sort((a, b) => b.logId - a.logId);
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

  openEditModal(log: WellnessLog) {
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
      sleepDuration: log.sleepDuration,
      hydration: log.hydration,
      notes: log.notes,
      logDate: logDate
    });
    
    this.logForm.get('logDate')?.disable();
    
    this.modal.show();
  }

  async saveLog() {
    if (this.logForm.invalid) {
      console.log('Form is invalid:', this.logForm.errors);
      return;
    }

    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      const formData = this.logForm.value;
      let logDate: Date;
      
      if (this.isEditing) {
        logDate = new Date();
      } else {
        logDate = new Date(formData.logDate);
        if (isNaN(logDate.getTime())) {
          logDate = new Date();
        }
      }

      const logData = {
        mood: formData.mood,
        triggers: this.triggers.controls.map(control => control.get('item')?.value),
        sleepDuration: formData.sleepDuration,
        hydration: formData.hydration,
        notes: formData.notes || '',
        createdAt: logDate.toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.isEditing && this.currentLogId) {
        this.http.put(
          `${API_URL}/users/${userId}/wellness-logs/${this.currentLogId}`,
          logData
        ).subscribe({
          next: () => {
            this.modal.hide();
            this.loadTodayLogs();
          },
          error: (error) => {
            console.error('Error updating log:', error);
          }
        });
      } else {
        this.http.post(
          `${API_URL}/users/${userId}`,
          logData
        ).subscribe({
          next: () => {
            this.modal.hide();
            this.loadTodayLogs();
          },
          error: (error) => {
            console.error('Error saving log:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error in saveLog:', error);
    }
  }

  async deleteWellnessLog(logId: number) {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      if (confirm('Are you sure you want to delete this log?')) {
        this.http.delete(`${API_URL}/users/${userId}/wellness-logs/${logId}`)
          .subscribe({
            next: () => {
              console.log('Log deleted successfully');
              this.loadTodayLogs();
            },
            error: (error) => {
              console.error('Error deleting log:', error);
            }
          });
      }
    } catch (error) {
      console.error('Error in deleteWellnessLog:', error);
    }
  }

  createTrigger(): FormGroup {
    return this.fb.group({
      item: ['', Validators.required]
    });
  }

  get triggers() {
    return this.logForm.get('triggers') as FormArray;
  }

  addTrigger() {
    this.triggers.push(this.createTrigger());
  }

  removeTrigger(index: number) {
    this.triggers.removeAt(index);
  }

  getMoodIcon(mood: Mood): string {
    const icons: { [key in Mood]: string } = {
      [Mood.HAPPY]: 'fa-smile',
      [Mood.SAD]: 'fa-frown',
      [Mood.ANXIOUS]: 'fa-meh-rolling-eyes',
      [Mood.CALM]: 'fa-peace',
      [Mood.STRESSED]: 'fa-tired',
      [Mood.ENERGETIC]: 'fa-grin-stars',
      [Mood.TIRED]: 'fa-bed'
    };
    return icons[mood] || 'fa-meh';
  }

  calculateSummary(logs: WellnessLog[]) {
    if (this.viewType === 'daily') {
      this.totalSleep = logs.reduce((sum, log) => sum + log.sleepDuration, 0);
      this.totalHydration = logs.reduce((sum, log) => sum + log.hydration, 0);
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
        this.averageSleep = Math.round(
          logs.reduce((sum, log) => sum + log.sleepDuration, 0) / daysWithLogs
        );
        
        this.averageHydration = Number(
          (logs.reduce((sum, log) => sum + log.hydration, 0) / daysWithLogs).toFixed(1)
        );
      } else {
        // If no logs, set averages to 0
        this.averageSleep = 0;
        this.averageHydration = 0;
      }
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
      let startDate = new Date();
      let endDate = new Date();

      switch (period) {
        case 'Today':
          startDate = new Date(today.setHours(0, 0, 0, 0));
          endDate = new Date(today.setHours(23, 59, 59, 999));
          break;

        case 'Weekly':
          const currentDay = today.getDay();
          const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
          startDate = new Date(today);
          startDate.setDate(today.getDate() - daysToMonday);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        
        case 'Monthly':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;

        case 'Yearly':
          startDate = new Date(today.getFullYear(), 0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(today.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;

        case 'Custom':
          return;
      }

      await this.searchByDateRange(userId, startDate, endDate);
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
          this.hasActiveGoal = response.targetSleepDuration !== "00:00" || response.targetHydration !== -1;
          if (this.hasActiveGoal) {
            this.targetSleep = response.targetSleepDuration;
            this.targetHydration = response.targetHydration;
            this.updateAllProgress();
          } else {
            this.resetGoals();
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

  resetGoals() {
    this.targetSleep = "00:00";
    this.targetHydration = 0;
    this.sleepProgress = 0;
    this.hydrationProgress = 0;
  }

  showSetGoal() {
    this.showGoalInput = true;
    this.hasActiveGoal = true;
  }

  cancelSetGoal() {
    this.showGoalInput = false;
    if (this.hasActiveGoal) {
      this.loadGoalSettings();
    } else {
      this.resetGoals();
    }
  }

  async unsetGoal() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      this.hasActiveGoal = false;
      this.targetSleep = "00:00";
      this.targetHydration = 0;
      this.isGoalSettingsOpen = false;
      
      const goalData = {
        userId: userId,
        targetCaloriesBurned: 0,
        targetCaloriesConsumed: 0,
        targetProteinConsumption: 0,
        targetCarbsConsumption: 0,
        targetFatConsumption: 0,
        targetSleepDuration: "00:00",
        targetHydration: -1
      };

      this.http.put(`${API_URL_FWD}/FWD/${userId}`, goalData).subscribe({
        next: () => {
          this.updateAllProgress();
          this.loadGoalSettings();
          this.showAlertMessage('Goal has been unset', 'error');
        },
        error: (error) => {
          console.error('Error unsetting goal:', error);
          this.showAlertMessage('Failed to unset goal. Please try again.', 'error');
        }
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
        targetCaloriesConsumed: 0,
        targetProteinConsumption: 0,
        targetCarbsConsumption: 0,
        targetFatConsumption: 0,
        targetSleepDuration: this.hasActiveGoal ? this.targetSleep : "00:00",
        targetHydration: this.hasActiveGoal ? this.targetHydration : -1
      };

      this.http.put(`${API_URL_FWD}/FWD/${userId}`, goalData).subscribe({
        next: () => {
          this.isGoalSettingsOpen = false;
          this.showGoalInput = false;
          this.updateAllProgress();
          this.loadGoalSettings();
          this.showAlertMessage('Goal has been set successfully!', 'success');
        },
        error: (error) => {
          console.error('Error saving goal settings:', error);
          this.showAlertMessage('Failed to set goal. Please try again.', 'error');
        }
      });
    } catch (error) {
      console.error('Error in saveGoalSettings:', error);
    }
  }

  updateSleepProgress() {
    if (this.hasActiveGoal && this.targetSleep !== "00:00") {
      const targetHours = this.convertTimeToHours(this.targetSleep);
      if (targetHours > 0) {
        this.sleepProgress = Math.min(
          Math.round((this.totalSleep / targetHours) * 100),
          100
        );
      }
    } else {
      this.sleepProgress = 0;
    }
  }

  updateHydrationProgress() {
    if (this.hasActiveGoal && this.targetHydration > 0) {
      this.hydrationProgress = Math.min(
        Math.round((this.totalHydration / this.targetHydration) * 100),
        100
      );
    } else {
      this.hydrationProgress = 0;
    }
  }

  updateAllProgress() {
    this.updateSleepProgress();
    this.updateHydrationProgress();
  }

  getProgressLevel(progress: number): string {
    if (progress === 0) return '';
    if (progress < 33) return 'low';
    if (progress < 66) return 'medium';
    return 'high';
  }

  showAlertMessage(message: string, type: string) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    
    this.alertTimeout = setTimeout(() => {
      this.showAlert = false;
      this.alertMessage = '';
    }, 3000);
  }

  convertTimeToHours(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
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
