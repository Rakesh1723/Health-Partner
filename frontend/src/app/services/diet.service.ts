import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DietLog } from '../models/diet-log.model';
import { DietCaloriesDto } from '../models/diet-calories-dto.model';

@Injectable({
  providedIn: 'root'
})
export class DietService {
  private apiUrl = 'http://localhost:9000/api/v1/dietLogs';

  constructor(private http: HttpClient) {}

  getLogsByDateRange(userId: number, startDate: string, endDate: string): Observable<DietLog[]> {
    return this.http.get<DietLog[]>(
      `${this.apiUrl}/search/DietLogs/${userId}?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getWeeklyReport(userId: number, startDate: string, endDate: string): Observable<DietCaloriesDto[]> {
    return this.http.get<DietCaloriesDto[]>(
      `${this.apiUrl}/${userId}/DietLogs/weekly-report?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getMonthlyReport(userId: number, startDate: string, endDate: string): Observable<DietCaloriesDto[]> {
    return this.http.get<DietCaloriesDto[]>(
      `${this.apiUrl}/${userId}/DietLogs/monthly-report?startDate=${startDate}&endDate=${endDate}`
    );
  }
} 