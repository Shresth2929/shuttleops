import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { Booking } from '../../../../core/models/booking.model';
import { BookingFormComponent } from '../booking-form/booking-form.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-booking-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    BookingFormComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="drawer-backdrop" (click)="close.emit()" aria-hidden="true"></div>
    
    <aside class="booking-drawer-panel" role="dialog" aria-labelledby="drawer-heading">
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="header-left-info">
          <span class="drawer-badge font-mono" *ngIf="mode !== 'create'">{{ booking?.id }}</span>
          <h2 id="drawer-heading" class="drawer-title">
            {{ mode === 'create' ? 'Create Campus Booking' : (mode === 'edit' ? 'Edit Booking' : 'Booking Details') }}
          </h2>
        </div>
        <button mat-icon-button (click)="close.emit()" class="close-drawer-btn" aria-label="Close panel">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Drawer Content -->
      <div class="drawer-body">
        <!-- MODE: CREATE OR EDIT FORM -->
        <div *ngIf="mode === 'create' || mode === 'edit'" class="form-wrapper">
          <app-booking-form
            [booking]="booking"
            [isEditMode]="mode === 'edit'"
            (saved)="onFormSaved($event)"
            (cancelled)="close.emit()"
          ></app-booking-form>
        </div>

        <!-- MODE: VIEW DETAILS -->
        <div *ngIf="mode === 'view' && booking" class="details-wrapper">
          <!-- Top Status Card -->
          <div class="status-banner-card">
            <div class="status-row">
              <span class="status-label">Current Transit Status</span>
              <app-status-badge [status]="booking.status"></app-status-badge>
            </div>
            <div class="action-buttons-row">
              <button
                mat-stroked-button
                class="btn-action"
                (click)="editClicked.emit(booking)"
                title="Edit Booking"
              >
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>

              <button
                *ngIf="booking.status !== 'Cancelled' && booking.status !== 'Completed'"
                mat-stroked-button
                class="btn-action btn-danger-text"
                (click)="onCancelBooking()"
                title="Cancel Booking"
              >
                <mat-icon>cancel</mat-icon>
                <span>Cancel</span>
              </button>

              <button
                *ngIf="booking.status !== 'Completed' && booking.status !== 'Cancelled' && booking.status !== 'No Show'"
                mat-stroked-button
                class="btn-action"
                (click)="onMarkNoShow()"
                title="Mark No Show"
              >
                <mat-icon>person_off</mat-icon>
                <span>No Show</span>
              </button>
            </div>
          </div>

          <!-- Section: Passenger Information -->
          <div class="section-block">
            <div class="section-title">Passenger Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value font-medium">{{ booking.employeeName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ booking.employeeEmail }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Department</span>
                <span class="info-value">{{ booking.employeeDepartment }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value font-mono">{{ booking.employeePhone }}</span>
              </div>
            </div>
          </div>

          <!-- Section: Route & Location -->
          <div class="section-block">
            <div class="section-title">Route & Location Details</div>
            <div class="route-card-inner">
              <div class="route-header-line">
                <mat-icon class="route-icon">alt_route</mat-icon>
                <span class="route-name-text">{{ booking.routeName }}</span>
              </div>

              <div class="location-timeline-visual">
                <div class="loc-step start">
                  <div class="loc-dot"></div>
                  <div class="loc-data">
                    <span class="loc-type">PICKUP</span>
                    <span class="loc-name">{{ booking.pickupLocation }}</span>
                  </div>
                </div>
                <div class="loc-connector"></div>
                <div class="loc-step end">
                  <div class="loc-dot drop"></div>
                  <div class="loc-data">
                    <span class="loc-type">DROP-OFF</span>
                    <span class="loc-name">{{ booking.dropLocation }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Timings Breakdown -->
          <div class="section-block">
            <div class="section-title">Schedule & Arrival Timings</div>
            <div class="timings-grid">
              <div class="time-box">
                <span class="time-title">Requested Pickup</span>
                <span class="time-val font-mono">{{ booking.requestedPickupTime }}</span>
              </div>
              <div class="time-box">
                <span class="time-title">Planned Pickup</span>
                <span class="time-val font-mono">{{ booking.plannedPickupTime }}</span>
              </div>
              <div class="time-box">
                <span class="time-title">Actual Pickup</span>
                <span class="time-val font-mono">{{ booking.actualPickupTime || '—' }}</span>
              </div>
              <div class="time-box">
                <span class="time-title">Planned Drop</span>
                <span class="time-val font-mono">{{ booking.plannedDropTime }}</span>
              </div>
              <div class="time-box">
                <span class="time-title">Actual Drop</span>
                <span class="time-val font-mono">{{ booking.actualDropTime || '—' }}</span>
              </div>
              <div class="time-box">
                <span class="time-title">Date</span>
                <span class="time-val font-mono">{{ booking.date }}</span>
              </div>
            </div>
          </div>

          <!-- Section: Fleet & Driver Allocation -->
          <div class="section-block">
            <div class="section-title">Fleet Allocation</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Assigned Vehicle</span>
                <div class="vehicle-chip font-mono">
                  <mat-icon class="chip-icon">directions_bus</mat-icon>
                  <span>{{ booking.vehicleNumber }}</span>
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">Assigned Driver</span>
                <div class="driver-chip">
                  <mat-icon class="chip-icon">person</mat-icon>
                  <span>{{ booking.driverName }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Notes if present -->
          <div *ngIf="booking.notes" class="section-block">
            <div class="section-title">Notes & Dispatch Remarks</div>
            <p class="notes-text">{{ booking.notes }}</p>
          </div>

          <!-- Section: Timeline Activity Trail -->
          <div class="section-block">
            <div class="section-title">Booking Lifecycle History</div>
            <div class="timeline-trail">
              <div *ngFor="let event of booking.timeline" class="trail-item">
                <div class="trail-bullet"></div>
                <div class="trail-content">
                  <div class="trail-header">
                    <span class="trail-status font-semibold">{{ event.status }}</span>
                    <span class="trail-time font-mono">{{ event.timestamp }}</span>
                  </div>
                  <div class="trail-desc">{{ event.description }}</div>
                  <div class="trail-actor">By: {{ event.actor }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.4);
      z-index: 150;
    }

    .booking-drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 520px;
      max-width: 100vw;
      background: var(--so-surface);
      box-shadow: var(--so-shadow-drawer);
      z-index: 160;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .drawer-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--so-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--so-surface-hover);
    }

    .header-left-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .drawer-badge {
      font-size: 11px;
      font-weight: var(--so-fw-bold);
      color: var(--so-primary);
      background: var(--so-primary-light);
      padding: 2px 8px;
      border-radius: var(--so-radius-sm);
      display: inline-block;
      width: fit-content;
    }

    .drawer-title {
      font-size: var(--so-font-lg);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-primary);
      margin: 0;
    }

    .close-drawer-btn {
      color: var(--so-text-muted);
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .details-wrapper {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .status-banner-card {
      background-color: var(--so-bg);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .status-label {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-semibold);
      color: var(--so-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .action-buttons-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn-action {
      font-size: var(--so-font-xs) !important;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px !important;
      border-radius: var(--so-radius-md) !important;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .btn-danger-text {
      color: #DC2626 !important;
      border-color: #FECACA !important;

      &:hover {
        background-color: #FEF2F2 !important;
      }
    }

    .section-block {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section-title {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-bold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--so-text-muted);
      border-bottom: 1px solid var(--so-border-subtle);
      padding-bottom: 4px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .info-label {
      font-size: 11px;
      color: var(--so-text-muted);
    }

    .info-value {
      font-size: var(--so-font-sm);
      color: var(--so-text-primary);
    }

    .route-card-inner {
      background-color: var(--so-bg);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 12px 16px;
    }

    .route-header-line {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;

      .route-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--so-primary);
      }

      .route-name-text {
        font-size: var(--so-font-sm);
        font-weight: var(--so-fw-bold);
        color: var(--so-text-primary);
      }
    }

    .location-timeline-visual {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-left: 8px;
    }

    .loc-step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
    }

    .loc-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #10B981;
      margin-top: 4px;
      flex-shrink: 0;

      &.drop {
        background-color: #EF4444;
      }
    }

    .loc-connector {
      width: 2px;
      height: 20px;
      background-color: var(--so-border-strong);
      margin-left: 4px;
    }

    .loc-data {
      display: flex;
      flex-direction: column;
    }

    .loc-type {
      font-size: 9px;
      font-weight: var(--so-fw-bold);
      color: var(--so-text-muted);
      letter-spacing: 0.05em;
    }

    .loc-name {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-semibold);
      color: var(--so-text-primary);
    }

    .timings-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .time-box {
      background-color: var(--so-surface-hover);
      border: 1px solid var(--so-border-subtle);
      border-radius: var(--so-radius-sm);
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 2px;

      .time-title {
        font-size: 10px;
        color: var(--so-text-muted);
      }

      .time-val {
        font-size: var(--so-font-sm);
        font-weight: var(--so-fw-semibold);
        color: var(--so-text-primary);
      }
    }

    .vehicle-chip, .driver-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--so-surface-hover);
      border: 1px solid var(--so-border);
      padding: 4px 8px;
      border-radius: var(--so-radius-sm);
      font-size: var(--so-font-xs);
      color: var(--so-text-primary);

      .chip-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
        color: var(--so-primary);
      }
    }

    .notes-text {
      font-size: var(--so-font-xs);
      color: var(--so-text-secondary);
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      padding: 8px 12px;
      border-radius: var(--so-radius-sm);
      line-height: 1.4;
    }

    /* Timeline Trail */
    .timeline-trail {
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      padding-left: 14px;
      border-left: 2px solid var(--so-border);
      margin-left: 6px;
      margin-top: 6px;
    }

    .trail-item {
      position: relative;
    }

    .trail-bullet {
      position: absolute;
      left: -19px;
      top: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--so-primary);
      border: 2px solid #FFFFFF;
    }

    .trail-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .trail-status {
      font-size: var(--so-font-xs);
      color: var(--so-text-primary);
    }

    .trail-time {
      font-size: 11px;
      color: var(--so-text-muted);
    }

    .trail-desc {
      font-size: 11px;
      color: var(--so-text-secondary);
      margin-top: 2px;
    }

    .trail-actor {
      font-size: 10px;
      color: var(--so-text-muted);
      margin-top: 1px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingDrawerComponent {
  @Input() booking: Booking | null = null;
  @Input() mode: 'view' | 'edit' | 'create' = 'view';
  @Output() close = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<Booking>();
  @Output() cancelClicked = new EventEmitter<Booking>();
  @Output() noShowClicked = new EventEmitter<Booking>();
  @Output() formSubmitted = new EventEmitter<any>();

  private dialog = inject(MatDialog);

  onFormSaved(data: any): void {
    this.formSubmitted.emit(data);
  }

  onCancelBooking(): void {
    if (!this.booking) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Booking',
        message: `Are you sure you want to cancel booking ${this.booking.id} for ${this.booking.employeeName}?`,
        confirmText: 'Yes, Cancel Booking',
        cancelText: 'Keep Booking',
        isDestructive: true
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.booking) {
        this.cancelClicked.emit(this.booking);
      }
    });
  }

  onMarkNoShow(): void {
    if (!this.booking) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Mark Passenger as No Show',
        message: `Mark ${this.booking.employeeName} (${this.booking.id}) as No Show? This will update the operational dispatch status.`,
        confirmText: 'Mark No Show',
        cancelText: 'Cancel',
        isDestructive: false
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.booking) {
        this.noShowClicked.emit(this.booking);
      }
    });
  }
}
