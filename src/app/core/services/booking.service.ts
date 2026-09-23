import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Booking, BookingFilter, BookingStatus, BookingTimelineEvent } from '../models/booking.model';
import { MOCK_BOOKINGS } from '../data/mock-bookings';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly STORAGE_KEY = 'bookings_v1';
  private storage = inject(StorageService);
  private notification = inject(NotificationService);

  // State Signals
  private bookingsState = signal<Booking[]>([]);
  readonly bookings = this.bookingsState.asReadonly();

  readonly selectedBooking = signal<Booking | null>(null);
  readonly isDrawerOpen = signal<boolean>(false);
  readonly drawerMode = signal<'view' | 'edit' | 'create'>('view');
  readonly loading = signal<boolean>(false);
  readonly filter = signal<BookingFilter>({
    search: '',
    status: 'ALL',
    date: '2026-09-22',
    routeId: ''
  });

  // Filtered computed signal for rapid template binding
  readonly filteredBookings = computed(() => {
    const list = this.bookingsState();
    const f = this.filter();

    return list.filter(b => {
      // Filter by status
      if (f.status && f.status !== 'ALL' && b.status !== f.status) {
        return false;
      }
      // Filter by route
      if (f.routeId && b.routeId !== f.routeId) {
        return false;
      }
      // Filter by date
      if (f.date && b.date !== f.date) {
        return false;
      }
      // Filter by search query (id, employee, pickup, drop, driver, vehicle)
      if (f.search && f.search.trim() !== '') {
        const q = f.search.toLowerCase().trim();
        const matchesId = b.id.toLowerCase().includes(q);
        const matchesEmployee = b.employeeName.toLowerCase().includes(q) || b.employeeEmail.toLowerCase().includes(q);
        const matchesFrom = b.pickupLocation.toLowerCase().includes(q);
        const matchesTo = b.dropLocation.toLowerCase().includes(q);
        const matchesDriver = b.driverName.toLowerCase().includes(q);
        const matchesVehicle = b.vehicleNumber.toLowerCase().includes(q);
        const matchesRoute = b.routeName.toLowerCase().includes(q);

        if (!matchesId && !matchesEmployee && !matchesFrom && !matchesTo && !matchesDriver && !matchesVehicle && !matchesRoute) {
          return false;
        }
      }
      return true;
    });
  });

  // Computed summary counts
  readonly stats = computed(() => {
    const list = this.bookingsState();
    const today = '2026-09-22';
    const todayBookings = list.filter(b => b.date === today);

    return {
      total: todayBookings.length,
      accepted: todayBookings.filter(b => b.status === 'Accepted').length,
      requested: todayBookings.filter(b => b.status === 'Requested').length,
      waiting: todayBookings.filter(b => b.status === 'Waiting').length,
      ongoing: todayBookings.filter(b => b.status === 'On Going').length,
      completed: todayBookings.filter(b => b.status === 'Completed').length,
      cancelled: todayBookings.filter(b => b.status === 'Cancelled').length,
      noShow: todayBookings.filter(b => b.status === 'No Show').length
    };
  });

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const stored = this.storage.getItem<Booking[]>(this.STORAGE_KEY, []);
    if (stored && stored.length > 0) {
      this.bookingsState.set(stored);
    } else {
      this.bookingsState.set(MOCK_BOOKINGS);
      this.storage.setItem(this.STORAGE_KEY, MOCK_BOOKINGS);
    }
  }

  private persist(bookings: Booking[]): void {
    this.bookingsState.set(bookings);
    this.storage.setItem(this.STORAGE_KEY, bookings);
  }

  // REST API Ready Observables with simulated latency
  getBookings(): Observable<Booking[]> {
    this.loading.set(true);
    return of(this.bookingsState()).pipe(
      delay(200),
      tap(() => this.loading.set(false))
    );
  }

  getBookingById(id: string): Observable<Booking | undefined> {
    return of(this.bookingsState().find(b => b.id === id)).pipe(
      delay(100)
    );
  }

  createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'timeline'>): Observable<Booking> {
    this.loading.set(true);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const nextIdNumber = 1000 + this.bookingsState().length + 1;
    const newId = `BK-${nextIdNumber}`;

    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdAt: now.toISOString(),
      timeline: [
        {
          timestamp: timeStr,
          status: bookingData.status || 'Requested',
          description: `Booking requested by ${bookingData.employeeName}`,
          actor: bookingData.employeeName
        }
      ]
    };

    const updated = [newBooking, ...this.bookingsState()];
    this.persist(updated);

    return of(newBooking).pipe(
      delay(250),
      tap(() => {
        this.loading.set(false);
        this.notification.showSuccess(`Booking ${newId} created successfully.`);
      })
    );
  }

  updateBooking(id: string, updates: Partial<Booking>): Observable<Booking> {
    this.loading.set(true);
    const currentList = this.bookingsState();
    const index = currentList.findIndex(b => b.id === id);

    if (index === -1) {
      this.loading.set(false);
      return throwError(() => new Error(`Booking ${id} not found`));
    }

    const existing = currentList[index];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let updatedTimeline = [...existing.timeline];
    if (updates.status && updates.status !== existing.status) {
      updatedTimeline.push({
        timestamp: timeStr,
        status: updates.status,
        description: `Status updated to ${updates.status}`,
        actor: 'Dispatcher'
      });
    }

    const updatedBooking: Booking = {
      ...existing,
      ...updates,
      timeline: updatedTimeline
    };

    const updatedList = [...currentList];
    updatedList[index] = updatedBooking;
    this.persist(updatedList);

    // Update selected if open
    if (this.selectedBooking()?.id === id) {
      this.selectedBooking.set(updatedBooking);
    }

    return of(updatedBooking).pipe(
      delay(200),
      tap(() => {
        this.loading.set(false);
        this.notification.showSuccess(`Booking ${id} updated.`);
      })
    );
  }

  cancelBooking(id: string, reason?: string): Observable<Booking> {
    return this.updateBooking(id, {
      status: 'Cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled by Operations'
    });
  }

  markNoShow(id: string): Observable<Booking> {
    return this.updateBooking(id, {
      status: 'No Show',
      notes: 'Passenger was not present at pickup location'
    });
  }

  // Drawer / UI helpers
  openCreateDrawer(): void {
    this.selectedBooking.set(null);
    this.drawerMode.set('create');
    this.isDrawerOpen.set(true);
  }

  openViewDrawer(booking: Booking): void {
    this.selectedBooking.set(booking);
    this.drawerMode.set('view');
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(booking: Booking): void {
    this.selectedBooking.set(booking);
    this.drawerMode.set('edit');
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedBooking.set(null);
  }

  setFilter(filterUpdates: Partial<BookingFilter>): void {
    this.filter.update(current => ({ ...current, ...filterUpdates }));
  }

  resetFilters(): void {
    this.filter.set({
      search: '',
      status: 'ALL',
      date: '2026-09-22',
      routeId: ''
    });
  }
}
