import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';
import { FitnessLog, FitnessLogDTO } from '../models/fitness-log.model';

interface CaloriesDto {
  number: number;
  totalCaloriesBurned: number;
}

interface NinjaActivityData {
  activity: string;
  calories_per_hour: number;
  duration_minutes: number;
  calories_burned: number;
}

@Injectable({
  providedIn: 'root'
})
export class FitnessService {
  private apiUrl = 'http://localhost:9000/api/v1/fitnessLogs';
  private ninjaApiUrl = 'https://api.api-ninjas.com/v1/caloriesburned';
  private ninjaApiKey = 'rjaq2qiAq31JovS0ctDuRQ==M6b14TWYSjke88NL';

  constructor(private http: HttpClient) {}

  calculateCalories(activity: string, weight: number, duration: number, intensity: string): Observable<number> {
    return new Observable<number>(observer => {
      let caloriesPerHour: number;
      
      switch(activity) {
        case 'SKIPPING':
          caloriesPerHour = 750; 
          break;
        case 'GENERAL':
          caloriesPerHour = 400; 
          break;
        case 'WEIGHTLIFTING':
          caloriesPerHour = 350; 
          break;
        default:
          const headers = new HttpHeaders().set('X-Api-Key', this.ninjaApiKey);
          
          this.http.get<NinjaActivityData[]>(
            `${this.ninjaApiUrl}?activity=${encodeURIComponent(activity.toLowerCase().replace('_', ' '))}&weight=${weight}`,
            { headers }
          ).subscribe({
            next: (response) => {
              if (response && response.length > 0) {
                caloriesPerHour = response[0].calories_per_hour;
                const adjustedCalories = this.calculateAdjustedCalories(caloriesPerHour, duration, intensity);
                observer.next(adjustedCalories);
                observer.complete();
              } else {
                observer.next(0);
                observer.complete();
              }
            },
            error: (error) => {
              console.error('API Error:', error);
              observer.error(error);
            }
          });
          return;
      }
      
      const adjustedCalories = this.calculateAdjustedCalories(caloriesPerHour, duration, intensity);
      observer.next(adjustedCalories);
      observer.complete();
    });
  }

  private calculateAdjustedCalories(caloriesPerHour: number, duration: number, intensity: string): number {
    
    let calories = (caloriesPerHour * duration) / 60;

    
    switch(intensity) {
      case 'HIGH':
        break;
      case 'MODERATE':
        calories = calories * 0.9;
        break;
      case 'LOW':
        calories = calories * 0.8;
        break;
    }

    return Math.round(calories);
  }

  getLogsByDateRange(userId: number, startDate: string, endDate: string): Observable<FitnessLog[]> {
    return this.http.get<FitnessLog[]>(
      `${this.apiUrl}/search/fitnessLogs/${userId}/?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getWeeklyReport(userId: number, startDate: string, endDate: string): Observable<CaloriesDto[]> {
    return this.http.get<CaloriesDto[]>(
      `${this.apiUrl}/${userId}/fitness/weekly-report?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getMonthlyReport(userId: number, startDate: string, endDate: string): Observable<CaloriesDto[]> {
    return this.http.get<CaloriesDto[]>(
      `${this.apiUrl}/${userId}/fitness/monthly-report?startDate=${startDate}&endDate=${endDate}`
    );
  }

  createLog(log: FitnessLogDTO): Observable<FitnessLog> {
    return this.http.post<FitnessLog>(`${this.apiUrl}/users/${log.userId}`, log);
  }

  getLogById(userId: number, logId: number): Observable<FitnessLog> {
    return this.http.get<FitnessLog>(`${this.apiUrl}/search/fitnessLogs/${userId}?logId=${logId}`);
  }
} 