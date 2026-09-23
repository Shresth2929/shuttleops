import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Driver, DriverActivity, DriverActivityType, DriverStatus } from '../models/driver.model';
import { MOCK_DRIVERS } from '../data/mock-drivers';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

export interface ScheduleValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly STORAGE_KEY = 'drivers_v1';
  private storage = inject(StorageService);
  private notification = inject(NotificationService);

  private driversState = signal<Driver[]>([]);
  readonly drivers = this.driversState.asReadonly();

  readonly selectedDriver = signal<Driver | null>(null);
  readonly selectedActivity = signal<DriverActivity | null>(null);
  readonly selectedDate = signal<string>('2026-09-22');
  readonly isActivityDrawerOpen = signal<boolean>(false);
  readonly activityDrawerMode = signal<'create' | 'edit'>('create');
  readonly loading = signal<boolean>(false);

  // Summary counts
  readonly availabilitySummary = computed(() => {
    const list = this.driversState();
    return {
      total: list.length,
      available: list.filter(d => d.status === 'Available').length,
      onTrip: list.filter(d => d.status === 'On Trip').length,
      onBreak: list.filter(d => d.status === 'On Break').length,
      offDuty: list.filter(d => d.status === 'Off Duty').length
    };
  });

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const stored = this.storage.getItem<Driver[]>(this.STORAGE_KEY, []);
    if (stored && stored.length > 0) {
      this.driversState.set(stored);
    } else {
      this.driversState.set(MOCK_DRIVERS);
      this.storage.setItem(this.STORAGE_KEY, MOCK_DRIVERS);
    }
  }

  private persist(drivers: Driver[]): void {
    this.driversState.set(drivers);
    this.storage.setItem(this.STORAGE_KEY, drivers);
  }

  getDrivers(): Observable<Driver[]> {
    this.loading.set(true);
    return of(this.driversState()).pipe(
      delay(200),
      tap(() => this.loading.set(false))
    );
  }

  getDriverById(id: string): Observable<Driver | undefined> {
    return of(this.driversState().find(d => d.id === id)).pipe(
      delay(100)
    );
  }

  /**
   * Validates driver activity scheduling rules
   */
  validateActivity(
    driverId: string,
    activity: Omit<DriverActivity, 'id'>,
    excludeActivityId?: string
  ): ScheduleValidationResult {
    const driver = this.driversState().find(d => d.id === driverId);
    if (!driver) {
      return { isValid: false, errorMessage: 'Selected driver does not exist.' };
    }

    // Rule 1: End time must be after Start time
    const startMinutes = this.timeToMinutes(activity.startTime);
    const endMinutes = this.timeToMinutes(activity.endTime);

    if (isNaN(startMinutes) || isNaN(endMinutes)) {
      return { isValid: false, errorMessage: 'Please specify valid start and end times.' };
    }

    if (endMinutes <= startMinutes) {
      return { isValid: false, errorMessage: 'End time must be after start time.' };
    }

    // Rule 2: Minimum activity duration (at least 10 minutes)
    if (endMinutes - startMinutes < 10) {
      return { isValid: false, errorMessage: 'Activity duration must be at least 10 minutes.' };
    }

    // Rule 3: Duty schedule span check for Break / Trip
    const shiftStartMin = this.timeToMinutes(driver.shift.startTime);
    const shiftEndMin = this.timeToMinutes(driver.shift.endTime);

    if (activity.type === 'Break' || activity.type === 'Pickup/Drop') {
      if (startMinutes < shiftStartMin || endMinutes > shiftEndMin) {
        return {
          isValid: false,
          errorMessage: `Activity must fall within driver shift (${driver.shift.startTime} - ${driver.shift.endTime}).`
        };
      }
    }

    // Rule 4: Overlapping specific activities (Trip, Break, Vehicle change, Empty leg)
    // Activities of the same specific type or overlapping trip/break
    const otherActivities = driver.activities.filter(
      a => a.id !== excludeActivityId && a.type !== 'Duty' && activity.type !== 'Duty'
    );

    for (const other of otherActivities) {
      const otherStart = this.timeToMinutes(other.startTime);
      const otherEnd = this.timeToMinutes(other.endTime);

      // Check interval intersection: max(start1, start2) < min(end1, end2)
      if (Math.max(startMinutes, otherStart) < Math.min(endMinutes, otherEnd)) {
        return {
          isValid: false,
          errorMessage: `Time slot overlaps with existing ${other.type} activity (${other.startTime} - ${other.endTime}).`
        };
      }
    }

    return { isValid: true };
  }

  addActivity(driverId: string, activityData: Omit<DriverActivity, 'id' | 'driverId'>): Observable<DriverActivity> {
    const validation = this.validateActivity(driverId, { ...activityData, driverId });
    if (!validation.isValid) {
      this.notification.showError(validation.errorMessage || 'Invalid schedule');
      return throwError(() => new Error(validation.errorMessage));
    }

    const currentDrivers = this.driversState();
    const index = currentDrivers.findIndex(d => d.id === driverId);
    if (index === -1) {
      return throwError(() => new Error('Driver not found'));
    }

    const driver = currentDrivers[index];
    const newActivity: DriverActivity = {
      ...activityData,
      id: `ACT-${driverId}-${Date.now()}`,
      driverId: driverId
    };

    const updatedDriver: Driver = {
      ...driver,
      activities: [...driver.activities, newActivity]
    };

    const updatedDrivers = [...currentDrivers];
    updatedDrivers[index] = updatedDriver;
    this.persist(updatedDrivers);

    if (this.selectedDriver()?.id === driverId) {
      this.selectedDriver.set(updatedDriver);
    }

    this.notification.showSuccess('Driver activity added to schedule.');
    this.closeActivityDrawer();

    return of(newActivity).pipe(delay(200));
  }

  updateActivity(
    driverId: string,
    activityId: string,
    updates: Partial<DriverActivity>
  ): Observable<DriverActivity> {
    const currentDrivers = this.driversState();
    const driverIndex = currentDrivers.findIndex(d => d.id === driverId);
    if (driverIndex === -1) {
      return throwError(() => new Error('Driver not found'));
    }

    const driver = currentDrivers[driverIndex];
    const actIndex = driver.activities.findIndex(a => a.id === activityId);
    if (actIndex === -1) {
      return throwError(() => new Error('Activity not found'));
    }

    const mergedActivity: DriverActivity = {
      ...driver.activities[actIndex],
      ...updates
    };

    const validation = this.validateActivity(driverId, mergedActivity, activityId);
    if (!validation.isValid) {
      this.notification.showError(validation.errorMessage || 'Invalid schedule update');
      return throwError(() => new Error(validation.errorMessage));
    }

    const updatedActivities = [...driver.activities];
    updatedActivities[actIndex] = mergedActivity;

    const updatedDriver: Driver = {
      ...driver,
      activities: updatedActivities
    };

    const updatedDrivers = [...currentDrivers];
    updatedDrivers[driverIndex] = updatedDriver;
    this.persist(updatedDrivers);

    if (this.selectedDriver()?.id === driverId) {
      this.selectedDriver.set(updatedDriver);
    }

    this.notification.showSuccess('Schedule activity updated.');
    this.closeActivityDrawer();

    return of(mergedActivity).pipe(delay(200));
  }

  deleteActivity(driverId: string, activityId: string): Observable<boolean> {
    const currentDrivers = this.driversState();
    const driverIndex = currentDrivers.findIndex(d => d.id === driverId);
    if (driverIndex === -1) return of(false);

    const driver = currentDrivers[driverIndex];
    const updatedActivities = driver.activities.filter(a => a.id !== activityId);

    const updatedDriver: Driver = {
      ...driver,
      activities: updatedActivities
    };

    const updatedDrivers = [...currentDrivers];
    updatedDrivers[driverIndex] = updatedDriver;
    this.persist(updatedDrivers);

    if (this.selectedDriver()?.id === driverId) {
      this.selectedDriver.set(updatedDriver);
    }

    this.notification.showSuccess('Activity removed from schedule.');
    this.closeActivityDrawer();

    return of(true).pipe(delay(200));
  }

  updateDriverStatus(driverId: string, status: DriverStatus): Observable<Driver> {
    const currentDrivers = this.driversState();
    const index = currentDrivers.findIndex(d => d.id === driverId);
    if (index === -1) return throwError(() => new Error('Driver not found'));

    const updatedDriver: Driver = {
      ...currentDrivers[index],
      status
    };

    const updatedDrivers = [...currentDrivers];
    updatedDrivers[index] = updatedDriver;
    this.persist(updatedDrivers);

    if (this.selectedDriver()?.id === driverId) {
      this.selectedDriver.set(updatedDriver);
    }

    this.notification.showSuccess(`Driver status changed to ${status}`);
    return of(updatedDriver).pipe(delay(150));
  }

  // Drawer / UI Management
  openCreateActivity(driver?: Driver): void {
    if (driver) this.selectedDriver.set(driver);
    this.selectedActivity.set(null);
    this.activityDrawerMode.set('create');
    this.isActivityDrawerOpen.set(true);
  }

  openEditActivity(driver: Driver, activity: DriverActivity): void {
    this.selectedDriver.set(driver);
    this.selectedActivity.set(activity);
    this.activityDrawerMode.set('edit');
    this.isActivityDrawerOpen.set(true);
  }

  closeActivityDrawer(): void {
    this.isActivityDrawerOpen.set(false);
    this.selectedActivity.set(null);
  }

  public timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  public minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
}
