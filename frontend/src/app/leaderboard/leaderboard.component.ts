import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardService } from '../services/leaderboard.service';
import { format } from 'date-fns';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';

interface UserNameScoreDto {
  userId: number;
  userName: string;
  score: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, NavBarComponent],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  leaderboardData: UserNameScoreDto[] = [];
  currentPage = 0;
  itemsPerPage = 10;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit() {
    this.loadLeaderboardData();
  }

  loadLeaderboardData() {
    const today = format(new Date(), 'dd-MM-yyyy');
    this.leaderboardService.getLeaderboardData(today).subscribe(
      (data) => {
        this.leaderboardData = data;
      },
      (error) => {
        console.error('Error fetching leaderboard data:', error);
      }
    );
  }

  get paginatedData(): UserNameScoreDto[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.leaderboardData.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.leaderboardData.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  getBadgeClass(index: number): string {
    switch (index) {
      case 0: return 'gold';
      case 1: return 'silver';
      case 2: return 'bronze';
      default: return '';
    }
  }

  formatScore(score: number): number {
    return Math.round(score);
  }
}
