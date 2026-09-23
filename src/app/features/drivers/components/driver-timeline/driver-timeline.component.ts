import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { Driver, DriverActivity, DriverActivityType } from '../../../../core/models/driver.model';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-driver-timeline',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatButtonModule, StatusBadgeComponent],
  template: `
    <div class="timeline-container">
      <!-- Legend Bar -->
      <div class="timeline-legend-bar">
        <div class="legend-title font-semibold">Activity Legend:</div>
        <div class="legend-items">
          <div class="legend-item"><span class="legend-chip trip"></span> Pickup / Drop Trip</div>
          <div class="legend-item"><span class="legend-chip break"></span> Scheduled Break</div>
          <div class="legend-item"><span class="legend-chip vehicle"></span> Vehicle Swap</div>
          <div class="legend-item"><span class="legend-chip empty"></span> Empty Leg Transfer</div>
          <div class="legend-item"><span class="legend-chip duty"></span> Shift Duty Span</div>
        </div>
      </div>

      <!-- Main Timeline Scroll Area -->
      <div class="timeline-scroll-wrapper">
        <div class="timeline-inner">
          <!-- Timeline Header Row: Time Scale 06:00 -> 22:00 -->
          <div class="timeline-header-row">
            <div class="driver-col-header">
              <span>Driver & Shift Details</span>
            </div>
            <div class="hours-scale">
              <div *ngFor="let hour of hours" class="hour-cell">
                <span class="hour-text font-mono">{{ hour }}:00</span>
                <div class="hour-tick"></div>
              </div>
            </div>
          </div>

          <!-- Driver Timeline Rows -->
          <div class="timeline-body">
            <div *ngFor="let driver of drivers" class="driver-timeline-row">
              <!-- Left Driver Card -->
              <div class="driver-col" (click)="driverSelected.emit(driver)">
                <div class="driver-avatar-circle">
                  {{ driver.name.substring(0, 2).toUpperCase() }}
                </div>
                <div class="driver-main-info">
                  <div class="driver-name-text font-semibold">{{ driver.name }}</div>
                  <div class="driver-sub-text font-mono">
                    {{ driver.shift.startTime }} - {{ driver.shift.endTime }} • {{ driver.currentVehicleNumber || 'Standby' }}
                  </div>
                </div>
                <div class="driver-status-wrap">
                  <app-status-badge [status]="driver.status"></app-status-badge>
                </div>
                <button
                  mat-icon-button
                  class="add-act-btn"
                  (click)="addActivityClicked.emit(driver); $event.stopPropagation()"
                  title="Add activity for {{ driver.name }}"
                >
                  <mat-icon>add_circle_outline</mat-icon>
                </button>
              </div>

              <!-- Right Horizontal Timeline Track -->
              <div class="timeline-track">
                <!-- Background grid hour lines -->
                <div class="grid-lines">
                  <div *ngFor="let h of hours" class="grid-line"></div>
                </div>

                <!-- Duty Shift Span Bracket Background -->
                <div
                  class="duty-shift-band"
                  [style.left.%]="calculatePercent(driver.shift.startTime)"
                  [style.width.%]="calculateDurationPercent(driver.shift.startTime, driver.shift.endTime)"
                  [matTooltip]="'Shift Window: ' + driver.shift.startTime + ' - ' + driver.shift.endTime"
                ></div>

                <!-- Activity Blocks -->
                <ng-container *ngFor="let act of driver.activities">
                  <div
                    *ngIf="act.type !== 'Duty'"
                    class="activity-block"
                    [ngClass]="getActivityClass(act.type)"
                    [style.left.%]="calculatePercent(act.startTime)"
                    [style.width.%]="calculateDurationPercent(act.startTime, act.endTime)"
                    (click)="activityClicked.emit({ driver: driver, activity: act }); $event.stopPropagation()"
                    [matTooltip]="act.type + ' (' + act.startTime + ' - ' + act.endTime + ')' + (act.routeName ? ': ' + act.routeName : '')"
                  >
                    <mat-icon class="act-icon">{{ getActivityIcon(act.type) }}</mat-icon>
                    <span class="act-label truncate">{{ act.routeName || act.type }}</span>
                    <span class="act-time font-mono">{{ act.startTime }}-{{ act.endTime }}</span>
                  </div>
                </ng-container>

                <!-- Current Time Marker (e.g. 13:30) -->
                <div class="current-time-marker" [style.left.%]="calculatePercent('13:30')">
                  <div class="time-marker-head">13:30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-lg);
      box-shadow: var(--so-shadow-subtle);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .timeline-legend-bar {
      padding: 12px 20px;
      border-bottom: 1px solid var(--so-border);
      display: flex;
      align-items: center;
      gap: 16px;
      background: var(--so-surface-hover);
      flex-wrap: wrap;

      .legend-title {
        font-size: var(--so-font-xs);
        color: var(--so-text-primary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .legend-items {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--so-text-secondary);
      }

      .legend-chip {
        width: 12px;
        height: 12px;
        border-radius: 3px;

        &.trip { background: #DCFCE7; border: 1px solid #86EFAC; }
        &.break { background: #FEF3C7; border: 1px solid #FCD34D; }
        &.vehicle { background: #F3E8FF; border: 1px solid #D8B4FE; }
        &.empty { background: #F1F5F9; border: 1px solid #CBD5E1; }
        &.duty { background: rgba(59, 130, 246, 0.1); border: 1px dashed #93C5FD; }
      }
    }

    .timeline-scroll-wrapper {
      overflow-x: auto;
      overflow-y: hidden;
      width: 100%;
    }

    .timeline-inner {
      min-width: 1000px;
      display: flex;
      flex-direction: column;
    }

    .timeline-header-row {
      display: flex;
      border-bottom: 1px solid var(--so-border);
      background: var(--so-surface-hover);
      height: 44px;
    }

    .driver-col-header {
      width: 280px;
      min-width: 280px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-right: 1px solid var(--so-border);
    }

    .hours-scale {
      flex: 1;
      display: flex;
      position: relative;
    }

    .hour-cell {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
      padding: 6px 0 0 6px;
      border-right: 1px solid var(--so-border-subtle);
      position: relative;

      .hour-text {
        font-size: 11px;
        color: var(--so-text-muted);
      }

      .hour-tick {
        width: 1px;
        height: 6px;
        background: var(--so-border);
      }
    }

    .timeline-body {
      display: flex;
      flex-direction: column;
    }

    .driver-timeline-row {
      display: flex;
      border-bottom: 1px solid var(--so-border-subtle);
      height: 68px;
      transition: background var(--so-transition-fast);

      &:hover {
        background-color: var(--so-surface-hover);
      }
    }

    .driver-col {
      width: 280px;
      min-width: 280px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-right: 1px solid var(--so-border);
      background: var(--so-surface);
      cursor: pointer;
    }

    .driver-avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #334155;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: var(--so-fw-bold);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .driver-main-info {
      flex: 1;
      min-width: 0;

      .driver-name-text {
        font-size: var(--so-font-xs);
        color: var(--so-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .driver-sub-text {
        font-size: 10px;
        color: var(--so-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .add-act-btn {
      color: var(--so-primary);
      width: 28px;
      height: 28px;
      line-height: 28px;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .timeline-track {
      flex: 1;
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .grid-lines {
      position: absolute;
      inset: 0;
      display: flex;
      pointer-events: none;
    }

    .grid-line {
      flex: 1;
      border-right: 1px solid var(--so-border-subtle);
      height: 100%;
    }

    .duty-shift-band {
      position: absolute;
      top: 6px;
      bottom: 6px;
      background-color: rgba(59, 130, 246, 0.06);
      border: 1px dashed rgba(59, 130, 246, 0.3);
      border-radius: var(--so-radius-sm);
      pointer-events: none;
    }

    .activity-block {
      position: absolute;
      top: 10px;
      bottom: 10px;
      border-radius: var(--so-radius-sm);
      padding: 0 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 11px;
      font-weight: var(--so-fw-semibold);
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
      transition: all var(--so-transition-fast);
      z-index: 10;
      min-width: 28px;
      overflow: hidden;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(0,0,0,0.12);
        z-index: 20;
      }

      .act-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      .act-label {
        font-size: 11px;
        flex: 1;
      }

      .act-time {
        font-size: 10px;
        opacity: 0.85;
      }

      &.act-trip {
        background-color: var(--so-activity-trip-bg);
        color: var(--so-activity-trip-text);
        border: 1px solid var(--so-activity-trip-border);
      }

      &.act-break {
        background-color: var(--so-activity-break-bg);
        color: var(--so-activity-break-text);
        border: 1px solid var(--so-activity-break-border);
      }

      &.act-vehicle-change {
        background-color: var(--so-activity-vehicle-change-bg);
        color: var(--so-activity-vehicle-change-text);
        border: 1px solid var(--so-activity-vehicle-change-border);
      }

      &.act-empty-leg {
        background-color: var(--so-activity-empty-leg-bg);
        color: var(--so-activity-empty-leg-text);
        border: 1px solid var(--so-activity-empty-leg-border);
      }
    }

    .current-time-marker {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: #EF4444;
      z-index: 30;
      pointer-events: none;

      .time-marker-head {
        position: absolute;
        top: 2px;
        left: -16px;
        background: #EF4444;
        color: #FFFFFF;
        font-size: 9px;
        font-weight: var(--so-fw-bold);
        padding: 1px 4px;
        border-radius: 2px;
        font-family: 'Roboto Mono', monospace;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverTimelineComponent {
  @Input({ required: true }) drivers: Driver[] = [];
  @Output() driverSelected = new EventEmitter<Driver>();
  @Output() activityClicked = new EventEmitter<{ driver: Driver; activity: DriverActivity }>();
  @Output() addActivityClicked = new EventEmitter<Driver>();

  // Timeline scale spans 06:00 to 22:00 (16 hours = 960 minutes)
  readonly startHour = 6;
  readonly endHour = 22;
  readonly totalMinutes = (this.endHour - this.startHour) * 60; // 960

  readonly hours = Array.from({ length: 16 }, (_, i) => i + 6); // [6, 7, ..., 21]

  calculatePercent(timeStr: string): number {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const minuteFromDayStart = h * 60 + m;
    const timelineStartMinute = this.startHour * 60; // 360
    const offset = minuteFromDayStart - timelineStartMinute;
    const percent = (offset / this.totalMinutes) * 100;
    return Math.max(0, Math.min(percent, 100));
  }

  calculateDurationPercent(startTime: string, endTime: string): number {
    const p1 = this.calculatePercent(startTime);
    const p2 = this.calculatePercent(endTime);
    return Math.max(p2 - p1, 1.5); // Ensure at least tiny width
  }

  getActivityClass(type: DriverActivityType): string {
    switch (type) {
      case 'Pickup/Drop': return 'act-trip';
      case 'Break': return 'act-break';
      case 'Vehicle change': return 'act-vehicle-change';
      case 'Empty leg': return 'act-empty-leg';
      default: return 'act-trip';
    }
  }

  getActivityIcon(type: DriverActivityType): string {
    switch (type) {
      case 'Pickup/Drop': return 'directions_bus';
      case 'Break': return 'coffee';
      case 'Vehicle change': return 'swap_horiz';
      case 'Empty leg': return 'alt_route';
      default: return 'schedule';
    }
  }
}
