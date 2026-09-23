import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BookingStatus } from '../../../core/models/booking.model';
import { DriverStatus } from '../../../core/models/driver.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <span
      class="status-badge"
      [ngClass]="badgeClass"
      [attr.aria-label]="'Status: ' + status"
      role="status"
    >
      <span class="badge-dot" aria-hidden="true"></span>
      <mat-icon *ngIf="iconName" class="badge-icon" aria-hidden="true">{{ iconName }}</mat-icon>
      <span>{{ status }}</span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    .badge-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      line-height: 13px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  @Input({ required: true }) status: BookingStatus | DriverStatus | string = 'Requested';

  get badgeClass(): string {
    const s = this.status.toLowerCase().replace(/\s+/g, '-');
    return `status-${s}`;
  }

  get iconName(): string | null {
    switch (this.status) {
      case 'Accepted':
      case 'Completed':
      case 'Available':
        return 'check_circle';
      case 'Requested':
      case 'Waiting':
        return 'schedule';
      case 'On Going':
      case 'On Trip':
        return 'directions_bus';
      case 'Cancelled':
      case 'Declined':
        return 'cancel';
      case 'No Show':
        return 'person_off';
      case 'On Break':
        return 'coffee';
      case 'Off Duty':
        return 'nightlight';
      default:
        return null;
    }
  }
}
