import { Component, Output, EventEmitter, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { CURRENT_USER } from '../../core/data/mock-users';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule],
  template: `
    <header class="app-header">
      <!-- Left side: Mobile Hamburger & Search -->
      <div class="header-left">
        <button
          mat-icon-button
          class="mobile-menu-btn"
          (click)="toggleSidebar.emit()"
          aria-label="Toggle navigation menu"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <div class="global-search-bar">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            type="text"
            placeholder="Search bookings, drivers, routes..."
            (keyup.enter)="onSearch($event)"
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            aria-label="Quick Search"
          />
        </div>
      </div>

      <!-- Right side: Campus Live Clock, Quick Action, Alerts & Profile -->
      <div class="header-right">
        <!-- Live Campus Clock -->
        <div class="live-clock-pill">
          <span class="pulse-indicator"></span>
          <span class="clock-time font-mono">Tuesday, Sep 22 • 13:30 IST</span>
        </div>

        <!-- Quick New Booking Action -->
        <button
          mat-flat-button
          class="btn-primary quick-add-btn"
          (click)="onCreateBooking()"
        >
          <mat-icon>add</mat-icon>
          <span>New Booking</span>
        </button>

        <!-- Notifications Menu -->
        <button
          mat-icon-button
          [matMenuTriggerFor]="notificationsMenu"
          class="header-icon-btn"
          aria-label="Notifications"
        >
          <mat-icon
            [matBadge]="notificationsCount"
            matBadgeColor="warn"
            matBadgeSize="small"
            aria-hidden="false"
          >
            notifications
          </mat-icon>
        </button>

        <mat-menu #notificationsMenu="matMenu" xPosition="before" class="notification-dropdown">
          <div class="notif-header" (click)="$event.stopPropagation()">
            <div class="notif-title">Operational Alerts</div>
            <span class="notif-count">{{ notificationsCount }} Unresolved</span>
          </div>
          <div class="notif-item" (click)="$event.stopPropagation()">
            <mat-icon class="notif-item-icon warning">warning</mat-icon>
            <div class="notif-text">
              <div class="notif-msg">EV Shuttle VEH-105 charging below 50%</div>
              <div class="notif-time">12 mins ago • Sports Complex Depot</div>
            </div>
          </div>
          <div class="notif-item" (click)="$event.stopPropagation()">
            <mat-icon class="notif-item-icon info">info</mat-icon>
            <div class="notif-text">
              <div class="notif-msg">Hostel Block A peak queue detected (3 waiting)</div>
              <div class="notif-time">24 mins ago • RT-101 Route</div>
            </div>
          </div>
        </mat-menu>

        <!-- User Profile Pill -->
        <div class="header-user-pill">
          <div class="user-avatar-sm">
            {{ userInitials }}
          </div>
          <div class="user-pill-text">
            <span class="user-pill-name">{{ user.name }}</span>
            <span class="user-pill-tag">Ops Admin</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      height: 64px;
      background-color: var(--so-surface);
      border-bottom: 1px solid var(--so-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 90;
      box-shadow: var(--so-shadow-subtle);

      @media (max-width: 768px) {
        padding: 0 16px;
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      max-width: 480px;
    }

    .mobile-menu-btn {
      display: none;

      @media (max-width: 1024px) {
        display: inline-flex;
      }
    }

    .global-search-bar {
      display: flex;
      align-items: center;
      background-color: var(--so-bg);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 6px 12px;
      width: 100%;
      transition: all var(--so-transition-fast);

      &:focus-within {
        background-color: #FFFFFF;
        border-color: var(--so-primary);
        box-shadow: 0 0 0 3px var(--so-primary-light);
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
        font-size: var(--so-font-sm);
        color: var(--so-text-primary);
        width: 100%;
        outline: none;
        font-family: inherit;

        &::placeholder {
          color: var(--so-text-muted);
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .live-clock-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--so-bg);
      border: 1px solid var(--so-border);
      padding: 6px 12px;
      border-radius: var(--so-radius-full);
      font-size: var(--so-font-xs);
      color: var(--so-text-secondary);

      @media (max-width: 900px) {
        display: none;
      }
    }

    .pulse-indicator {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background-color: #10B981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .quick-add-btn {
      font-size: var(--so-font-sm) !important;
      padding: 6px 14px !important;

      @media (max-width: 600px) {
        span {
          display: none;
        }
        padding: 6px 8px !important;
      }
    }

    .header-icon-btn {
      color: var(--so-text-secondary);
    }

    .header-user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-left: 8px;
      border-left: 1px solid var(--so-border);

      @media (max-width: 600px) {
        .user-pill-text {
          display: none;
        }
      }
    }

    .user-avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--so-primary);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: var(--so-fw-bold);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-pill-text {
      display: flex;
      flex-direction: column;
    }

    .user-pill-name {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-semibold);
      color: var(--so-text-primary);
      line-height: 1.2;
    }

    .user-pill-tag {
      font-size: 10px;
      color: var(--so-text-muted);
    }

    .notif-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--so-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notif-title {
      font-weight: var(--so-fw-bold);
      font-size: var(--so-font-sm);
    }

    .notif-count {
      font-size: 11px;
      color: #DC2626;
      font-weight: var(--so-fw-semibold);
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--so-border-subtle);
      width: 280px;

      &:hover {
        background-color: var(--so-surface-hover);
      }
    }

    .notif-item-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-top: 2px;

      &.warning { color: #D97706; }
      &.info { color: #2563EB; }
    }

    .notif-text {
      flex: 1;
    }

    .notif-msg {
      font-size: var(--so-font-xs);
      color: var(--so-text-primary);
      line-height: 1.3;
    }

    .notif-time {
      font-size: 10px;
      color: var(--so-text-muted);
      margin-top: 2px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private router = inject(Router);
  private bookingService = inject(BookingService);

  readonly user = CURRENT_USER;
  readonly notificationsCount = 2;
  readonly searchTerm = signal('');

  get userInitials(): string {
    return this.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2);
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value.trim()) {
      this.bookingService.setFilter({ search: value.trim() });
      this.router.navigate(['/bookings']);
    }
  }

  onCreateBooking(): void {
    this.bookingService.openCreateDrawer();
    this.router.navigate(['/bookings']);
  }
}
