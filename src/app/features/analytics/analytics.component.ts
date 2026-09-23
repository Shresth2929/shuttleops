import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AnalyticsService } from '../../core/services/analytics.service';
import { BookingService } from '../../core/services/booking.service';
import { DriverService } from '../../core/services/driver.service';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

type DateFilterOption = 'today' | 'last7' | 'last30';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatCardComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <app-page-header
        title="Demand & Fleet Usage Analytics"
        subtitle="Operational intelligence, passenger load trends, and capacity utilization across campus routes"
      >
        <div actions class="header-action-group">
          <div class="timeframe-toggle-group">
            <button
              class="tf-btn"
              [class.active]="timeframe() === 'today'"
              (click)="timeframe.set('today')"
            >
              Today
            </button>
            <button
              class="tf-btn"
              [class.active]="timeframe() === 'last7'"
              (click)="timeframe.set('last7')"
            >
              Last 7 Days
            </button>
            <button
              class="tf-btn"
              [class.active]="timeframe() === 'last30'"
              (click)="timeframe.set('last30')"
            >
              Month to Date
            </button>
          </div>
        </div>
      </app-page-header>

      <!-- KPI Metrics Overview -->
      <div class="metrics-grid">
        <app-stat-card
          label="Total Bookings"
          [value]="metrics().totalBookingsToday"
          icon="confirmation_number"
          iconTheme="theme-primary"
          badgeText="96% On-Time"
          badgeTheme="theme-success"
          subtext="Processed by dispatch console"
        ></app-stat-card>

        <app-stat-card
          label="Fleet Capacity Utilization"
          [value]="metrics().fleetUtilizationRate + '%'"
          icon="speed"
          iconTheme="theme-success"
          subtext="Average passenger load factor"
        ></app-stat-card>

        <app-stat-card
          label="Peak Transit Slot"
          [value]="metrics().peakHourRange"
          icon="access_time_filled"
          iconTheme="theme-warning"
          badgeText="Peak"
          badgeTheme="theme-warning"
          [isHighlighted]="true"
          subtext="Highest booking concentration"
        ></app-stat-card>

        <app-stat-card
          label="Trip Fulfillment Rate"
          [value]="fulfillmentRate() + '%'"
          icon="task_alt"
          iconTheme="theme-primary"
          subtext="Completed vs requested trips"
        ></app-stat-card>
      </div>

      <!-- Operational Insights Banner -->
      <div class="insights-card">
        <div class="insights-header">
          <div class="insights-title-group">
            <mat-icon class="bulb-icon">tips_and_updates</mat-icon>
            <h2 class="insights-title">Live Operational Insights (Computed from Active Data)</h2>
          </div>
          <span class="insight-badge">Real-time Aggregation</span>
        </div>

        <div class="insights-list">
          <div *ngFor="let item of insights()" class="insight-item">
            <mat-icon class="check-bullet">arrow_forward_ios</mat-icon>
            <span class="insight-text">{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- Analytics Visual Grid -->
      <div class="analytics-grid">
        <!-- Chart 1: Hourly Demand Profile -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="header-info">
              <h3 class="card-heading">When is shuttle demand highest? (Hourly Bookings)</h3>
              <p class="card-subheading">Distribution of ride requests by departure hour (06:00 - 22:00)</p>
            </div>
            <div class="peak-indicator-pill">
              <span class="peak-box"></span> Peak Slot: {{ metrics().peakHourRange }}
            </div>
          </div>

          <div class="hourly-chart-wrapper">
            <div class="chart-bars-container">
              <div
                *ngFor="let h of hourlyDemand()"
                class="bar-column"
                [matTooltip]="h.hour + ': ' + h.bookingCount + ' bookings (' + h.completedCount + ' completed, ' + h.cancelledCount + ' cancelled)'"
              >
                <span class="bar-num font-mono">{{ h.bookingCount }}</span>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [style.height.%]="getBarHeight(h.bookingCount)"
                    [class.is-peak]="h.isPeak"
                  ></div>
                </div>
                <span class="bar-hour font-mono">{{ h.hour.split(':')[0] }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart 2: Route Utilization -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="header-info">
              <h3 class="card-heading">Which route has the highest utilization?</h3>
              <p class="card-subheading">Total bookings and passenger occupancy rate per route</p>
            </div>
          </div>

          <div class="route-bars-list">
            <div *ngFor="let r of routeDemand()" class="route-stat-row">
              <div class="route-info-head">
                <span class="route-title-text font-semibold">{{ r.routeName }}</span>
                <span class="route-volume font-mono">{{ r.totalBookings }} bookings ({{ r.occupancyRate }}% occupancy)</span>
              </div>
              <div class="route-bar-track">
                <div
                  class="route-bar-fill"
                  [style.width.%]="r.occupancyRate"
                  [class.high-load]="r.occupancyRate > 85"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart 3: Booking Status Outcome Distribution -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="header-info">
              <h3 class="card-heading">How many bookings were fulfilled vs cancelled?</h3>
              <p class="card-subheading">Daily lifecycle completion and cancellation rates</p>
            </div>
          </div>

          <div class="outcomes-breakdown">
            <div class="outcome-pill completed">
              <div class="outcome-icon-circle"><mat-icon>check_circle</mat-icon></div>
              <div class="outcome-details">
                <span class="outcome-val font-mono">{{ bookingStats().completed }}</span>
                <span class="outcome-lbl">Completed Trips</span>
              </div>
            </div>

            <div class="outcome-pill requested">
              <div class="outcome-icon-circle"><mat-icon>schedule</mat-icon></div>
              <div class="outcome-details">
                <span class="outcome-val font-mono">{{ bookingStats().accepted + bookingStats().requested + bookingStats().waiting + bookingStats().ongoing }}</span>
                <span class="outcome-lbl">Active & Scheduled</span>
              </div>
            </div>

            <div class="outcome-pill cancelled">
              <div class="outcome-icon-circle"><mat-icon>cancel</mat-icon></div>
              <div class="outcome-details">
                <span class="outcome-val font-mono">{{ bookingStats().cancelled }}</span>
                <span class="outcome-lbl">Cancelled</span>
              </div>
            </div>

            <div class="outcome-pill noshow">
              <div class="outcome-icon-circle"><mat-icon>person_off</mat-icon></div>
              <div class="outcome-details">
                <span class="outcome-val font-mono">{{ bookingStats().noShow }}</span>
                <span class="outcome-lbl">No Show</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart 4: Driver Fleet Utilization -->
        <div class="analytics-card">
          <div class="card-header">
            <div class="header-info">
              <h3 class="card-heading">Driver Roster Utilization</h3>
              <p class="card-subheading">Active trip loads and status distribution among drivers</p>
            </div>
          </div>

          <div class="driver-utilization-list">
            <div *ngFor="let driver of drivers()" class="driver-util-item">
              <div class="driver-util-left">
                <div class="driver-avatar-sm">{{ driver.name.substring(0, 2).toUpperCase() }}</div>
                <div class="driver-util-name">
                  <span class="name font-medium">{{ driver.name }}</span>
                  <span class="sub text-muted font-mono">{{ driver.totalTripsToday }} trips • {{ driver.rating }} ★</span>
                </div>
              </div>
              <div class="driver-util-status">
                <span class="status-indicator font-mono" [ngClass]="driver.status.toLowerCase().replace(' ', '-')">
                  {{ driver.status }}
                </span>
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

    .timeframe-toggle-group {
      display: flex;
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 3px;
      gap: 2px;
    }

    .tf-btn {
      padding: 6px 14px;
      border-radius: var(--so-radius-sm);
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-medium);
      color: var(--so-text-secondary);
      background: transparent;
      transition: all var(--so-transition-fast);

      &:hover {
        color: var(--so-text-primary);
      }

      &.active {
        background-color: var(--so-primary);
        color: #FFFFFF;
        font-weight: var(--so-fw-semibold);
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    /* Insights Banner Card */
    .insights-card {
      background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
      color: #FFFFFF;
      border-radius: var(--so-radius-lg);
      padding: 20px 24px;
      margin-bottom: 24px;
      box-shadow: var(--so-shadow-md);
    }

    .insights-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .insights-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bulb-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #FCD34D;
    }

    .insights-title {
      font-size: var(--so-font-md);
      font-weight: var(--so-fw-bold);
      color: #FFFFFF;
      margin: 0;
    }

    .insight-badge {
      font-size: 10px;
      font-weight: var(--so-fw-bold);
      background: rgba(255, 255, 255, 0.2);
      padding: 3px 8px;
      border-radius: var(--so-radius-full);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .insights-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .insight-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .check-bullet {
      font-size: 12px;
      width: 12px;
      height: 12px;
      margin-top: 4px;
      color: #93C5FD;
      flex-shrink: 0;
    }

    .insight-text {
      font-size: var(--so-font-xs);
      color: #EFF6FF;
      line-height: 1.5;
    }

    /* Analytics Grid */
    .analytics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .analytics-card {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-lg);
      padding: 20px;
      box-shadow: var(--so-shadow-subtle);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .card-heading {
      font-size: var(--so-font-sm);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-primary);
      margin: 0;
    }

    .card-subheading {
      font-size: 11px;
      color: var(--so-text-muted);
      margin-top: 2px;
    }

    .peak-indicator-pill {
      font-size: 11px;
      color: #92400E;
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      padding: 4px 8px;
      border-radius: var(--so-radius-sm);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;

      .peak-box {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        background-color: #F59E0B;
      }
    }

    /* Hourly Chart */
    .hourly-chart-wrapper {
      padding: 12px 0 4px 0;
    }

    .chart-bars-container {
      display: flex;
      align-items: flex-end;
      height: 160px;
      gap: 6px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--so-border);
    }

    .bar-column {
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

    .bar-num {
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
      max-width: 20px;
      background-color: #93C5FD;
      border-radius: 3px 3px 0 0;
      transition: height 300ms ease;

      &.is-peak {
        background-color: #F59E0B;
      }
    }

    .bar-hour {
      font-size: 10px;
      color: var(--so-text-muted);
      margin-top: 6px;
    }

    /* Route Utilization Bars */
    .route-bars-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .route-stat-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .route-info-head {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .route-title-text {
        font-size: var(--so-font-xs);
        color: var(--so-text-primary);
      }

      .route-volume {
        font-size: 11px;
        color: var(--so-text-muted);
      }
    }

    .route-bar-track {
      height: 8px;
      background: #E2E8F0;
      border-radius: 999px;
      overflow: hidden;
    }

    .route-bar-fill {
      height: 100%;
      background-color: #2563EB;
      border-radius: 999px;
      transition: width 300ms ease;

      &.high-load {
        background-color: #059669;
      }
    }

    /* Outcome Breakdown */
    .outcomes-breakdown {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .outcome-pill {
      padding: 14px;
      border-radius: var(--so-radius-md);
      display: flex;
      align-items: center;
      gap: 12px;

      .outcome-icon-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .outcome-details {
        display: flex;
        flex-direction: column;
      }

      .outcome-val {
        font-size: var(--so-font-lg);
        font-weight: var(--so-fw-bold);
      }

      .outcome-lbl {
        font-size: 11px;
      }

      &.completed {
        background: #ECFDF5;
        color: #065F46;
        .outcome-icon-circle { background: #D1FAE5; color: #059669; }
      }

      &.requested {
        background: #EFF6FF;
        color: #1E40AF;
        .outcome-icon-circle { background: #DBEAFE; color: #2563EB; }
      }

      &.cancelled {
        background: #FEF2F2;
        color: #991B1B;
        .outcome-icon-circle { background: #FEE2E2; color: #DC2626; }
      }

      &.noshow {
        background: #F8FAFC;
        color: #475569;
        .outcome-icon-circle { background: #E2E8F0; color: #64748B; }
      }
    }

    /* Driver Utilization List */
    .driver-utilization-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .driver-util-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--so-surface-hover);
      border-radius: var(--so-radius-md);
    }

    .driver-util-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .driver-avatar-sm {
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

    .driver-util-name {
      display: flex;
      flex-direction: column;

      .name {
        font-size: var(--so-font-xs);
        color: var(--so-text-primary);
      }

      .sub {
        font-size: 10px;
      }
    }

    .status-indicator {
      font-size: 10px;
      font-weight: var(--so-fw-bold);
      padding: 2px 8px;
      border-radius: var(--so-radius-sm);

      &.available { background: #ECFDF5; color: #065F46; }
      &.on-trip { background: #EFF6FF; color: #1E40AF; }
      &.on-break { background: #FFFBEB; color: #92400E; }
      &.off-duty { background: #F1F5F9; color: #475569; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent {
  private analyticsService = inject(AnalyticsService);
  private bookingService = inject(BookingService);
  private driverService = inject(DriverService);

  readonly timeframe = signal<DateFilterOption>('today');
  readonly metrics = this.analyticsService.summaryMetrics;
  readonly hourlyDemand = this.analyticsService.hourlyDemand;
  readonly routeDemand = this.analyticsService.routeDemand;
  readonly insights = this.analyticsService.insights;
  readonly bookingStats = this.bookingService.stats;
  readonly drivers = this.driverService.drivers;

  readonly fulfillmentRate = computed(() => {
    const total = this.bookingStats().total;
    const completed = this.bookingStats().completed;
    const cancelled = this.bookingStats().cancelled;
    if (total === 0) return 100;
    return Math.round((completed / (total - cancelled || 1)) * 100);
  });

  getBarHeight(count: number): number {
    const max = 6;
    return Math.min(Math.round((count / max) * 100), 100);
  }
}
