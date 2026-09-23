import { TestBed } from '@angular/core/testing';
import { DriverService } from './driver.service';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { DriverActivity } from '../models/driver.model';

describe('DriverService', () => {
  let service: DriverService;
  let notifService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);
    storageSpy.getItem.and.returnValue([]);

    const notifSpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError', 'showInfo']);

    TestBed.configureTestingModule({
      providers: [
        DriverService,
        { provide: NotificationService, useValue: notifSpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(DriverService);
    notifService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should initialize with drivers and availability metrics', () => {
    expect(service.drivers().length).toBeGreaterThan(0);
    const summary = service.availabilitySummary();
    expect(summary.total).toBe(service.drivers().length);
    expect(summary.available + summary.onTrip + summary.onBreak + summary.offDuty).toBe(summary.total);
  });

  describe('validateActivity()', () => {
    it('should reject an activity where end time is before or equal to start time', () => {
      const driver = service.drivers()[0];
      const invalidActivity: Omit<DriverActivity, 'id'> = {
        driverId: driver.id,
        type: 'Break',
        startTime: '14:00',
        endTime: '13:30',
        date: '2026-09-22'
      };

      const result = service.validateActivity(driver.id, invalidActivity);
      expect(result.isValid).toBeFalse();
      expect(result.errorMessage).toBe('End time must be after start time.');
    });

    it('should reject a break activity that falls outside driver shift window', () => {
      const driver = service.drivers().find(d => d.shift.startTime === '06:00' && d.shift.endTime === '15:00')!;
      const invalidActivity: Omit<DriverActivity, 'id'> = {
        driverId: driver.id,
        type: 'Break',
        startTime: '16:00',
        endTime: '17:00',
        date: '2026-09-22'
      };

      const result = service.validateActivity(driver.id, invalidActivity);
      expect(result.isValid).toBeFalse();
      expect(result.errorMessage).toContain('must fall within driver shift');
    });

    it('should reject overlapping pickup/drop activities for the same driver', () => {
      const driver = service.drivers().find(d => d.id === 'DRV-101')!;
      // DRV-101 has an activity at 08:00 - 09:00
      const overlappingActivity: Omit<DriverActivity, 'id'> = {
        driverId: driver.id,
        type: 'Pickup/Drop',
        startTime: '08:30',
        endTime: '09:30',
        date: '2026-09-22',
        routeId: 'RT-101'
      };

      const result = service.validateActivity(driver.id, overlappingActivity);
      expect(result.isValid).toBeFalse();
      expect(result.errorMessage).toContain('overlaps with existing');
    });

    it('should approve a valid, non-overlapping activity within shift hours', () => {
      const driver = service.drivers().find(d => d.id === 'DRV-101')!;
      const validActivity: Omit<DriverActivity, 'id'> = {
        driverId: driver.id,
        type: 'Break',
        startTime: '14:00',
        endTime: '14:30',
        date: '2026-09-22'
      };

      const result = service.validateActivity(driver.id, validActivity);
      expect(result.isValid).toBeTrue();
    });
  });

  describe('addActivity() & deleteActivity()', () => {
    it('should add a valid activity and update driver activity count', (done) => {
      const driver = service.drivers().find(d => d.id === 'DRV-101')!;
      const initialCount = driver.activities.length;

      const validActivity = {
        type: 'Break' as const,
        startTime: '14:00',
        endTime: '14:30',
        date: '2026-09-22',
        notes: 'Afternoon tea'
      };

      service.addActivity(driver.id, validActivity).subscribe(created => {
        expect(created.id).toContain('ACT-');
        const updatedDriver = service.drivers().find(d => d.id === driver.id)!;
        expect(updatedDriver.activities.length).toBe(initialCount + 1);
        expect(notifService.showSuccess).toHaveBeenCalled();
        done();
      });
    });

    it('should delete an activity by ID', (done) => {
      const driver = service.drivers().find(d => d.id === 'DRV-101')!;
      const activityToDelete = driver.activities.find(a => a.type !== 'Duty')!;
      const initialCount = driver.activities.length;

      service.deleteActivity(driver.id, activityToDelete.id).subscribe(success => {
        expect(success).toBeTrue();
        const updatedDriver = service.drivers().find(d => d.id === driver.id)!;
        expect(updatedDriver.activities.length).toBe(initialCount - 1);
        expect(notifService.showSuccess).toHaveBeenCalled();
        done();
      });
    });
  });
});
