import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface UserNameScoreDto {
  userId: number;
  userName: string;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private baseUrl = 'http://localhost:9000/api/v1/users/score';

  constructor(private http: HttpClient) { }

  getLeaderboardData(date: string): Observable<UserNameScoreDto[]> {
    return this.http.get<UserNameScoreDto[]>(`${this.baseUrl}/allTime?day=${date}`);
  }
} 