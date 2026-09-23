import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BookingService } from '../../core/services/booking.service';
import { RouteService } from '../../core/services/route.service';
import { Booking, BookingStatus } from '../../core/models/booking.model';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { BookingDrawerComponent } from './components/booking-drawer/booking-drawer.component';

type SortColumn = 'id' | 'employeeName' | 'requestedPickupTime' | 'status' | 'routeName';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    BookingDrawerComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <app-page-header
        title="Bookings Management"
        subtitle="Search, filter, schedule, and dispatch campus shuttle reservations"
      >
        <div actions class="header-action-group">
          <button mat-flat-button class="btn-primary" (click)="openCreateDrawer()">
            <mat-icon>add</mat-icon>
            <span>New Booking</span>
          </button>
        </div>
      </app-page-header>

      <!-- Filter Controls Bar -->
      <div class="filter-controls-panel">
        <div class="filter-top-row">
          <!-- Search Input -->
          <div class="search-input-wrapper">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              type="text"
              placeholder="Search by ID, passenger, route, driver, vehicle..."
              [ngModel]="filterState().search"
              (ngModelChange)="onSearchChanged($event)"
              class="filter-search-box"
              aria-label="Search bookings"
            />
            <button
              *ngIf="filterState().search"
              mat-icon-button
              class="clear-search-btn"
              (click)="onSearchChanged('')"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Route Filter Dropdown -->
          <div class="filter-select-wrapper">
            <select
              [ngModel]="filterState().routeId"
              (ngModelChange)="onRouteFilterChanged($event)"
              class="so-select"
              aria-label="Filter by route"
            >
              <option value="">All Campus Routes</option>
              <option *ngFor="let r of routes()" [value]="r.id">{{ r.code }} • {{ r.name }}</option>
            </select>
          </div>

          <!-- Date Selector -->
          <div class="filter-date-wrapper">
            <input
              type="date"
              [ngModel]="filterState().date"
              (ngModelChange)="onDateFilterChanged($event)"
              class="so-date-input"
              aria-label="Filter by date"
            />
          </div>

          <!-- Reset Filter Button -->
          <button
            *ngIf="hasActiveFilters()"
            mat-stroked-button
            class="btn-secondary btn-reset"
            (click)="resetFilters()"
          >
            <mat-icon>filter_alt_off</mat-icon>
            <span>Reset</span>
          </button>
        </div>

        <!-- Status Filter Tabs -->
        <div class="status-tabs-row" role="tablist" aria-label="Status filter">
          <button
            *ngFor="let tab of statusTabs"
            class="status-tab-btn"
            [class.active]="filterState().status === tab.value"
            (click)="onStatusTabChanged(tab.value)"
            role="tab"
            [attr.aria-selected]="filterState().status === tab.value"
          >
            <span>{{ tab.label }}</span>
            <span class="tab-badge font-mono">{{ getStatusCount(tab.value) }}</span>
          </button>
        </div>
      </div>

      <!-- Bookings Data Table -->
      <div class="so-table-container">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th (click)="toggleSort('id')" class="sortable-th">
                  <div class="th-content">
                    <span>Booking ID</span>
                    <mat-icon class="sort-icon">{{ getSortIcon('id') }}</mat-icon>
                  </div>
                </th>
                <th (click)="toggleSort('employeeName')" class="sortable-th">
                  <div class="th-content">
                    <span>Passenger / Employee</span>
                    <mat-icon class="sort-icon">{{ getSortIcon('employeeName') }}</mat-icon>
                  </div>
                </th>
                <th>From</th>
                <th>To</th>
                <th (click)="toggleSort('requestedPickupTime')" class="sortable-th">
                  <div class="th-content">
                    <span>Requested</span>
                    <mat-icon class="sort-icon">{{ getSortIcon('requestedPickupTime') }}</mat-icon>
                  </div>
                </th>
                <th>Pickup</th>
                <th>Planned Drop</th>
                <th>Actual Drop</th>
                <th (click)="toggleSort('status')" class="sortable-th">
                  <div class="th-content">
                    <span>Status</span>
                    <mat-icon class="sort-icon">{{ getSortIcon('status') }}</mat-icon>
                  </div>
                </th>
                <th>Vehicle</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let b of paginatedBookings(); trackBy: trackByBookingId"
                class="clickable-row"
                (click)="openViewDrawer(b)"
              >
                <!-- Booking ID -->
                <td>
                  <span class="booking-id-text font-mono font-bold">{{ b.id }}</span>
                </td>

                <!-- Employee Info -->
                <td>
                  <div class="employee-cell">
                    <span class="emp-name font-semibold">{{ b.employeeName }}</span>
                    <span class="emp-dept text-muted">{{ b.employeeDepartment }}</span>
                  </div>
                </td>

                <!-- From & To -->
                <td>
                  <span class="location-text">{{ b.pickupLocation }}</span>
                </td>
                <td>
                  <span class="location-text">{{ b.dropLocation }}</span>
                </td>

                <!-- Requested Pickup -->
                <td>
                  <span class="font-mono font-medium">{{ b.requestedPickupTime }}</span>
                </td>

                <!-- Pickup -->
                <td>
                  <span class="font-mono">{{ b.actualPickupTime || b.plannedPickupTime || '—' }}</span>
                </td>

                <!-- Planned Drop -->
                <td>
                  <span class="font-mono text-muted">{{ b.plannedDropTime }}</span>
                </td>

                <!-- Actual Drop -->
                <td>
                  <span class="font-mono">{{ b.actualDropTime || '—' }}</span>
                </td>

                <!-- Status -->
                <td>
                  <app-status-badge [status]="b.status"></app-status-badge>
                </td>

                <!-- Vehicle -->
                <td>
                  <div class="vehicle-cell font-mono">
                    <span>{{ b.vehicleNumber }}</span>
                  </div>
                </td>

                <!-- Actions Menu -->
                <td class="text-right" (click)="$event.stopPropagation()">
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="actionMenu"
                    class="row-menu-trigger"
                    aria-label="Booking actions"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>

                  <mat-menu #actionMenu="matMenu" xPosition="before">
                    <button mat-menu-item (click)="openViewDrawer(b)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                    <button mat-menu-item (click)="openEditDrawer(b)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit Booking</span>
                    </button>
                    <button
                      *ngIf="b.status !== 'Cancelled' && b.status !== 'Completed'"
                      mat-menu-item
                      (click)="cancelBooking(b)"
                      class="menu-item-danger"
                    >
                      <mat-icon>cancel</mat-icon>
                      <span>Cancel Booking</span>
                    </button>
                    <button
                      *ngIf="b.status !== 'No Show' && b.status !== 'Completed'"
                      mat-menu-item
                      (click)="markNoShow(b)"
                    >
                      <mat-icon>person_off</mat-icon>
                      <span>Mark No Show</span>
                    </button>
                  </mat-menu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <app-empty-state
          *ngIf="sortedBookings().length === 0"
          icon="search_off"
          title="No bookings found"
          description="No bookings match your current search query or active filter criteria."
          actionLabel="Reset Filters"
          actionIcon="restart_alt"
          (actionClicked)="resetFilters()"
        ></app-empty-state>

        <!-- Pagination Controls Footer -->
        <div *ngIf="sortedBookings().length > 0" class="pagination-footer">
          <div class="pagination-info">
            Showing <span class="font-bold">{{ paginationStart() }}</span> to
            <span class="font-bold">{{ paginationEnd() }}</span> of
            <span class="font-bold">{{ sortedBookings().length }}</span> bookings
          </div>

          <div class="pagination-controls">
            <button
              mat-stroked-button
              class="btn-secondary page-btn"
              [disabled]="currentPage() === 1"
              (click)="prevPage()"
            >
              <mat-icon>chevron_left</mat-icon>
              <span>Previous</span>
            </button>
            
            <span class="page-indicator font-mono">
              Page {{ currentPage() }} of {{ totalPages() }}
            </span>

            <button
              mat-stroked-button
              class="btn-secondary page-btn"
              [disabled]="currentPage() === totalPages()"
              (click)="nextPage()"
            >
              <span>Next</span>
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Booking Side Drawer (View / Edit / Create) -->
      <app-booking-drawer
        *ngIf="isDrawerOpen()"
        [booking]="selectedBooking()"
        [mode]="drawerMode()"
        (close)="closeDrawer()"
        (editClicked)="openEditDrawer($event)"
        (cancelClicked)="cancelBooking($event)"
        (noShowClicked)="markNoShow($event)"
        (formSubmitted)="onFormSubmitted($event)"
      ></app-booking-drawer>
    </div>
  `,
  styles: [`
    .header-action-group {
      display: flex;
      gap: 12px;
    }

    .filter-controls-panel {
      background: var(--so-surface);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-lg);
      padding: 16px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: var(--so-shadow-subtle);
    }

    .filter-top-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-input-wrapper {
      flex: 1;
      min-width: 260px;
      display: flex;
      align-items: center;
      background: var(--so-bg);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 0 12px;
      height: 40px;

      &:focus-within {
        border-color: var(--so-primary);
        background: #FFFFFF;
        box-shadow: 0 0 0 2px var(--so-primary-light);
      }

      .search-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--so-text-muted);
        margin-right: 8px;
      }

      .filter-search-box {
        flex: 1;
        border: none;
        background: transparent;
        font-size: var(--so-font-sm);
        outline: none;
        font-family: inherit;
        color: var(--so-text-primary);
      }

      .clear-search-btn {
        width: 24px;
        height: 24px;
        line-height: 24px;
        color: var(--so-text-muted);

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .filter-select-wrapper, .filter-date-wrapper {
      display: flex;
    }

    .so-select, .so-date-input {
      height: 40px;
      padding: 0 12px;
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      background: var(--so-surface);
      font-size: var(--so-font-sm);
      color: var(--so-text-primary);
      font-family: inherit;
      outline: none;
      cursor: pointer;

      &:focus {
        border-color: var(--so-primary);
        box-shadow: 0 0 0 2px var(--so-primary-light);
      }
    }

    .btn-reset {
      height: 40px;
    }

    /* Status Tabs */
    .status-tabs-row {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .status-tab-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--so-radius-full);
      background: var(--so-bg);
      border: 1px solid var(--so-border);
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-medium);
      color: var(--so-text-secondary);
      white-space: nowrap;
      transition: all var(--so-transition-fast);

      &:hover {
        background-color: var(--so-surface-hover);
        color: var(--so-text-primary);
      }

      &.active {
        background-color: var(--so-primary);
        color: #FFFFFF;
        border-color: var(--so-primary);

        .tab-badge {
          background-color: rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
        }
      }
    }

    .tab-badge {
      padding: 1px 6px;
      border-radius: var(--so-radius-full);
      background: var(--so-surface);
      color: var(--so-text-primary);
      font-size: 10px;
      font-weight: var(--so-fw-bold);
    }

    /* Table Styles */
    .table-responsive {
      overflow-x: auto;
    }

    .sortable-th {
      cursor: pointer;
      user-select: none;

      &:hover {
        background-color: var(--so-surface-active);
      }
    }

    .th-content {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sort-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--so-text-muted);
    }

    .booking-id-text {
      color: var(--so-primary);
    }

    .employee-cell {
      display: flex;
      flex-direction: column;

      .emp-name {
        font-size: var(--so-font-sm);
        color: var(--so-text-primary);
      }

      .emp-dept {
        font-size: 11px;
      }
    }

    .location-text {
      font-size: var(--so-font-xs);
      color: var(--so-text-secondary);
    }

    .vehicle-cell {
      font-size: var(--so-font-xs);
      color: var(--so-text-primary);
    }

    .row-menu-trigger {
      color: var(--so-text-muted);
    }

    .menu-item-danger {
      color: #DC2626 !important;
    }

    .text-right {
      text-align: right;
    }

    .pagination-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-top: 1px solid var(--so-border-subtle);
      background-color: var(--so-surface);
      flex-wrap: wrap;
      gap: 12px;
    }

    .pagination-info {
      font-size: var(--so-font-xs);
      color: var(--so-text-secondary);
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-indicator {
      font-size: var(--so-font-xs);
      color: var(--so-text-muted);
    }

    .page-btn {
      padding: 4px 10px !important;
      font-size: var(--so-font-xs) !important;
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
export class BookingsComponent {
  private bookingService = inject(BookingService);
  private routeService = inject(RouteService);

  readonly routes = this.routeService.routes;
  readonly filterState = this.bookingService.filter;
  readonly isDrawerOpen = this.bookingService.isDrawerOpen;
  readonly drawerMode = this.bookingService.drawerMode;
  readonly selectedBooking = this.bookingService.selectedBooking;

  // Sorting state signals
  readonly sortColumn = signal<SortColumn>('requestedPickupTime');
  readonly sortDirection = signal<SortDirection>('asc');

  // Pagination state signals
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(8);

  readonly statusTabs: { label: string; value: BookingStatus | 'ALL' }[] = [
    { label: 'All Bookings', value: 'ALL' },
    { label: 'Requested', value: 'Requested' },
    { label: 'Accepted', value: 'Accepted' },
    { label: 'Waiting', value: 'Waiting' },
    { label: 'On Going', value: 'On Going' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'No Show', value: 'No Show' }
  ];

  readonly sortedBookings = computed(() => {
    const list = [...this.bookingService.filteredBookings()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return list.sort((a, b) => {
      let valA = a[col] || '';
      let valB = b[col] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.sortedBookings().length / this.pageSize()) || 1;
  });

  readonly paginatedBookings = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return this.sortedBookings().slice(start, start + size);
  });

  readonly paginationStart = computed(() => {
    if (this.sortedBookings().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly paginationEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.sortedBookings().length);
  });

  getStatusCount(status: BookingStatus | 'ALL'): number {
    const all = this.bookingService.bookings();
    if (status === 'ALL') return all.length;
    return all.filter(b => b.status === status).length;
  }

  hasActiveFilters(): boolean {
    const f = this.filterState();
    return !!(f.search || (f.status && f.status !== 'ALL') || f.routeId);
  }

  onSearchChanged(val: string): void {
    this.bookingService.setFilter({ search: val });
    this.currentPage.set(1);
  }

  onStatusTabChanged(status: BookingStatus | 'ALL'): void {
    this.bookingService.setFilter({ status });
    this.currentPage.set(1);
  }

  onRouteFilterChanged(routeId: string): void {
    this.bookingService.setFilter({ routeId });
    this.currentPage.set(1);
  }

  onDateFilterChanged(date: string): void {
    this.bookingService.setFilter({ date });
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.bookingService.resetFilters();
    this.currentPage.set(1);
  }

  toggleSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn() !== column) return 'unfold_more';
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  trackByBookingId(index: number, b: Booking): string {
    return b.id;
  }

  openCreateDrawer(): void {
    this.bookingService.openCreateDrawer();
  }

  openViewDrawer(booking: Booking): void {
    this.bookingService.openViewDrawer(booking);
  }

  openEditDrawer(booking: Booking): void {
    this.bookingService.openEditDrawer(booking);
  }

  closeDrawer(): void {
    this.bookingService.closeDrawer();
  }

  cancelBooking(booking: Booking): void {
    this.bookingService.cancelBooking(booking.id).subscribe();
  }

  markNoShow(booking: Booking): void {
    this.bookingService.markNoShow(booking.id).subscribe();
  }

  onFormSubmitted(formData: any): void {
    if (this.drawerMode() === 'create') {
      this.bookingService.createBooking(formData).subscribe(() => {
        this.closeDrawer();
      });
    } else if (this.drawerMode() === 'edit' && this.selectedBooking()) {
      this.bookingService.updateBooking(this.selectedBooking()!.id, formData).subscribe(() => {
        this.closeDrawer();
      });
    }
  }
}
