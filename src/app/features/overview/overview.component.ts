import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BookingService } from '../../core/services/booking.service';
import { DriverService } from '../../core/services/driver.service';
import { RouteService } from '../../core/services/route.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Booking } from '../../core/models/booking.model';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <app-page-header
        title="Operations Overview"
        subtitle="Live campus shuttle tracking, driver availability, and demand metrics"
      >
        <div actions class="header-action-group">
          <div class="date-selector-pill font-mono">
            <mat-icon>event</mat-icon>
            <span>Tuesday, 22 Sep 2026</span>
          </div>
          <button mat-flat-button class="btn-primary" (click)="navigateToNewBooking()">
            <mat-icon>add</mat-icon>
            <span>Create Booking</span>
          </button>
        </div>
      </app-page-header>

      <!-- Key Metrics Row -->
      <div class="metrics-grid">
        <app-stat-card
          label="Today's Bookings"
          [value]="metrics().totalBookingsToday"
          icon="confirmation_number"
          iconTheme="theme-primary"
          badgeText="96% On-Time"
          badgeTheme="theme-success"
          subtext="22 scheduled across 6 campus routes"
        ></app-stat-card>

        <app-stat-card
          label="Active Shuttles"
          [value]="metrics().activeShuttlesCount"
          icon="directions_bus"
          iconTheme="theme-success"
          subtext="4 on trip • 2 ready at depot"
        ></app-stat-card>

        <app-stat-card
          label="Available Drivers"
          [value]="metrics().availableDriversCount"
          icon="badge"
          iconTheme="theme-info"
          subtext="3 on shift • 2 on rest break"
        ></app-stat-card>

        <app-stat-card
          label="Peak Demand Hour"
          [value]="metrics().peakHourRange"
          icon="show_chart"
          iconTheme="theme-warning"
          badgeText="Peak"
          badgeTheme="theme-warning"
          [isHighlighted]="true"
          subtext="Highest passenger volume period"
        ></app-stat-card>

        <app-stat-card
          label="Pending Requests"
          [value]="metrics().pendingRequestsCount"
          icon="pending_actions"
          iconTheme="theme-primary"
          [badgeText]="metrics().pendingRequestsCount > 0 ? 'Needs Action' : undefined"
          badgeTheme="theme-warning"
          subtext="Requires dispatcher approval"
        ></app-stat-card>
      </div>

      <!-- Main Operational Dashboard Content: 2-Column Grid -->
      <div class="dashboard-grid">
        <!-- LEFT COLUMN: Live Shuttle Activity & Demand Chart -->
        <div class="grid-col left-col">
          <!-- SECTION A: Today's Shuttle Activity -->
          <div class="ops-card">
            <div class="card-header">
              <div class="card-title-group">
                <mat-icon class="card-icon">timeline</mat-icon>
                <h2 class="card-title">Live Shuttle Fleet Activity</h2>
              </div>
              <a routerLink="/routes" class="card-action-link">View All Routes &rarr;</a>
            </div>

            <div class="fleet-activity-list">
              <div *ngFor="let v of vehicles()" class="fleet-activity-item">
                <div class="vehicle-pill">
                  <mat-icon class="v-icon">airport_shuttle</mat-icon>
                  <span class="v-num font-mono">{{ v.vehicleNumber }}</span>
                </div>

                <div class="fleet-route-info">
                  <div class="route-name">{{ v.assignedRouteName || 'Depot Standby' }}</div>
                  <div class="driver-name">
                    <mat-icon class="mini-icon">person</mat-icon>
                    <span>{{ v.currentDriverName || 'No Driver Assigned' }}</span>
                  </div>
                </div>

                <div class="fleet-occupancy">
                  <div class="occupancy-bar-track">
                    <div
                      class="occupancy-bar-fill"
                      [style.width.%]="(v.currentOccupancy / v.capacity) * 100"
                      [class.high-occupancy]="(v.currentOccupancy / v.capacity) > 0.8"
                    ></div>
                  </div>
                  <span class="occupancy-label font-mono">
                    {{ v.currentOccupancy }}/{{ v.capacity }} Seats
                  </span>
                </div>

                <div class="fleet-status">
                  <app-status-badge [status]="v.status === 'In Service' ? 'On Going' : (v.status === 'Charging' ? 'Waiting' : 'Accepted')"></app-status-badge>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION C: Hourly Demand Chart -->
          <div class="ops-card">
            <div class="card-header">
              <div class="card-title-group">
                <mat-icon class="card-icon">bar_chart</mat-icon>
                <h2 class="card-title">Hourly Booking Demand Distribution</h2>
              </div>
              <span class="peak-legend">
                <span class="legend-box peak"></span> Peak Period
                <span class="legend-box standard"></span> Normal
              </span>
            </div>

            <div class="demand-chart-container">
              <div class="chart-bars">
                <div
                  *ngFor="let d of hourlyDemand()"
                  class="chart-bar-column"
                  [class.peak-column]="d.isPeak"
                  [matTooltip]="d.hour + ': ' + d.bookingCount + ' bookings (' + d.completedCount + ' completed)'"
                >
                  <span class="bar-value font-mono">{{ d.bookingCount }}</span>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      [style.height.%]="getBarHeight(d.bookingCount)"
                      [class.peak-bar]="d.isPeak"
                    ></div>
                  </div>
                  <span class="bar-label font-mono">{{ d.hour.split(':')[0] }}h</span>
                </div>
              </div>
            </div>

            <div class="demand-insight-banner">
              <mat-icon class="insight-icon">lightbulb</mat-icon>
              <span>{{ primaryInsight() }}</span>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Driver Availability & Recent Bookings -->
        <div class="grid-col right-col">
          <!-- SECTION B: Driver Availability Summary -->
          <div class="ops-card">
            <div class="card-header">
              <div class="card-title-group">
                <mat-icon class="card-icon">badge</mat-icon>
                <h2 class="card-title">Driver Availability Status</h2>
              </div>
              <a routerLink="/drivers" class="card-action-link">Open Timeline &rarr;</a>
            </div>

            <div class="driver-summary-chips">
              <div class="status-summary-pill avail">
                <span class="pill-count font-mono">{{ driverSummary().available }}</span>
                <span class="pill-title">Available</span>
              </div>
              <div class="status-summary-pill trip">
                <span class="pill-count font-mono">{{ driverSummary().onTrip }}</span>
                <span class="pill-title">On Trip</span>
              </div>
              <div class="status-summary-pill rest">
                <span class="pill-count font-mono">{{ driverSummary().onBreak }}</span>
                <span class="pill-title">On Break</span>
              </div>
              <div class="status-summary-pill off">
                <span class="pill-count font-mono">{{ driverSummary().offDuty }}</span>
                <span class="pill-title">Off Duty</span>
              </div>
            </div>

            <div class="driver-quick-list">
              <div *ngFor="let driver of drivers().slice(0, 5)" class="driver-quick-row">
                <div class="driver-avatar-circle">
                  {{ driver.name.substring(0, 2).toUpperCase() }}
                </div>
                <div class="driver-info">
                  <div class="driver-name-text">{{ driver.name }}</div>
                  <div class="driver-meta font-mono">{{ driver.shift.startTime }} - {{ driver.shift.endTime }} • {{ driver.currentVehicleNumber || 'Standby' }}</div>
                </div>
                <app-status-badge [status]="driver.status"></app-status-badge>
              </div>
            </div>
          </div>

          <!-- SECTION D: Recent Bookings -->
          <div class="ops-card">
            <div class="card-header">
              <div class="card-title-group">
                <mat-icon class="card-icon">receipt_long</mat-icon>
                <h2 class="card-title">Recent Campus Bookings</h2>
              </div>
              <a routerLink="/bookings" class="card-action-link">View All ({{ recentBookings().length }}) &rarr;</a>
            </div>

            <div class="recent-bookings-list">
              <div
                *ngFor="let b of recentBookings().slice(0, 6); trackBy: trackByBookingId"
                class="recent-booking-item"
                (click)="openBookingDetails(b)"
              >
                <div class="booking-id font-mono">{{ b.id }}</div>
                <div class="booking-passenger-info">
                  <div class="passenger-name">{{ b.employeeName }}</div>
                  <div class="booking-route-line truncate">{{ b.pickupLocation }} &rarr; {{ b.dropLocation }}</div>
                </div>
                <div class="booking-time font-mono">{{ b.requestedPickupTime }}</div>
                <app-status-badge [status]="b.status"></app-status-badge>
                <button
                  mat-icon-button
                  class="row-action-btn"
                  (click)="openBookingDetails(b); $event.stopPropagation()"
                  title="Inspect Booking"
                >
                  <mat-icon>chevron_right</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-action-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .date-selector-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-semibold);
      color: var(--so-text-secondary);

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--so-primary);
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;

      @media (max-width: 1100px) {
        grid-template-columns: 1fr;
      }
    }

    .grid-col {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .ops-card {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-lg);
      padding: 20px;
      box-shadow: var(--so-shadow-subtle);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--so-border-subtle);
    }

    .card-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--so-primary);
    }

    .card-title {
      font-size: var(--so-font-md);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-primary);
      margin: 0;
    }

    .card-action-link {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-semibold);
      color: var(--so-primary);
      transition: color var(--so-transition-fast);

      &:hover {
        color: var(--so-primary-hover);
        text-decoration: underline;
      }
    }

    /* Fleet Activity List */
    .fleet-activity-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .fleet-activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--so-radius-md);
      background-color: var(--so-surface-hover);
      border: 1px solid var(--so-border-subtle);
    }

    .vehicle-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      border: 1px solid var(--so-border);
      padding: 4px 8px;
      border-radius: var(--so-radius-sm);

      .v-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--so-text-muted);
      }

      .v-num {
        font-size: var(--so-font-xs);
        font-weight: var(--so-fw-bold);
        color: var(--so-text-primary);
      }
    }

    .fleet-route-info {
      flex: 1;
      min-width: 0;

      .route-name {
        font-size: var(--so-font-xs);
        font-weight: var(--so-fw-semibold);
        color: var(--so-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .driver-name {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: var(--so-text-muted);
        margin-top: 2px;

        .mini-icon {
          font-size: 12px;
          width: 12px;
          height: 12px;
        }
      }
    }

    .fleet-occupancy {
      width: 110px;

      .occupancy-bar-track {
        height: 6px;
        background: #E2E8F0;
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 4px;
      }

      .occupancy-bar-fill {
        height: 100%;
        background-color: #3B82F6;
        border-radius: 999px;

        &.high-occupancy {
          background-color: #EF4444;
        }
      }

      .occupancy-label {
        font-size: 10px;
        color: var(--so-text-muted);
        display: block;
        text-align: right;
      }
    }

    /* Demand Chart */
    .peak-legend {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
      color: var(--so-text-muted);

      .legend-box {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 2px;

        &.peak { background-color: #F59E0B; }
        &.standard { background-color: #93C5FD; }
      }
    }

    .demand-chart-container {
      padding: 16px 0 8px 0;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      height: 140px;
      gap: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--so-border);
    }

    .chart-bar-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      cursor: pointer;

      &:hover .bar-fill {
        filter: brightness(0.9);
      }
    }

    .bar-value {
      font-size: 10px;
      color: var(--so-text-muted);
      margin-bottom: 4px;
    }

    .bar-track {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .bar-fill {
      width: 100%;
      max-width: 22px;
      background-color: #93C5FD;
      border-radius: 4px 4px 0 0;
      transition: height 300ms ease;

      &.peak-bar {
        background-color: #F59E0B;
      }
    }

    .bar-label {
      font-size: 10px;
      color: var(--so-text-muted);
      margin-top: 6px;
    }

    .demand-insight-banner {
      margin-top: 14px;
      padding: 10px 14px;
      background-color: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: var(--so-radius-md);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: var(--so-font-xs);
      color: #1E40AF;

      .insight-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #2563EB;
      }
    }

    /* Driver Availability Summary */
    .driver-summary-chips {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }

    .status-summary-pill {
      padding: 10px;
      border-radius: var(--so-radius-md);
      text-align: center;
      display: flex;
      flex-direction: column;

      .pill-count {
        font-size: var(--so-font-lg);
        font-weight: var(--so-fw-bold);
      }

      .pill-title {
        font-size: 11px;
        font-weight: var(--so-fw-medium);
        margin-top: 2px;
      }

      &.avail { background: #ECFDF5; color: #065F46; }
      &.trip { background: #EFF6FF; color: #1E40AF; }
      &.rest { background: #FFFBEB; color: #92400E; }
      &.off { background: #F1F5F9; color: #475569; }
    }

    .driver-quick-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .driver-quick-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      background: var(--so-surface-hover);
      border-radius: var(--so-radius-md);
    }

    .driver-avatar-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #334155;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: var(--so-fw-bold);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .driver-info {
      flex: 1;
      min-width: 0;

      .driver-name-text {
        font-size: var(--so-font-xs);
        font-weight: var(--so-fw-semibold);
        color: var(--so-text-primary);
      }

      .driver-meta {
        font-size: 10px;
        color: var(--so-text-muted);
      }
    }

    /* Recent Bookings List */
    .recent-bookings-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .recent-booking-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: var(--so-radius-md);
      border: 1px solid var(--so-border-subtle);
      background: var(--so-surface);
      cursor: pointer;
      transition: all var(--so-transition-fast);

      &:hover {
        background-color: var(--so-surface-hover);
        border-color: var(--so-border);
      }

      .booking-id {
        font-size: var(--so-font-xs);
        font-weight: var(--so-fw-bold);
        color: var(--so-primary);
        width: 68px;
      }

      .booking-passenger-info {
        flex: 1;
        min-width: 0;

        .passenger-name {
          font-size: var(--so-font-xs);
          font-weight: var(--so-fw-semibold);
          color: var(--so-text-primary);
        }

        .booking-route-line {
          font-size: 11px;
          color: var(--so-text-muted);
        }
      }

      .booking-time {
        font-size: var(--so-font-xs);
        font-weight: var(--so-fw-medium);
        color: var(--so-text-secondary);
      }

      .row-action-btn {
        color: var(--so-text-muted);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent {
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private driverService = inject(DriverService);
  private vehicleService = inject(VehicleService);
  private analyticsService = inject(AnalyticsService);

  readonly metrics = this.analyticsService.summaryMetrics;
  readonly hourlyDemand = this.analyticsService.hourlyDemand;
  readonly driverSummary = this.driverService.availabilitySummary;
  readonly drivers = this.driverService.drivers;
  readonly vehicles = this.vehicleService.vehicles;
  readonly recentBookings = this.bookingService.bookings;

  primaryInsight(): string {
    const insights = this.analyticsService.insights();
    return insights.length > 0 ? insights[0] : 'Campus shuttle network operating within optimal capacity.';
  }

  getBarHeight(count: number): number {
    const max = 6;
    return Math.min(Math.round((count / max) * 100), 100);
  }

  trackByBookingId(index: number, booking: Booking): string {
    return booking.id;
  }

  openBookingDetails(booking: Booking): void {
    this.bookingService.openViewDrawer(booking);
    this.router.navigate(['/bookings']);
  }

  navigateToNewBooking(): void {
    this.bookingService.openCreateDrawer();
    this.router.navigate(['/bookings']);
  }
}
