import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { DietService } from '../../services/diet.service';
import { formatDate } from '@angular/common';
import { Observable, map, of, combineLatest, firstValueFrom } from 'rxjs';
import { DietLog } from '../../models/diet-log.model';
import { DietCaloriesDto } from '../../models/diet-calories-dto.model';
import { FitnessService } from '../../services/fitness.service';
import { FitnessLog } from '../../models/fitness-log.model';
import { CaloriesDto } from '../../models/calories-dto.model';
import { HttpClient } from '@angular/common/http';

Chart.register(...registerables);

interface GroupedData {
  [key: string]: number;
}

@Component({
  selector: 'app-calories-analysis-chart',
  templateUrl: './calories-analysis-chart.component.html',
  styleUrls: ['./calories-analysis-chart.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CaloriesAnalysisChartComponent implements OnInit {
  @Input() selectedPeriod: string = 'week';
  @Input() viewType: 'total' | 'average' = 'total';
  
  private chart: Chart | undefined;

  constructor(
    private dietService: DietService,
    private fitnessService: FitnessService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(): void {
    this.createChart();
  }

  private async getUserId(): Promise<number> {
    try {
      const token = sessionStorage.getItem('hp-token');
      if (!token) {
        throw new Error('No token found');
      }

      // Get email from token
      const userEmail = await firstValueFrom(
        this.http.get<string>(`http://localhost:9000/jwtToken/${token}`, { responseType: 'text' as 'json' })
      );

      if (!userEmail) {
        throw new Error('No email found');
      }

      // Get userId using email
      const userId = await firstValueFrom(
        this.http.get<number>(`http://localhost:9000/api/v1/users/userId/${userEmail}`)
      );

      if (!userId) {
        throw new Error('No user ID found');
      }

      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      // Return a default value or handle the error appropriately
      return 1; // Temporarily return 1 as fallback
    }
  }

  private async createChart(): Promise<void> {
    try {
      const userId = await this.getUserId();
      const { startDate, endDate } = this.getDateRange();
      
      const formattedStartDate = formatDate(startDate, 'dd-MM-yyyy', 'en-US');
      const formattedEndDate = formatDate(endDate, 'dd-MM-yyyy', 'en-US');

      let consumedDataObservable: Observable<{ labels: string[], values: number[] }>;
      let burnedDataObservable: Observable<{ labels: string[], values: number[] }>;

      switch (this.selectedPeriod) {
        case 'week':
          consumedDataObservable = this.dietService.getLogsByDateRange(userId, formattedStartDate, formattedEndDate)
            .pipe(map(logs => this.processWeeklyData(logs)));
          burnedDataObservable = this.fitnessService.getLogsByDateRange(userId, formattedStartDate, formattedEndDate)
            .pipe(map(logs => this.processWeeklyFitnessData(logs)));
          break;
        case 'month':
          consumedDataObservable = this.dietService.getWeeklyReport(userId, formattedStartDate, formattedEndDate)
            .pipe(map(data => this.processMonthlyData(data, startDate)));
          burnedDataObservable = this.fitnessService.getWeeklyReport(userId, formattedStartDate, formattedEndDate)
            .pipe(map(data => this.processMonthlyFitnessData(data, startDate)));
          break;
        case 'year':
          consumedDataObservable = this.dietService.getMonthlyReport(userId, formattedStartDate, formattedEndDate)
            .pipe(map(data => this.processYearlyData(data)));
          burnedDataObservable = this.fitnessService.getMonthlyReport(userId, formattedStartDate, formattedEndDate)
            .pipe(map(data => this.processYearlyFitnessData(data)));
          break;
        default:
          return;
      }

      combineLatest([consumedDataObservable, burnedDataObservable])
        .pipe(
          map(([consumedData, burnedData]) => {
            if (this.viewType === 'average') {
              const averageConsumed = this.calculateAverageValues(consumedData.values, this.selectedPeriod, startDate);
              const averageBurned = this.calculateAverageValues(burnedData.values, this.selectedPeriod, startDate);
              return {
                labels: consumedData.labels,
                consumedValues: averageConsumed,
                burnedValues: averageBurned
              };
            }
            return {
              labels: consumedData.labels,
              consumedValues: consumedData.values,
              burnedValues: burnedData.values
            };
          })
        )
        .subscribe({
          next: (data) => {
            this.updateChart(data.labels, data.consumedValues, data.burnedValues);
          },
          error: (error) => {
            console.error('Error fetching data:', error);
          }
        });
    } catch (error) {
      console.error('Error in createChart:', error);
    }
  }

  private getDateRange(): { startDate: Date, endDate: Date } {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (this.selectedPeriod) {
      case 'week':
        const currentDay = now.getDay();
        const diff = currentDay === 0 ? -6 : 1 - currentDay;
        startDate.setDate(now.getDate() + diff);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(startDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    return { startDate, endDate };
  }

  private calculateAverageValues(values: number[], period: string, startDate: Date): number[] {
    const now = new Date();
    
    switch (period) {
      case 'month':
        return values.map((value, weekIndex) => {
          if (value === 0) return 0;

          const weekStartDate = new Date(startDate);
          const firstDayOfMonth = weekStartDate.getDay();
          
          if (weekIndex === 0) {
            if (firstDayOfMonth === 0) {
              weekStartDate.setHours(0, 0, 0, 0);
              const weekEndDate = new Date(weekStartDate);
              weekEndDate.setDate(weekStartDate.getDate() + 6);
              weekEndDate.setHours(23, 59, 59, 999);

              if (weekEndDate < now) {
                return value / 7;
              } else if (now >= weekStartDate && now <= weekEndDate) {
                const daysElapsed = Math.max(
                  Math.floor((now.getTime() - weekStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1,
                  1
                );
                return value / daysElapsed;
              }
              return 0;
            }
            const daysInFirstWeek = 8 - firstDayOfMonth;
            weekStartDate.setHours(0, 0, 0, 0);
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + (daysInFirstWeek - 1));
            weekEndDate.setHours(23, 59, 59, 999);

            if (weekEndDate < now) {
              return value / daysInFirstWeek;
            } else if (now >= weekStartDate && now <= weekEndDate) {
              const daysElapsed = Math.max(
                Math.floor((now.getTime() - weekStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1,
                1
              );
              return value / daysElapsed;
            }
            return 0;
          }

          const daysToFirstMonday = firstDayOfMonth === 0 ? 1 : (8 - firstDayOfMonth);
          weekStartDate.setDate(weekStartDate.getDate() + daysToFirstMonday + ((weekIndex - 1) * 7));
          weekStartDate.setHours(0, 0, 0, 0);
          
          const weekEndDate = new Date(weekStartDate);
          weekEndDate.setDate(weekStartDate.getDate() + 6);
          weekEndDate.setHours(23, 59, 59, 999);

          if (weekEndDate < now) {
            return value / 7;
          }
          
          if (now >= weekStartDate && now <= weekEndDate) {
            const daysElapsed = Math.max(
              Math.floor((now.getTime() - weekStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1,
              1
            );
            return value / daysElapsed;
          }
          
          return 0;
        });

      case 'year':
        return values.map((value, monthIndex) => {
          if (value === 0) return 0;

          const monthStartDate = new Date(startDate.getFullYear(), monthIndex, 1);
          monthStartDate.setHours(0, 0, 0, 0);
          
          const monthEndDate = new Date(startDate.getFullYear(), monthIndex + 1, 0);
          monthEndDate.setHours(23, 59, 59, 999);

          if (monthEndDate < now) {
            const daysInMonth = new Date(startDate.getFullYear(), monthIndex + 1, 0).getDate();
            return value / daysInMonth;
          }
          
          if (now >= monthStartDate && now <= monthEndDate) {
            const daysElapsed = Math.max(now.getDate(), 1);
            return value / daysElapsed;
          }
          
          return 0;
        });

      default:
        return values;
    }
  }

  private processWeeklyData(logs: DietLog[]): { labels: string[], values: number[] } {
    const groupedData: GroupedData = {};
    const startDate = this.getDateRange().startDate;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = formatDate(date, 'MMM d', 'en-US');
      groupedData[dateStr] = 0;
    }

    logs.forEach(log => {
      if (log.createdAt) {
        const logDate = new Date(log.createdAt);
        const dateStr = formatDate(logDate, 'MMM d', 'en-US');
        if (dateStr in groupedData) {
          groupedData[dateStr] += log.caloriesConsumed;
        }
      }
    });

    return {
      labels: Object.keys(groupedData),
      values: Object.values(groupedData)
    };
  }

  private processWeeklyFitnessData(logs: FitnessLog[]): { labels: string[], values: number[] } {
    const groupedData: GroupedData = {};
    const startDate = this.getDateRange().startDate;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = formatDate(date, 'MMM d', 'en-US');
      groupedData[dateStr] = 0;
    }

    logs.forEach(log => {
      if (log.createdAt) {
        const logDate = new Date(log.createdAt);
        const dateStr = formatDate(logDate, 'MMM d', 'en-US');
        if (dateStr in groupedData) {
          groupedData[dateStr] += log.caloriesBurned;
        }
      }
    });

    return {
      labels: Object.keys(groupedData),
      values: Object.values(groupedData)
    };
  }

  private processMonthlyData(data: DietCaloriesDto[], startDate: Date): { labels: string[], values: number[] } {
    const monthName = formatDate(startDate, 'MMM', 'en-US');
    const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const totalWeeks = Math.ceil(lastDay.getDate() / 7);

    const labels = Array.from(
      { length: totalWeeks }, 
      (_, i) => `${monthName} Week ${i + 1}`
    );
    const values = new Array(totalWeeks).fill(0);

    const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const firstWeekOfYear = 1 + Math.floor(
      (firstDay.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    data.forEach(weekData => {
      const weekOfMonth = weekData.number - firstWeekOfYear;
      if (weekOfMonth >= 0 && weekOfMonth < totalWeeks) {
        values[weekOfMonth] = weekData.totalCalories;
      }
    });

    return { labels, values };
  }

  private processMonthlyFitnessData(data: CaloriesDto[], startDate: Date): { labels: string[], values: number[] } {
    const monthName = formatDate(startDate, 'MMM', 'en-US');
    const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const totalWeeks = Math.ceil(lastDay.getDate() / 7);

    const labels = Array.from(
      { length: totalWeeks }, 
      (_, i) => `${monthName} Week ${i + 1}`
    );
    const values = new Array(totalWeeks).fill(0);

    const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const firstWeekOfYear = 1 + Math.floor(
      (firstDay.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    data.forEach(weekData => {
      const weekOfMonth = weekData.number - firstWeekOfYear;
      if (weekOfMonth >= 0 && weekOfMonth < totalWeeks) {
        values[weekOfMonth] = weekData.totalCaloriesBurned;
      }
    });

    return { labels, values };
  }

  private processYearlyData(data: DietCaloriesDto[]): { labels: string[], values: number[] } {
    const allMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const values = new Array(12).fill(0);
    
    data.forEach(monthData => {
      if (monthData.number >= 1 && monthData.number <= 12) {
        values[monthData.number - 1] = monthData.totalCalories;
      }
    });

    return { labels: allMonths, values };
  }

  private processYearlyFitnessData(data: CaloriesDto[]): { labels: string[], values: number[] } {
    const allMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const values = new Array(12).fill(0);
    
    data.forEach(monthData => {
      if (monthData.number >= 1 && monthData.number <= 12) {
        values[monthData.number - 1] = monthData.totalCaloriesBurned;
      }
    });

    return { labels: allMonths, values };
  }

  private updateChart(labels: string[], consumedValues: number[], burnedValues: number[]): void {
    const ctx = document.getElementById('caloriesAnalysisChart') as HTMLCanvasElement;
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Calories Consumed',
            data: consumedValues,
            backgroundColor: 'rgba(75, 192, 92, 0.3)',
            borderColor: 'rgba(75, 192, 92, 1)',
            borderWidth: 2,
            borderRadius: this.selectedPeriod === 'year' ? 4 : 6,
            hoverBackgroundColor: 'rgba(75, 192, 92, 0.5)',
            barPercentage: this.selectedPeriod === 'year' ? 0.8 : 0.9,
            categoryPercentage: 0.8
          },
          {
            label: 'Calories Burned',
            data: burnedValues,
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            borderRadius: this.selectedPeriod === 'year' ? 4 : 6,
            hoverBackgroundColor: 'rgba(255, 99, 132, 0.5)',
            barPercentage: this.selectedPeriod === 'year' ? 0.8 : 0.9,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              padding: 10,
              font: {
                size: 11,
                weight: 'bold'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#4bc0c0',
            bodyColor: 'white',
            padding: 12,
            displayColors: false,
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                const formattedValue = value.toLocaleString();
                const periodLabel = this.viewType === 'average' ? ' per day' : '';
                const type = context.dataset.label?.includes('Consumed') ? 'consumed' : 'burned';
                return `${formattedValue} calories${periodLabel} ${type}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              display: true
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              padding: 8,
              font: {
                size: 11,
                weight: 'bold'
              },
              callback: (value) => value.toLocaleString(),
              maxTicksLimit: 10
            },
            min: 0,
            suggestedMin: 0,
            suggestedMax: this.getYAxisMax(Math.max(...consumedValues, ...burnedValues))
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              padding: this.selectedPeriod === 'year' ? 6 : 8,
              font: {
                size: this.selectedPeriod === 'year' ? 12 : 13,
                weight: 'bold'
              },
              maxRotation: this.selectedPeriod === 'month' ? 45 : 0
            }
          }
        },
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: this.selectedPeriod === 'year' ? 15 : 10,
            left: 10
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private getYAxisMax(maxValue: number): number {
    if (this.viewType === 'average') {
      if (this.selectedPeriod === 'month') {
        return Math.min(Math.ceil(maxValue * 1.2), 3000);
      }
      return Math.min(Math.ceil(maxValue * 1.2), 4000);
    }
    return Math.min(Math.ceil(maxValue * 1.2), 5000);
  }
} 