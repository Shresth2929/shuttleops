import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

import { Route } from '../../../../core/models/route.model';
import { DriverService } from '../../../../core/services/driver.service';
import { VehicleService } from '../../../../core/services/vehicle.service';

@Component({
  selector: 'app-route-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSelectModule, MatDividerModule],
  template: `
    <div class="drawer-backdrop" (click)="close.emit()" aria-hidden="true"></div>

    <aside class="route-drawer-panel" role="dialog" aria-labelledby="route-drawer-title">
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="header-left">
          <span class="route-code-badge font-mono">{{ route?.code }}</span>
          <h2 id="route-drawer-title" class="drawer-title">{{ route?.name }}</h2>
        </div>
        <button mat-icon-button (click)="close.emit()" class="close-drawer-btn" aria-label="Close route panel">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Drawer Content -->
      <div class="drawer-body" *ngIf="route">
        <!-- Route KPI Summary -->
        <div class="route-stats-bar">
          <div class="route-stat-box">
            <span class="stat-num font-mono">{{ route.stops.length }}</span>
            <span class="stat-lbl">Transit Stops</span>
          </div>
          <div class="route-stat-box">
            <span class="stat-num font-mono">{{ route.estimatedDurationMinutes }} min</span>
            <span class="stat-lbl">Est. Duration</span>
          </div>
          <div class="route-stat-box">
            <span class="stat-num font-mono">{{ route.distanceKm }} km</span>
            <span class="stat-lbl">Total Distance</span>
          </div>
          <div class="route-stat-box">
            <span class="stat-num font-mono">{{ route.dailyTripsCount }}</span>
            <span class="stat-lbl">Daily Trips</span>
          </div>
        </div>

        <!-- Stop Sequence Visualizer (HTML/CSS Step Map) -->
        <div class="section-card">
          <div class="section-title">Campus Stop Sequence & Offsets</div>
          
          <div class="stop-sequence-trail">
            <div *ngFor="let stop of route.stops; let isFirst = first; let isLast = last" class="stop-step-item">
              <div class="stop-indicator">
                <div class="stop-node" [class.hub]="stop.isMajorHub" [class.terminus]="isFirst || isLast">
                  <mat-icon *ngIf="isFirst" class="node-icon">trip_origin</mat-icon>
                  <mat-icon *ngIf="isLast" class="node-icon">place</mat-icon>
                  <span *ngIf="!isFirst && !isLast" class="node-num font-mono">{{ stop.sequence }}</span>
                </div>
                <div *ngIf="!isLast" class="stop-line"></div>
              </div>

              <div class="stop-info">
                <div class="stop-header">
                  <span class="stop-name font-semibold">{{ stop.name }}</span>
                  <span *ngIf="stop.isMajorHub" class="hub-badge">Major Hub</span>
                </div>
                <div class="stop-offset font-mono">
                  +{{ stop.timeOffsetMinutes }} mins from departure
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Driver & Vehicle Assignments -->
        <div class="section-card">
          <div class="section-title">Fleet Dispatch Assignments</div>

          <div class="assignment-row">
            <div class="assignment-col">
              <label class="assign-label">Assigned Shuttle Vehicle</label>
              <select
                [ngModel]="route.assignedVehicleId"
                (ngModelChange)="onVehicleChanged($event)"
                class="so-select w-full"
              >
                <option *ngFor="let v of vehicles()" [value]="v.id">
                  {{ v.vehicleNumber }} • {{ v.type }} ({{ v.capacity }} seats)
                </option>
              </select>
            </div>

            <div class="assignment-col">
              <label class="assign-label">Assigned Driver</label>
              <select
                [ngModel]="route.assignedDriverId"
                (ngModelChange)="onDriverChanged($event)"
                class="so-select w-full"
              >
                <option *ngFor="let d of drivers()" [value]="d.id">
                  {{ d.name }} • {{ d.status }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Peak Information -->
        <div class="peak-info-banner">
          <mat-icon class="banner-icon">schedule</mat-icon>
          <div class="banner-text">
            <strong>Peak Demand Hours:</strong> {{ route.peakHour }}. High passenger density on engineering and hostel junctions.
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

    .route-drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 500px;
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

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .route-code-badge {
      font-size: 11px;
      font-weight: var(--so-fw-bold);
      color: var(--so-primary);
      background: var(--so-primary-light);
      padding: 2px 8px;
      border-radius: var(--so-radius-sm);
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
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .route-stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      background: var(--so-bg);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 12px;
    }

    .route-stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .stat-num {
        font-size: var(--so-font-base);
        font-weight: var(--so-fw-bold);
        color: var(--so-text-primary);
      }

      .stat-lbl {
        font-size: 10px;
        color: var(--so-text-muted);
        margin-top: 2px;
      }
    }

    .section-card {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
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

    /* Stop Sequence Visualizer */
    .stop-sequence-trail {
      display: flex;
      flex-direction: column;
      padding-left: 8px;
    }

    .stop-step-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
    }

    .stop-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 24px;
    }

    .stop-node {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--so-surface);
      border: 2px solid var(--so-primary);
      color: var(--so-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: var(--so-fw-bold);
      z-index: 2;

      &.hub {
        background: var(--so-primary-light);
        border-width: 2.5px;
      }

      &.terminus {
        background: var(--so-primary);
        color: #FFFFFF;

        .node-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
    }

    .stop-line {
      width: 2px;
      height: 34px;
      background-color: var(--so-border-strong);
      margin: 2px 0;
    }

    .stop-info {
      flex: 1;
      padding-bottom: 20px;
    }

    .stop-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stop-name {
      font-size: var(--so-font-sm);
      color: var(--so-text-primary);
    }

    .hub-badge {
      font-size: 9px;
      font-weight: var(--so-fw-bold);
      background: #EFF6FF;
      color: #1E40AF;
      border: 1px solid #BFDBFE;
      padding: 1px 6px;
      border-radius: var(--so-radius-sm);
      text-transform: uppercase;
    }

    .stop-offset {
      font-size: 11px;
      color: var(--so-text-muted);
      margin-top: 2px;
    }

    /* Assignment controls */
    .assignment-row {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .assignment-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .assign-label {
      font-size: 11px;
      font-weight: var(--so-fw-semibold);
      color: var(--so-text-secondary);
    }

    .so-select {
      height: 38px;
      padding: 0 10px;
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      background: var(--so-surface);
      font-size: var(--so-font-xs);
      color: var(--so-text-primary);
    }

    .peak-info-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: var(--so-radius-md);
      font-size: var(--so-font-xs);
      color: #92400E;

      .banner-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #D97706;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteDrawerComponent {
  @Input({ required: true }) route: Route | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() driverAssigned = new EventEmitter<{ driverId: string; driverName: string }>();
  @Output() vehicleAssigned = new EventEmitter<{ vehicleId: string; vehicleNumber: string }>();

  private driverService = inject(DriverService);
  private vehicleService = inject(VehicleService);

  readonly drivers = this.driverService.drivers;
  readonly vehicles = this.vehicleService.vehicles;

  onDriverChanged(driverId: string): void {
    const d = this.drivers().find(item => item.id === driverId);
    if (d) {
      this.driverAssigned.emit({ driverId: d.id, driverName: d.name });
    }
  }

  onVehicleChanged(vehicleId: string): void {
    const v = this.vehicles().find(item => item.id === vehicleId);
    if (v) {
      this.vehicleAssigned.emit({ vehicleId: v.id, vehicleNumber: v.vehicleNumber });
    }
  }
}
