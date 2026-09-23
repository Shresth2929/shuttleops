import { TestBed } from '@angular/core/testing';
import { BookingService } from './booking.service';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';
import { Booking } from '../models/booking.model';

describe('BookingService', () => {
  let service: BookingService;
  let storageService: jasmine.SpyObj<StorageService>;
  let notifService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', ['getItem', 'setItem', 'removeItem']);
    storageSpy.getItem.and.returnValue([]);

    const notifSpy = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError', 'showInfo']);

    TestBed.configureTestingModule({
      providers: [
        BookingService,
        { provide: NotificationService, useValue: notifSpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(BookingService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    notifService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created and initialize with mock bookings if storage is empty', () => {
    expect(service).toBeTruthy();
    expect(service.bookings().length).toBeGreaterThan(0);
  });

  it('should create a new booking with generated ID and initial timeline event', (done) => {
    const initialCount = service.bookings().length;
    const newBookingData: Omit<Booking, 'id' | 'createdAt' | 'timeline'> = {
      employeeId: 'EMP-999',
      employeeName: 'Rahul Dravid',
      employeeEmail: 'rahul.d@campusops.in',
      employeeDepartment: 'Athletics',
      employeePhone: '+91 99999 88888',
      pickupLocation: 'Hostel Block A',
      dropLocation: 'Academic Block Central',
      date: '2026-09-22',
      requestedPickupTime: '10:00',
      plannedPickupTime: '10:00',
      plannedDropTime: '10:25',
      status: 'Requested',
      routeId: 'RT-101',
      routeName: 'Hostel Block A ↔ Academic Block',
      vehicleId: 'VEH-101',
      vehicleNumber: 'KA-01-EA-4521',
      driverId: 'DRV-101',
      driverName: 'Amit Verma'
    };

    service.createBooking(newBookingData).subscribe(created => {
      expect(created.id).toContain('BK-');
      expect(created.employeeName).toBe('Rahul Dravid');
      expect(created.timeline.length).toBe(1);
      expect(service.bookings().length).toBe(initialCount + 1);
      expect(storageService.setItem).toHaveBeenCalled();
      expect(notifService.showSuccess).toHaveBeenCalled();
      done();
    });
  });

  it('should update an existing booking and append a timeline entry', (done) => {
    const firstBooking = service.bookings()[0];
    const initialTimelineLength = firstBooking.timeline.length;

    service.updateBooking(firstBooking.id, { status: 'On Going' }).subscribe(updated => {
      expect(updated.status).toBe('On Going');
      expect(updated.timeline.length).toBe(initialTimelineLength + 1);
      done();
    });
  });

  it('should cancel a booking with reason notes and status Cancelled', (done) => {
    const target = service.bookings().find(b => b.status === 'Requested') || service.bookings()[0];

    service.cancelBooking(target.id, 'Student sick').subscribe(cancelled => {
      expect(cancelled.status).toBe('Cancelled');
      expect(cancelled.notes).toContain('Student sick');
      done();
    });
  });

  it('should mark a booking as No Show', (done) => {
    const target = service.bookings()[0];

    service.markNoShow(target.id).subscribe(noShow => {
      expect(noShow.status).toBe('No Show');
      done();
    });
  });

  it('should correctly filter bookings by search query and status', () => {
    service.setFilter({ search: 'Pooja', status: 'ALL' });
    const filtered = service.filteredBookings();
    expect(filtered.every(b => b.employeeName.toLowerCase().includes('pooja'))).toBeTrue();

    service.setFilter({ search: '', status: 'Cancelled' });
    const cancelledList = service.filteredBookings();
    expect(cancelledList.every(b => b.status === 'Cancelled')).toBeTrue();
  });
});
