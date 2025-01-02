import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WellnessLog } from '../models/wellness-log.model';

@Injectable({
  providedIn: 'root'
})
export class WellnessService {
  private baseUrl = 'http://localhost:9000/api/v1/wellnessLogs';

  constructor(private http: HttpClient) {}

  getLogsByDateRange(userId: number, startDate: string, endDate: string): Observable<WellnessLog[]> {
    return this.http.get<WellnessLog[]>(
      `${this.baseUrl}/search/WellnessLogs/${userId}/?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getWeeklyReport(userId: number, startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${userId}/WellnessLogs/weekly-report?startDate=${startDate}&endDate=${endDate}`
    );
  }

  getMonthlyReport(userId: number, startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${userId}/WellnessLogs/monthly-report?startDate=${startDate}&endDate=${endDate}`
    );
  }
} 