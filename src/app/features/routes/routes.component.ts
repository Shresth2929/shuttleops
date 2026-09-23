import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RouteService } from '../../core/services/route.service';
import { Route } from '../../core/models/route.model';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { RouteDrawerComponent } from './components/route-drawer/route-drawer.component';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatCardComponent,
    RouteDrawerComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <app-page-header
        title="Campus Transit Routes"
        subtitle="Configure shuttle routes, inspect stop sequences, and manage vehicle-driver allocations"
      >
        <div actions class="header-action-group">
          <div class="search-box-pill">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              type="text"
              placeholder="Filter routes by name, stop, code..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              aria-label="Filter routes"
            />
          </div>
        </div>
      </app-page-header>

      <!-- KPI Summary Cards -->
      <div class="metrics-grid">
        <app-stat-card
          label="Active Routes"
          [value]="routes().length"
          icon="alt_route"
          iconTheme="theme-primary"
          subtext="Covering 100% of campus academic & residential sectors"
        ></app-stat-card>

        <app-stat-card
          label="Total Transit Stops"
          [value]="totalStopsCount()"
          icon="place"
          iconTheme="theme-success"
          subtext="Including 6 major campus intermodal transfer hubs"
        ></app-stat-card>

        <app-stat-card
          label="Avg. Loop Duration"
          value="21.7 min"
          icon="timer"
          iconTheme="theme-info"
          subtext="Scheduled turn-around frequency"
        ></app-stat-card>

        <app-stat-card
          label="Daily Scheduled Trips"
          [value]="totalDailyTrips()"
          icon="repeat"
          iconTheme="theme-warning"
          subtext="Across morning, mid-day, and evening peaks"
        ></app-stat-card>
      </div>

      <!-- Routes Cards Grid -->
      <div class="routes-grid">
        <div
          *ngFor="let route of filteredRoutes(); trackBy: trackByRouteId"
          class="route-card"
          (click)="openRouteDrawer(route)"
        >
          <!-- Card Header -->
          <div class="route-card-header">
            <div class="code-and-status">
              <span class="route-code-pill font-mono">{{ route.code }}</span>
              <span class="active-dot-status">
                <span class="dot"></span> Active Route
              </span>
            </div>
            <div class="route-id-tag font-mono">{{ route.id }}</div>
          </div>

          <!-- Route Title -->
          <h3 class="route-title">{{ route.name }}</h3>

          <!-- Origin to Destination Terminal -->
          <div class="terminals-row">
            <div class="terminal-item">
              <div class="term-dot start"></div>
              <span class="term-name">{{ route.startPoint }}</span>
            </div>
            <div class="terminal-arrow">&rarr;</div>
            <div class="terminal-item">
              <div class="term-dot end"></div>
              <span class="term-name">{{ route.endPoint }}</span>
            </div>
          </div>

          <!-- Route Metrics Bar -->
          <div class="route-meta-strip font-mono">
            <div class="meta-unit">
              <mat-icon class="meta-icon">pin_drop</mat-icon>
              <span>{{ route.stops.length }} Stops</span>
            </div>
            <div class="meta-divider">•</div>
            <div class="meta-unit">
              <mat-icon class="meta-icon">schedule</mat-icon>
              <span>{{ route.estimatedDurationMinutes }} mins</span>
            </div>
            <div class="meta-divider">•</div>
            <div class="meta-unit">
              <mat-icon class="meta-icon">straighten</mat-icon>
              <span>{{ route.distanceKm }} km</span>
            </div>
          </div>

          <!-- Driver & Vehicle Assignments -->
          <div class="allocations-box">
            <div class="alloc-row">
              <div class="alloc-label">Assigned Vehicle:</div>
              <div class="alloc-value font-mono">
                <mat-icon class="alloc-icon">directions_bus</mat-icon>
                <span>{{ route.assignedVehicleNumber || 'Not Assigned' }}</span>
              </div>
            </div>
            <div class="alloc-row">
              <div class="alloc-label">Assigned Pilot:</div>
              <div class="alloc-value">
                <mat-icon class="alloc-icon">person</mat-icon>
                <span>{{ route.assignedDriverName || 'Not Assigned' }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer Action -->
          <div class="route-card-footer">
            <div class="peak-note">
              <span class="peak-badge font-mono">Peak: {{ route.peakHour }}</span>
            </div>
            <button
              mat-stroked-button
              class="btn-secondary btn-inspect"
              (click)="openRouteDrawer(route); $event.stopPropagation()"
            >
              <span>Inspect Stops</span>
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Route Details Drawer -->
      <app-route-drawer
        *ngIf="isDrawerOpen()"
        [route]="selectedRoute()"
        (close)="closeRouteDrawer()"
        (driverAssigned)="onDriverAssigned($event)"
        (vehicleAssigned)="onVehicleAssigned($event)"
      ></app-route-drawer>
    </div>
  `,
  styles: [`
    .header-action-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-box-pill {
      display: flex;
      align-items: center;
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 0 12px;
      height: 40px;
      width: 280px;

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

    .routes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    .route-card {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-lg);
      padding: 20px;
      box-shadow: var(--so-shadow-subtle);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: all var(--so-transition-fast);

      &:hover {
        border-color: var(--so-border-strong);
        transform: translateY(-2px);
        box-shadow: var(--so-shadow-md);
      }
    }

    .route-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .code-and-status {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .route-code-pill {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-bold);
      background: var(--so-primary-light);
      color: var(--so-primary);
      padding: 2px 8px;
      border-radius: var(--so-radius-sm);
    }

    .active-dot-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #059669;
      font-weight: var(--so-fw-medium);

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #10B981;
      }
    }

    .route-id-tag {
      font-size: 11px;
      color: var(--so-text-muted);
    }

    .route-title {
      font-size: var(--so-font-md);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-primary);
      margin: 0;
      line-height: 1.3;
    }

    .terminals-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--so-bg);
      border-radius: var(--so-radius-md);
      padding: 10px 12px;
    }

    .terminal-item {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;

      .term-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;

        &.start { background-color: #10B981; }
        &.end { background-color: #EF4444; }
      }

      .term-name {
        font-size: var(--so-font-xs);
        color: var(--so-text-primary);
        font-weight: var(--so-fw-medium);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .terminal-arrow {
      color: var(--so-text-muted);
      font-size: var(--so-font-sm);
    }

    .route-meta-strip {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: var(--so-text-secondary);

      .meta-unit {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .meta-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--so-text-muted);
      }

      .meta-divider {
        color: var(--so-border-strong);
      }
    }

    .allocations-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid var(--so-border-subtle);
      padding-top: 10px;
    }

    .alloc-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--so-font-xs);
    }

    .alloc-label {
      color: var(--so-text-muted);
      font-size: 11px;
    }

    .alloc-value {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--so-text-primary);
      font-weight: var(--so-fw-medium);

      .alloc-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--so-primary);
      }
    }

    .route-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--so-border-subtle);
      padding-top: 12px;
      margin-top: 2px;
    }

    .peak-badge {
      font-size: 10px;
      color: #92400E;
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      padding: 2px 6px;
      border-radius: var(--so-radius-sm);
    }

    .btn-inspect {
      padding: 4px 10px !important;
      font-size: var(--so-font-xs) !important;
      height: 32px;
      display: inline-flex;
      align-items: center;
      gap: 4px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoutesComponent {
  private routeService = inject(RouteService);

  readonly routes = this.routeService.routes;
  readonly selectedRoute = this.routeService.selectedRoute;
  readonly isDrawerOpen = this.routeService.isRouteDrawerOpen;
  readonly searchQuery = signal('');

  readonly totalStopsCount = computed(() => {
    return this.routes().reduce((sum, r) => sum + r.stops.length, 0);
  });

  readonly totalDailyTrips = computed(() => {
    return this.routes().reduce((sum, r) => sum + r.dailyTripsCount, 0);
  });

  readonly filteredRoutes = computed(() => {
    const list = this.routes();
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return list;

    return list.filter(r => {
      const matchName = r.name.toLowerCase().includes(q);
      const matchCode = r.code.toLowerCase().includes(q);
      const matchStops = r.stops.some(s => s.name.toLowerCase().includes(q));
      const matchDriver = r.assignedDriverName?.toLowerCase().includes(q);
      const matchVehicle = r.assignedVehicleNumber?.toLowerCase().includes(q);
      return matchName || matchCode || matchStops || matchDriver || matchVehicle;
    });
  });

  trackByRouteId(index: number, route: Route): string {
    return route.id;
  }

  openRouteDrawer(route: Route): void {
    this.routeService.openRouteDrawer(route);
  }

  closeRouteDrawer(): void {
    this.routeService.closeRouteDrawer();
  }

  onDriverAssigned(event: { driverId: string; driverName: string }): void {
    const r = this.selectedRoute();
    if (r) {
      this.routeService.assignDriver(r.id, event.driverId, event.driverName).subscribe();
    }
  }

  onVehicleAssigned(event: { vehicleId: string; vehicleNumber: string }): void {
    const r = this.selectedRoute();
    if (r) {
      this.routeService.assignVehicle(r.id, event.vehicleId, event.vehicleNumber).subscribe();
    }
  }
}
