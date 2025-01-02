import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class NotificationComponent {
  @Input() message = '';
  @Input() type = '';
  @Output() close = new EventEmitter<void>();

  closeNotification() {
    this.close.emit();
  }
}
