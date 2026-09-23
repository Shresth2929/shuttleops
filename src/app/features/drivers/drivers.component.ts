import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

import { DriverService } from '../../core/services/driver.service';
import { Driver, DriverActivity, DriverStatus } from '../../core/models/driver.model';

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DriverTimelineComponent } from './components/driver-timeline/driver-timeline.component';
import { ActivityEditorComponent } from './components/activity-editor/activity-editor.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
    DriverTimelineComponent,
    ActivityEditorComponent
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <app-page-header
        title="Driver Schedule & Duty Timeline"
        subtitle="Manage daily driver availability, shift assignments, and transit trip blocks"
      >
        <div actions class="header-action-group">
          <div class="date-selector-pill font-mono">
            <mat-icon>event</mat-icon>
            <span>Tuesday, 22 Sep 2026</span>
          </div>
          <button mat-flat-button class="btn-primary" (click)="openCreateActivity()">
            <mat-icon>add</mat-icon>
            <span>Add Schedule Activity</span>
          </button>
        </div>
      </app-page-header>

      <!-- Driver Availability Cards Grid -->
      <div class="metrics-grid">
        <app-stat-card
          label="Total Fleet Drivers"
          [value]="summary().total"
          icon="badge"
          iconTheme="theme-primary"
          subtext="8 registered campus transit pilots"
        ></app-stat-card>

        <app-stat-card
          label="Available Drivers"
          [value]="summary().available"
          icon="check_circle"
          iconTheme="theme-success"
          badgeText="Active"
          badgeTheme="theme-success"
          subtext="Ready for dispatch / on standby"
        ></app-stat-card>

        <app-stat-card
          label="Drivers On Trip"
          [value]="summary().onTrip"
          icon="directions_bus"
          iconTheme="theme-primary"
          subtext="Currently navigating campus routes"
        ></app-stat-card>

        <app-stat-card
          label="On Rest Break"
          [value]="summary().onBreak"
          icon="coffee"
          iconTheme="theme-warning"
          badgeText="Rest"
          badgeTheme="theme-warning"
          subtext="Scheduled mid-shift rest window"
        ></app-stat-card>

        <app-stat-card
          label="Off Duty"
          [value]="summary().offDuty"
          icon="nightlight"
          iconTheme="theme-info"
          subtext="Evening / Night shift roster"
        ></app-stat-card>
      </div>

      <!-- Driver Timeline Component -->
      <app-driver-timeline
        [drivers]="drivers()"
        (driverSelected)="onDriverSelected($event)"
        (activityClicked)="onActivityClicked($event)"
        (addActivityClicked)="onAddActivityForDriver($event)"
      ></app-driver-timeline>

      <!-- Side Drawer for Activity Editing / Creating & Driver Status -->
      <div *ngIf="isDrawerOpen()" class="drawer-backdrop" (click)="closeDrawer()" aria-hidden="true"></div>

      <aside *ngIf="isDrawerOpen()" class="activity-drawer" role="dialog" aria-labelledby="activity-drawer-title">
        <div class="drawer-header">
          <div class="header-left">
            <h2 id="activity-drawer-title" class="drawer-title">
              {{ drawerMode() === 'edit' ? 'Edit Activity Block' : 'Schedule New Activity' }}
            </h2>
            <div class="drawer-subtitle" *ngIf="selectedDriver()">
              {{ selectedDriver()?.name }} • {{ selectedDriver()?.id }}
            </div>
          </div>
          <button mat-icon-button (click)="closeDrawer()" class="close-drawer-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="drawer-body">
          <!-- Driver Status Fast Switcher -->
          <div class="status-modifier-card" *ngIf="selectedDriver()">
            <div class="status-modifier-title">Driver Shift Availability</div>
            <div class="status-button-group">
              <button
                type="button"
                class="status-toggle-btn"
                [class.active]="selectedDriver()?.status === 'Available'"
                (click)="updateDriverStatus('Available')"
              >
                Available
              </button>
              <button
                type="button"
                class="status-toggle-btn"
                [class.active]="selectedDriver()?.status === 'On Trip'"
                (click)="updateDriverStatus('On Trip')"
              >
                On Trip
              </button>
              <button
                type="button"
                class="status-toggle-btn"
                [class.active]="selectedDriver()?.status === 'On Break'"
                (click)="updateDriverStatus('On Break')"
              >
                On Break
              </button>
              <button
                type="button"
                class="status-toggle-btn"
                [class.active]="selectedDriver()?.status === 'Off Duty'"
                (click)="updateDriverStatus('Off Duty')"
              >
                Off Duty
              </button>
            </div>
          </div>

          <!-- Activity Editor Form -->
          <app-activity-editor
            [driver]="selectedDriver()"
            [activity]="selectedActivity()"
            [isEditMode]="drawerMode() === 'edit'"
            (saved)="onActivitySaved($event)"
            (cancelled)="closeDrawer()"
            (deleted)="onActivityDeleted()"
          ></app-activity-editor>
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(15, 23, 42, 0.4);
      z-index: 150;
    }

    .activity-drawer {
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
      gap: 2px;
    }

    .drawer-title {
      font-size: var(--so-font-lg);
      font-weight: var(--so-fw-bold);
      color: var(--so-text-primary);
      margin: 0;
    }

    .drawer-subtitle {
      font-size: var(--so-font-xs);
      color: var(--so-text-muted);
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

    .status-modifier-card {
      background: var(--so-bg);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-modifier-title {
      font-size: 11px;
      font-weight: var(--so-fw-bold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--so-text-muted);
    }

    .status-button-group {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }

    .status-toggle-btn {
      padding: 6px 8px;
      border-radius: var(--so-radius-sm);
      border: 1px solid var(--so-border);
      background: var(--so-surface);
      font-size: 11px;
      font-weight: var(--so-fw-medium);
      color: var(--so-text-secondary);
      transition: all var(--so-transition-fast);

      &:hover {
        background-color: var(--so-surface-hover);
      }

      &.active {
        background-color: var(--so-primary);
        color: #FFFFFF;
        border-color: var(--so-primary);
        font-weight: var(--so-fw-bold);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriversComponent {
  private driverService = inject(DriverService);
  private dialog = inject(MatDialog);

  readonly drivers = this.driverService.drivers;
  readonly summary = this.driverService.availabilitySummary;
  readonly selectedDriver = this.driverService.selectedDriver;
  readonly selectedActivity = this.driverService.selectedActivity;
  readonly isDrawerOpen = this.driverService.isActivityDrawerOpen;
  readonly drawerMode = this.driverService.activityDrawerMode;

  onDriverSelected(driver: Driver): void {
    this.driverService.openCreateActivity(driver);
  }

  onActivityClicked(event: { driver: Driver; activity: DriverActivity }): void {
    this.driverService.openEditActivity(event.driver, event.activity);
  }

  onAddActivityForDriver(driver: Driver): void {
    this.driverService.openCreateActivity(driver);
  }

  openCreateActivity(): void {
    this.driverService.openCreateActivity(this.drivers()[0]);
  }

  closeDrawer(): void {
    this.driverService.closeActivityDrawer();
  }

  updateDriverStatus(status: DriverStatus): void {
    const d = this.selectedDriver();
    if (d) {
      this.driverService.updateDriverStatus(d.id, status).subscribe();
    }
  }

  onActivitySaved(formData: any): void {
    const d = this.selectedDriver();
    if (!d) return;

    if (this.drawerMode() === 'create') {
      this.driverService.addActivity(d.id, formData).subscribe();
    } else if (this.drawerMode() === 'edit' && this.selectedActivity()) {
      this.driverService.updateActivity(d.id, this.selectedActivity()!.id, formData).subscribe();
    }
  }

  onActivityDeleted(): void {
    const d = this.selectedDriver();
    const a = this.selectedActivity();
    if (!d || !a) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Activity',
        message: `Remove this ${a.type} activity (${a.startTime} - ${a.endTime}) from ${d.name}'s schedule?`,
        confirmText: 'Delete Activity',
        cancelText: 'Keep Activity',
        isDestructive: true
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.driverService.deleteActivity(d.id, a.id).subscribe();
      }
    });
  }
}
