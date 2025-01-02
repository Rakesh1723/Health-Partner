import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { WellnessService } from '../../services/wellness.service';
import { formatDate } from '@angular/common';
import { Observable, map, of, firstValueFrom } from 'rxjs';
import { WellnessLog } from '../../models/wellness-log.model';
import { HttpClient } from '@angular/common/http';

Chart.register(...registerables);

interface GroupedData {
  [key: string]: number;
}

interface SleepDto {
  number: number;
  sleepDuration: number;
}

@Component({
  selector: 'app-sleep-analysis-chart',
  templateUrl: './sleep-analysis-chart.component.html',
  styleUrls: ['./sleep-analysis-chart.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SleepAnalysisChartComponent implements OnInit {
  @Input() selectedPeriod: string = 'week';
  @Input() viewType: 'total' | 'average' = 'total';
  
  private chart: Chart | undefined;

  constructor(private wellnessService: WellnessService, private http: HttpClient) {}

  ngOnInit() {
    this.createChart();
  }

  ngOnChanges() {
    this.createChart();
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
            const daysElapsed = now.getDate();
            return value / daysElapsed;
          }
          
          return 0;
        });

      default:
        return values;
    }
  }

  private async getUserId(): Promise<number> {
    try {
      const token = sessionStorage.getItem('hp-token');
      if (!token) {
        throw new Error('No token found');
      }

      // Get email from token
      const userEmail = await firstValueFrom(
        this.http.get(`http://localhost:9000/jwtToken/${token}`, { 
          responseType: 'text'
        })
      );

      if (!userEmail) {
        throw new Error('No email found');
      }

      // Get userId using email - expect direct number response
      const userId = await firstValueFrom(
        this.http.get<number>(`http://localhost:9000/api/v1/users/userId/${userEmail}`)
      );

      if (userId === undefined || userId === null) {
        throw new Error('No user ID found');
      }

      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return 1; // Fallback to default user ID
    }
  }

  private async createChart(): Promise<void> {
    try {
      const userId = await this.getUserId();
      const { startDate, endDate } = this.getDateRange();
      
      const formattedStartDate = formatDate(startDate, 'dd-MM-yyyy', 'en-US');
      const formattedEndDate = formatDate(endDate, 'dd-MM-yyyy', 'en-US');

      let dataObservable: Observable<{ labels: string[], values: number[] }> = of({ labels: [], values: [] });

      switch (this.selectedPeriod) {
        case 'week':
          dataObservable = this.wellnessService.getLogsByDateRange(userId, formattedStartDate, formattedEndDate)
            .pipe(
              map(logs => this.processWeeklyData(logs))
            );
          break;
        case 'month':
          dataObservable = this.wellnessService.getWeeklyReport(userId, formattedStartDate, formattedEndDate)
            .pipe(
              map(data => this.processMonthlyData(data, startDate))
            );
          break;
        case 'year':
          dataObservable = this.wellnessService.getMonthlyReport(userId, formattedStartDate, formattedEndDate)
            .pipe(
              map(data => this.processYearlyData(data))
            );
          break;
      }

      dataObservable = dataObservable.pipe(
        map(data => {
          if (this.viewType === 'average') {
            const averageValues = this.calculateAverageValues(data.values, this.selectedPeriod, startDate);
            return {
              labels: data.labels,
              values: averageValues
            };
          }
          return data;
        })
      );

      dataObservable.subscribe({
        next: (data) => {
          this.updateChart(data.labels, data.values);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
    } catch (error) {
      console.error('Error in createChart:', error);
    }
  }

  private processWeeklyData(logs: WellnessLog[]): { labels: string[], values: number[] } {
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
          groupedData[dateStr] += log.sleepDuration;
        }
      }
    });

    return {
      labels: Object.keys(groupedData),
      values: Object.values(groupedData)
    };
  }

  private processMonthlyData(data: SleepDto[], startDate: Date): { labels: string[], values: number[] } {
    const monthName = formatDate(startDate, 'MMM', 'en-US');
    const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const totalWeeks = Math.ceil(lastDay.getDate() / 7);

    const labels = Array.from(
      { length: totalWeeks }, 
      (_, i) => `${monthName} Week ${i + 1}`
    );
    const values = new Array(totalWeeks).fill(0);

    const firstWeekOfYear = 1 + Math.floor(
      (startDate.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    data.forEach(weekData => {
      const weekOfMonth = weekData.number - firstWeekOfYear;
      if (weekOfMonth >= 0 && weekOfMonth < totalWeeks) {
        values[weekOfMonth] = weekData.sleepDuration;
      }
    });

    return { labels, values };
  }

  private processYearlyData(data: SleepDto[]): { labels: string[], values: number[] } {
    const allMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const values = new Array(12).fill(0);
    
    data.forEach(monthData => {
      if (monthData.number >= 1 && monthData.number <= 12) {
        values[monthData.number - 1] = monthData.sleepDuration;
      }
    });

    return { labels: allMonths, values };
  }

  private updateChart(labels: string[], values: number[]) {
    const ctx = document.getElementById('sleepAnalysisChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Canvas element not found');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const formatYAxisLabel = (value: number): string => {
      if (this.viewType === 'total' && this.selectedPeriod !== 'week') {
        return `${value}h`;
      }
      return `${Math.round(value)}h`;
    };

    const maxValue = Math.max(...values, 12);
    const getYAxisMax = () => {
      if (this.viewType === 'average') {
        return Math.min(Math.ceil(maxValue * 1.2), 12);
      }
      if (this.selectedPeriod === 'week') {
        return Math.min(Math.ceil(maxValue * 1.2), 24);
      }
      return Math.ceil(Math.max(maxValue * 1.2, 24) / 8) * 8;
    };

    const getStepSize = () => {
      if (this.viewType === 'average' || this.selectedPeriod === 'week') {
        return 1;
      }
      return 8;
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sleep Duration',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          tension: 0.4,  
          fill: true    
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#4bc0c0',
            bodyColor: 'white',
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);
                const timeStr = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
                const periodLabel = this.viewType === 'average' ? ' per day' : '';
                return `${timeStr}${periodLabel} of sleep`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: (value) => formatYAxisLabel(value as number),
              stepSize: getStepSize()
            },
            max: getYAxisMax()
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              maxRotation: this.selectedPeriod === 'month' ? 45 : 0
            }
          }
        },
        elements: {
          line: {
            tension: 0.4 
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
} 