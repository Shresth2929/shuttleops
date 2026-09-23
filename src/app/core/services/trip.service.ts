import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Trip } from '../models/trip.model';
import { MOCK_TRIPS } from '../data/mock-trips';
import { StorageService } from './storage.service';

export interface TripFilter {
  search?: string;
  status?: string;
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private readonly STORAGE_KEY = 'trips_v1';
  private storage = inject(StorageService);

  private tripsState = signal<Trip[]>([]);
  readonly trips = this.tripsState.asReadonly();
  readonly selectedTrip = signal<Trip | null>(null);
  readonly isTripDrawerOpen = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  readonly filter = signal<TripFilter>({
    search: '',
    status: 'ALL',
    date: ''
  });

  readonly filteredTrips = computed(() => {
    const list = this.tripsState();
    const f = this.filter();

    return list.filter(t => {
      if (f.status && f.status !== 'ALL' && t.status !== f.status) return false;
      if (f.date && t.date !== f.date) return false;
      if (f.search && f.search.trim() !== '') {
        const q = f.search.toLowerCase().trim();
        const matchesId = t.id.toLowerCase().includes(q) || t.bookingId.toLowerCase().includes(q);
        const matchesRoute = t.routeName.toLowerCase().includes(q);
        const matchesPassenger = t.passengerName.toLowerCase().includes(q);
        const matchesDriver = t.driverName.toLowerCase().includes(q);
        const matchesVehicle = t.vehicleNumber.toLowerCase().includes(q);
        if (!matchesId && !matchesRoute && !matchesPassenger && !matchesDriver && !matchesVehicle) return false;
      }
      return true;
    });
  });

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const stored = this.storage.getItem<Trip[]>(this.STORAGE_KEY, []);
    if (stored && stored.length > 0) {
      this.tripsState.set(stored);
    } else {
      this.tripsState.set(MOCK_TRIPS);
      this.storage.setItem(this.STORAGE_KEY, MOCK_TRIPS);
    }
  }

  getTrips(): Observable<Trip[]> {
    this.loading.set(true);
    return of(this.tripsState()).pipe(
      delay(200),
      tap(() => this.loading.set(false))
    );
  }

  openTripDrawer(trip: Trip): void {
    this.selectedTrip.set(trip);
    this.isTripDrawerOpen.set(true);
  }

  closeTripDrawer(): void {
    this.isTripDrawerOpen.set(false);
    this.selectedTrip.set(null);
  }

  setFilter(filterUpdates: Partial<TripFilter>): void {
    this.filter.update(current => ({ ...current, ...filterUpdates }));
  }
}
