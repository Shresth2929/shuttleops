import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';
import { MOCK_VEHICLES } from '../data/mock-vehicles';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly STORAGE_KEY = 'vehicles_v1';
  private storage = inject(StorageService);

  private vehiclesState = signal<Vehicle[]>([]);
  readonly vehicles = this.vehiclesState.asReadonly();
  readonly loading = signal<boolean>(false);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const stored = this.storage.getItem<Vehicle[]>(this.STORAGE_KEY, []);
    if (stored && stored.length > 0) {
      this.vehiclesState.set(stored);
    } else {
      this.vehiclesState.set(MOCK_VEHICLES);
      this.storage.setItem(this.STORAGE_KEY, MOCK_VEHICLES);
    }
  }

  getVehicles(): Observable<Vehicle[]> {
    this.loading.set(true);
    return of(this.vehiclesState()).pipe(
      delay(150),
      tap(() => this.loading.set(false))
    );
  }
}
