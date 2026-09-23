import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CURRENT_USER } from '../../core/data/mock-users';
import { BookingService } from '../../core/services/booking.service';
import { DriverService } from '../../core/services/driver.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: () => string | number | null;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <aside class="sidebar-container" [class.collapsed]="isCollapsed">
      <!-- Brand Logo & Header -->
      <div class="sidebar-brand">
        <div class="brand-logo-badge">
          <mat-icon>airport_shuttle</mat-icon>
        </div>
        <div class="brand-info" *ngIf="!isCollapsed">
          <div class="brand-name">ShuttleOps</div>
          <div class="brand-tagline">Smart Campus Transit</div>
        </div>
      </div>

      <!-- Campus Context Indicator -->
      <div class="campus-selector" *ngIf="!isCollapsed">
        <div class="campus-label">OPERATIONS HUB</div>
        <div class="campus-current">
          <mat-icon class="campus-icon">business</mat-icon>
          <span class="campus-text">{{ user.campusLocation }}</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="sidebar-nav" aria-label="Main Navigation">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.path"
          routerLinkActive="active-link"
          class="nav-link"
          [title]="item.label"
          (click)="navClicked.emit()"
        >
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          <span class="nav-label" *ngIf="!isCollapsed">{{ item.label }}</span>
          <span
            *ngIf="!isCollapsed && item.badge && item.badge()"
            class="nav-badge"
          >
            {{ item.badge() }}
          </span>
        </a>
      </nav>

      <!-- User Profile at Bottom -->
      <div class="sidebar-footer">
        <div class="user-card" *ngIf="!isCollapsed">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-details">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-role">{{ user.role }}</div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 260px;
      min-width: 260px;
      height: 100vh;
      background-color: var(--so-sidebar-bg);
      border-right: 1px solid var(--so-sidebar-border);
      display: flex;
      flex-direction: column;
      color: var(--so-sidebar-text);
      transition: width var(--so-transition-base);
      user-select: none;
      z-index: 100;

      &.collapsed {
        width: 72px;
        min-width: 72px;
      }
    }

    .sidebar-brand {
      height: 64px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid var(--so-sidebar-border);
    }

    .brand-logo-badge {
      width: 36px;
      height: 36px;
      border-radius: var(--so-radius-md);
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .brand-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .brand-name {
      font-size: var(--so-font-md);
      font-weight: var(--so-fw-bold);
      color: #FFFFFF;
      letter-spacing: -0.01em;
    }

    .brand-tagline {
      font-size: var(--so-font-xs);
      color: #64748B;
      font-weight: var(--so-fw-medium);
    }

    .campus-selector {
      padding: 14px 18px;
      margin: 12px 14px 6px 14px;
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: var(--so-radius-md);

      .campus-label {
        font-size: 10px;
        font-weight: var(--so-fw-bold);
        color: #64748B;
        letter-spacing: 0.08em;
      }

      .campus-current {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
        color: #F1F5F9;
        font-size: var(--so-font-xs);
        font-weight: var(--so-fw-semibold);

        .campus-icon {
          font-size: 15px;
          width: 15px;
          height: 15px;
          color: #38BDF8;
        }

        .campus-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .sidebar-nav {
      flex: 1;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--so-radius-md);
      color: var(--so-sidebar-text);
      font-size: var(--so-font-base);
      font-weight: var(--so-fw-medium);
      transition: all var(--so-transition-fast);
      position: relative;

      .nav-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #64748B;
        transition: color var(--so-transition-fast);
      }

      &:hover {
        background-color: var(--so-sidebar-hover);
        color: #F8FAFC;

        .nav-icon {
          color: #94A3B8;
        }
      }

      &.active-link {
        background-color: #1E293B;
        color: #FFFFFF;
        font-weight: var(--so-fw-semibold);

        .nav-icon {
          color: #38BDF8;
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 3px;
          background-color: #38BDF8;
          border-radius: 0 2px 2px 0;
        }
      }
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
    }

    .nav-badge {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-bold);
      background: #3B82F6;
      color: #FFFFFF;
      padding: 1px 7px;
      border-radius: var(--so-radius-full);
      font-family: 'Roboto Mono', monospace;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--so-sidebar-border);
      background-color: rgba(15, 23, 42, 0.6);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #334155;
      color: #F1F5F9;
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-bold);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #475569;
    }

    .user-details {
      overflow: hidden;
    }

    .user-name {
      font-size: var(--so-font-sm);
      font-weight: var(--so-fw-semibold);
      color: #FFFFFF;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .user-role {
      font-size: 11px;
      color: #94A3B8;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() navClicked = new EventEmitter<void>();

  private bookingService = inject(BookingService);
  private driverService = inject(DriverService);

  readonly user = CURRENT_USER;

  get userInitials(): string {
    return this.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2);
  }

  readonly navItems: NavItem[] = [
    {
      path: '/overview',
      label: 'Overview',
      icon: 'dashboard'
    },
    {
      path: '/bookings',
      label: 'Bookings',
      icon: 'confirmation_number',
      badge: () => {
        const stats = this.bookingService.stats();
        return stats.requested > 0 ? stats.requested : null;
      }
    },
    {
      path: '/drivers',
      label: 'Driver Schedule',
      icon: 'schedule',
      badge: () => {
        const summary = this.driverService.availabilitySummary();
        return summary.available > 0 ? `${summary.available} Avail` : null;
      }
    },
    {
      path: '/routes',
      label: 'Routes',
      icon: 'alt_route'
    },
    {
      path: '/analytics',
      label: 'Demand & Usage',
      icon: 'insights'
    },
    {
      path: '/trips',
      label: 'Trip History',
      icon: 'history'
    }
  ];
}
