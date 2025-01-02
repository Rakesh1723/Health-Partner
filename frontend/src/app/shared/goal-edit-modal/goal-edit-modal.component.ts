import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalLog, GoalType } from '../../models/goal-log.model';

@Component({
  selector: 'app-goal-edit-modal',
  templateUrl: './goal-edit-modal.component.html',
  styleUrls: ['./goal-edit-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class GoalEditModalComponent implements OnChanges {
  @Input() show = false;
  @Input() goalType: GoalType | null = null;
  @Input() currentGoal: GoalLog | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<GoalLog>();

  goalData: Partial<GoalLog> = {
    currentWeight: undefined,
    targetWeight: undefined,
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    targetEndDate: new Date().toISOString().split('T')[0]
  };

  GoalType = GoalType;

  ngOnChanges() {
    if (this.show) {
      if (this.currentGoal) {
        this.goalData = { ...this.currentGoal };
      } else if (this.goalType) {
        this.goalData = {
          goalType: this.goalType,
          currentWeight: undefined,
          targetWeight: undefined,
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          targetEndDate: new Date().toISOString().split('T')[0]
        };
      }
    }
  }

  onSubmit() {
    if (this.validateForm()) {
      this.save.emit(this.goalData as GoalLog);
    }
  }

  validateForm(): boolean {
    return this.validateDates() && this.validateWeights();
  }

  validateDates(): boolean {
    if (!this.goalData.startDate || !this.goalData.targetEndDate) {
      return false;
    }
    const startDate = new Date(this.goalData.startDate);
    const endDate = new Date(this.goalData.targetEndDate);
    return startDate < endDate;
  }

  validateWeights(): boolean {
    if (!this.goalData.currentWeight || !this.goalData.targetWeight) {
      return false;
    }
    
    if (this.goalType === GoalType.WEIGHT_LOSS) {
      return this.goalData.targetWeight < this.goalData.currentWeight;
    } else if (this.goalType === GoalType.WEIGHT_GAIN) {
      return this.goalData.targetWeight > this.goalData.currentWeight;
    }
    return false;
  }

  getDateValidationMessage(): string {
    if (!this.goalData.startDate || !this.goalData.targetEndDate) {
      return 'Both dates are required';
    }
    if (!this.validateDates()) {
      return 'End date must be after start date';
    }
    return '';
  }

  getWeightValidationMessage(): string {
    if (!this.goalData.currentWeight || !this.goalData.targetWeight) {
      return 'Both weights are required';
    }
    if (!this.validateWeights()) {
      if (this.goalType === GoalType.WEIGHT_LOSS) {
        return 'Target weight must be less than current weight for weight loss';
      } else {
        return 'Target weight must be greater than current weight for weight gain';
      }
    }
    return '';
  }

  onClose() {
    this.close.emit();
  }
} 