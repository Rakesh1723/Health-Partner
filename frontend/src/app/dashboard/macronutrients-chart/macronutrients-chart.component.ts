import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { DietService } from '../../services/diet.service';
import { formatDate } from '@angular/common';
import { Observable, map, firstValueFrom } from 'rxjs';
import { DietCaloriesDto } from '../../models/diet-calories-dto.model';
import { DietLog } from '../../models/diet-log.model';
import { HttpClient } from '@angular/common/http';

Chart.register(...registerables);

@Component({
  selector: 'app-macronutrients-chart',
  templateUrl: './macronutrients-chart.component.html',
  styleUrls: ['./macronutrients-chart.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class MacronutrientsChartComponent implements OnInit {
  @Input() selectedPeriod: string = 'week';
  @Input() viewType: 'total' | 'average' = 'total';
  
  private chart: Chart | undefined;

  constructor(private dietService: DietService, private http: HttpClient) {}

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

      let dataObservable: Observable<{ labels: string[], values: any }>;

      switch (this.selectedPeriod) {
        case 'week':
          dataObservable = this.dietService.getLogsByDateRange(userId, formattedStartDate, formattedEndDate)
            .pipe(map(logs => this.processWeeklyData(logs)));
          break;
        case 'month':
          dataObservable = this.dietService.getWeeklyReport(userId, formattedStartDate, formattedEndDate)
            .pipe(map(data => this.processMonthlyData(data, startDate)));
          break;
        case 'year':
          dataObservable = this.dietService.getMonthlyReport(userId, formattedStartDate, formattedEndDate)
            .pipe(map(data => this.processYearlyData(data)));
          break;
        default:
          return;
      }

      dataObservable.subscribe({
        next: (data) => {
          if (this.viewType === 'average') {
            const averageValues = {
              proteins: this.calculateAverageValues(data.values.proteins, this.selectedPeriod, startDate),
              carbs: this.calculateAverageValues(data.values.carbs, this.selectedPeriod, startDate),
              fats: this.calculateAverageValues(data.values.fats, this.selectedPeriod, startDate)
            };
            this.updateChart(data.labels, averageValues);
          } else {
            this.updateChart(data.labels, data.values);
          }
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
    } catch (error) {
      console.error('Error in createChart:', error);
    }
  }

  private processWeeklyData(logs: DietLog[]): { labels: string[], values: any } {
    const groupedData: any = {};
    const startDate = this.getDateRange().startDate;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = formatDate(date, 'MMM d', 'en-US');
      groupedData[dateStr] = {
        proteins: 0,
        carbs: 0,
        fats: 0
      };
    }

    logs.forEach(log => {
      if (log.createdAt) {
        const logDate = new Date(log.createdAt);
        const dateStr = formatDate(logDate, 'MMM d', 'en-US');
        if (dateStr in groupedData) {
          groupedData[dateStr].proteins += log.protein || 0;
          groupedData[dateStr].carbs += log.carbs || 0;
          groupedData[dateStr].fats += log.fat || 0;
        }
      }
    });

    const sortedDates = Object.keys(groupedData);
    
    return {
      labels: sortedDates,
      values: {
        proteins: sortedDates.map(date => groupedData[date].proteins),
        carbs: sortedDates.map(date => groupedData[date].carbs),
        fats: sortedDates.map(date => groupedData[date].fats)
      }
    };
  }

  private processMonthlyData(data: DietCaloriesDto[], startDate: Date): { labels: string[], values: any } {
    const monthName = formatDate(startDate, 'MMM', 'en-US');
    const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const totalWeeks = Math.ceil(lastDay.getDate() / 7);

    const labels = Array.from(
      { length: totalWeeks }, 
      (_, i) => `${monthName} Week ${i + 1}`
    );
    const values = {
      proteins: new Array(totalWeeks).fill(0),
      carbs: new Array(totalWeeks).fill(0),
      fats: new Array(totalWeeks).fill(0)
    };

    const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const firstWeekOfYear = 1 + Math.floor(
      (firstDay.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    data.forEach(weekData => {
      const weekOfMonth = weekData.number - firstWeekOfYear;
      if (weekOfMonth >= 0 && weekOfMonth < totalWeeks) {
        values.proteins[weekOfMonth] = weekData.totalProteins;
        values.carbs[weekOfMonth] = weekData.totalCarbs;
        values.fats[weekOfMonth] = weekData.totalFats;
      }
    });

    return { labels, values };
  }

  private processYearlyData(data: DietCaloriesDto[]): { labels: string[], values: any } {
    const allMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const values = {
      proteins: new Array(12).fill(0),
      carbs: new Array(12).fill(0),
      fats: new Array(12).fill(0)
    };
    
    data.forEach(monthData => {
      if (monthData.number >= 1 && monthData.number <= 12) {
        values.proteins[monthData.number - 1] = monthData.totalProteins;
        values.carbs[monthData.number - 1] = monthData.totalCarbs;
        values.fats[monthData.number - 1] = monthData.totalFats;
      }
    });

    return { labels: allMonths, values };
  }

  private updateChart(labels: string[], values: any): void {
    const ctx = document.getElementById('macronutrientsChart') as HTMLCanvasElement;
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Proteins',
            data: values.proteins,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false
          },
          {
            label: 'Carbs',
            data: values.carbs,
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false
          },
          {
            label: 'Fats',
            data: values.fats,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false
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
            displayColors: true,
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
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
              }
            }
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
        }
      }
    };

    this.chart = new Chart(ctx, config);
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
          
          return value / 7; 
        });

      case 'year':
        return values.map((value, monthIndex) => {
          if (value === 0) return 0;
          const daysInMonth = new Date(startDate.getFullYear(), monthIndex + 1, 0).getDate();
          return value / daysInMonth;
        });

      default:
        return values;
    }
  }
} 