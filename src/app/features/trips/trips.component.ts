import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { TripService } from '../../core/services/trip.service';
import { Trip } from '../../core/models/trip.model';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    StatCardComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <app-page-header
        title="Completed Trip History & Passenger Logs"
        subtitle="Historical audit log of executed campus trips, driver logs, passenger ratings, and punctuality"
      >
        <div actions class="header-action-group">
          <div class="search-input-pill">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              type="text"
              placeholder="Search by Trip ID, route, passenger, driver..."
              [ngModel]="filter().search"
              (ngModelChange)="onSearchChanged($event)"
              aria-label="Search trip logs"
            />
          </div>
        </div>
      </app-page-header>

      <!-- KPI Summary Cards -->
      <div class="metrics-grid">
        <app-stat-card
          label="Total Logged Trips"
          [value]="trips().length"
          icon="history"
          iconTheme="theme-primary"
          subtext="Recorded in historical ledger"
        ></app-stat-card>

        <app-stat-card
          label="Avg Passenger Rating"
          value="4.8 ★"
          icon="star"
          iconTheme="theme-warning"
          badgeText="Exceptional"
          badgeTheme="theme-success"
          subtext="Based on verified rider reviews"
        ></app-stat-card>

        <app-stat-card
          label="Total Distance Travelled"
          [value]="totalDistanceKm() + ' km'"
          icon="route"
          iconTheme="theme-info"
          subtext="Zero emissions campus transit"
        ></app-stat-card>

        <app-stat-card
          label="Avg Ride Duration"
          value="22.1 mins"
          icon="timer"
          iconTheme="theme-success"
          subtext="Consistent turn-around SLA"
        ></app-stat-card>
      </div>

      <!-- Main Trip History Table -->
      <div class="so-table-container">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Date & Time</th>
                <th>Route</th>
                <th>From &rarr; To</th>
                <th>Passenger</th>
                <th>Driver & Vehicle</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Rating</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let t of filteredTrips(); trackBy: trackByTripId"
                class="clickable-row"
                (click)="openTripDrawer(t)"
              >
                <!-- Trip ID -->
                <td>
                  <span class="trip-id-text font-mono font-bold">{{ t.id }}</span>
                </td>

                <!-- Date & Time -->
                <td>
                  <div class="date-cell">
                    <span class="date-text font-mono">{{ t.date }}</span>
                    <span class="time-text text-muted font-mono">{{ t.pickupTime }} - {{ t.dropTime }}</span>
                  </div>
                </td>

                <!-- Route -->
                <td>
                  <span class="route-name font-semibold">{{ t.routeName }}</span>
                </td>

                <!-- From -> To -->
                <td>
                  <div class="from-to-cell">
                    <span class="loc-txt">{{ t.pickupLocation }}</span>
                    <span class="arrow-txt">&rarr;</span>
                    <span class="loc-txt">{{ t.dropLocation }}</span>
                  </div>
                </td>

                <!-- Passenger -->
                <td>
                  <span class="passenger-name">{{ t.passengerName }}</span>
                </td>

                <!-- Driver & Vehicle -->
                <td>
                  <div class="driver-veh-cell">
                    <span class="drv-name">{{ t.driverName }}</span>
                    <span class="veh-num font-mono text-muted">{{ t.vehicleNumber }}</span>
                  </div>
                </td>

                <!-- Duration & Distance -->
                <td>
                  <div class="duration-cell font-mono">
                    <span>{{ t.durationMinutes }}m</span>
                    <span class="dist-txt text-muted">({{ t.distanceKm }}km)</span>
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <app-status-badge [status]="t.status"></app-status-badge>
                </td>

                <!-- Rating -->
                <td>
                  <div class="rating-badge" *ngIf="t.rating">
                    <span class="star-icon">★</span>
                    <span class="rating-num font-mono">{{ t.rating }}.0</span>
                  </div>
                  <span *ngIf="!t.rating" class="text-muted">—</span>
                </td>

                <!-- Action -->
                <td class="text-right">
                  <button mat-icon-button class="view-btn" (click)="openTripDrawer(t); $event.stopPropagation()">
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <app-empty-state
          *ngIf="filteredTrips().length === 0"
          icon="history"
          title="No trip records found"
          description="No completed trip logs match your search filters."
          actionLabel="Clear Search"
          (actionClicked)="clearFilter()"
        ></app-empty-state>
      </div>

      <!-- Trip Details Drawer -->
      <div *ngIf="isDrawerOpen()" class="drawer-backdrop" (click)="closeTripDrawer()" aria-hidden="true"></div>

      <aside *ngIf="isDrawerOpen() && selectedTrip()" class="trip-drawer-panel" role="dialog" aria-labelledby="trip-drawer-title">
        <div class="drawer-header">
          <div class="header-left">
            <span class="trip-badge font-mono">{{ selectedTrip()?.id }}</span>
            <h2 id="trip-drawer-title" class="drawer-title">Trip Journey Audit Log</h2>
          </div>
          <button mat-icon-button (click)="closeTripDrawer()" class="close-drawer-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="drawer-body">
          <!-- Summary Banner -->
          <div class="trip-summary-box">
            <div class="sum-row">
              <span class="sum-label">Trip Status:</span>
              <app-status-badge [status]="selectedTrip()!.status"></app-status-badge>
            </div>
            <div class="sum-row">
              <span class="sum-label">Related Booking:</span>
              <span class="font-mono font-bold">{{ selectedTrip()!.bookingId }}</span>
            </div>
          </div>

          <!-- Route Info -->
          <div class="section-card">
            <div class="section-title">Route & Location</div>
            <div class="route-title-large font-bold">{{ selectedTrip()!.routeName }}</div>

            <div class="loc-trail">
              <div class="loc-point">
                <div class="dot start"></div>
                <div class="info">
                  <div class="title font-semibold">{{ selectedTrip()!.pickupLocation }}</div>
                  <div class="time font-mono">Departed at {{ selectedTrip()!.pickupTime }}</div>
                </div>
              </div>
              <div class="loc-trail-line"></div>
              <div class="loc-point">
                <div class="dot end"></div>
                <div class="info">
                  <div class="title font-semibold">{{ selectedTrip()!.dropLocation }}</div>
                  <div class="time font-mono">Arrived at {{ selectedTrip()!.dropTime }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Trip Metrics -->
          <div class="section-card">
            <div class="section-title">Performance Metrics</div>
            <div class="trip-metrics-grid">
              <div class="metric-box">
                <span class="m-val font-mono">{{ selectedTrip()!.durationMinutes }} mins</span>
                <span class="m-lbl">Trip Duration</span>
              </div>
              <div class="metric-box">
                <span class="m-val font-mono">{{ selectedTrip()!.distanceKm }} km</span>
                <span class="m-lbl">Distance Covered</span>
              </div>
              <div class="metric-box">
                <span class="m-val font-mono">{{ selectedTrip()!.date }}</span>
                <span class="m-lbl">Trip Date</span>
              </div>
            </div>
          </div>

          <!-- Pilot & Passenger -->
          <div class="section-card">
            <div class="section-title">Personnel & Vehicle</div>
            <div class="personnel-grid">
              <div class="p-item">
                <span class="p-lbl">Passenger:</span>
                <span class="p-val font-medium">{{ selectedTrip()!.passengerName }}</span>
              </div>
              <div class="p-item">
                <span class="p-lbl">Assigned Pilot:</span>
                <span class="p-val font-medium">{{ selectedTrip()!.driverName }}</span>
              </div>
              <div class="p-item">
                <span class="p-lbl">Vehicle Number:</span>
                <span class="p-val font-mono">{{ selectedTrip()!.vehicleNumber }}</span>
              </div>
            </div>
          </div>

          <!-- Feedback & Rating -->
          <div class="section-card" *ngIf="selectedTrip()!.rating">
            <div class="section-title">Passenger Rating & Feedback</div>
            <div class="feedback-box">
              <div class="rating-stars">
                <span class="star-icon">★</span>
                <span class="rating-text font-bold">{{ selectedTrip()!.rating }}.0 / 5.0</span>
              </div>
              <p class="feedback-quote" *ngIf="selectedTrip()!.feedback">
                "{{ selectedTrip()!.feedback }}"
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .header-action-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-input-pill {
      display: flex;
      align-items: center;
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 0 12px;
      height: 40px;
      width: 320px;

      &:focus-within {
        border-color: var(--so-primary);
        box-shadow: 0 0 0 2px var(--so-primary-light);
      }

      .search-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--so-text-muted);
        margin-right: 8px;
      }

      input {
        border: none;
        background: transparent;
        font-size: var(--so-font-xs);
        color: var(--so-text-primary);
        outline: none;
        width: 100%;
        font-family: inherit;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .trip-id-text {
      color: var(--so-primary);
    }

    .date-cell {
      display: flex;
      flex-direction: column;
      font-size: var(--so-font-xs);

      .time-text {
        font-size: 10px;
      }
    }

    .from-to-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--so-font-xs);
      color: var(--so-text-secondary);

      .arrow-txt {
        color: var(--so-text-muted);
      }
    }

    .driver-veh-cell {
      display: flex;
      flex-direction: column;
      font-size: var(--so-font-xs);

      .veh-num {
        font-size: 10px;
      }
    }

    .duration-cell {
      font-size: var(--so-font-xs);

      .dist-txt {
        margin-left: 4px;
        font-size: 10px;
      }
    }

    .rating-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      color: #92400E;
      padding: 2px 6px;
      border-radius: var(--so-radius-sm);
      font-size: 11px;
      font-weight: var(--so-fw-bold);

      .star-icon {
        color: #F59E0B;
      }
    }

    .text-right {
      text-align: right;
    }

    .view-btn {
      color: var(--so-text-muted);
    }

    /* Trip Drawer */
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.4);
      z-index: 150;
    }

    .trip-drawer-panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 480px;
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

    .trip-badge {
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
      gap: 18px;
    }

    .trip-summary-box {
      background: var(--so-bg);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .sum-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--so-font-xs);
      }

      .sum-label {
        color: var(--so-text-muted);
      }
    }

    .section-card {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-title {
      font-size: 11px;
      font-weight: var(--so-fw-bold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--so-text-muted);
      border-bottom: 1px solid var(--so-border-subtle);
      padding-bottom: 4px;
    }

    .route-title-large {
      font-size: var(--so-font-sm);
      color: var(--so-text-primary);
    }

    .loc-trail {
      display: flex;
      flex-direction: column;
      padding-left: 6px;
    }

    .loc-point {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-top: 4px;
        flex-shrink: 0;

        &.start { background: #10B981; }
        &.end { background: #EF4444; }
      }

      .info {
        display: flex;
        flex-direction: column;

        .title {
          font-size: var(--so-font-xs);
          color: var(--so-text-primary);
        }

        .time {
          font-size: 10px;
          color: var(--so-text-muted);
        }
      }
    }

    .loc-trail-line {
      width: 2px;
      height: 24px;
      background: var(--so-border-strong);
      margin-left: 4px;
    }

    .trip-metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .metric-box {
      background: var(--so-surface-hover);
      border: 1px solid var(--so-border-subtle);
      border-radius: var(--so-radius-sm);
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .m-val {
        font-size: var(--so-font-sm);
        font-weight: var(--so-fw-bold);
        color: var(--so-text-primary);
      }

      .m-lbl {
        font-size: 10px;
        color: var(--so-text-muted);
        margin-top: 2px;
      }
    }

    .personnel-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;

      .p-item {
        display: flex;
        justify-content: space-between;
        font-size: var(--so-font-xs);

        .p-lbl { color: var(--so-text-muted); }
        .p-val { color: var(--so-text-primary); }
      }
    }

    .feedback-box {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: var(--so-radius-md);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .rating-stars {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #92400E;
        font-size: var(--so-font-sm);

        .star-icon {
          color: #F59E0B;
        }
      }

      .feedback-quote {
        font-size: var(--so-font-xs);
        color: #78350F;
        font-style: italic;
        line-height: 1.4;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripsComponent {
  private tripService = inject(TripService);

  readonly trips = this.tripService.trips;
  readonly filteredTrips = this.tripService.filteredTrips;
  readonly filter = this.tripService.filter;
  readonly selectedTrip = this.tripService.selectedTrip;
  readonly isDrawerOpen = this.tripService.isTripDrawerOpen;

  readonly totalDistanceKm = computed(() => {
    return this.trips().reduce((sum, t) => sum + t.distanceKm, 0).toFixed(1);
  });

  onSearchChanged(search: string): void {
    this.tripService.setFilter({ search });
  }

  clearFilter(): void {
    this.tripService.setFilter({ search: '', status: 'ALL', date: '' });
  }

  openTripDrawer(trip: Trip): void {
    this.tripService.openTripDrawer(trip);
  }

  closeTripDrawer(): void {
    this.tripService.closeTripDrawer();
  }

  trackByTripId(index: number, t: Trip): string {
    return t.id;
  }
}
