import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Route } from '../models/route.model';
import { MOCK_ROUTES } from '../data/mock-routes';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private readonly STORAGE_KEY = 'routes_v1';
  private storage = inject(StorageService);
  private notification = inject(NotificationService);

  private routesState = signal<Route[]>([]);
  readonly routes = this.routesState.asReadonly();

  readonly selectedRoute = signal<Route | null>(null);
  readonly isRouteDrawerOpen = signal<boolean>(false);
  readonly loading = signal<boolean>(false);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const stored = this.storage.getItem<Route[]>(this.STORAGE_KEY, []);
    if (stored && stored.length > 0) {
      this.routesState.set(stored);
    } else {
      this.routesState.set(MOCK_ROUTES);
      this.storage.setItem(this.STORAGE_KEY, MOCK_ROUTES);
    }
  }

  private persist(routes: Route[]): void {
    this.routesState.set(routes);
    this.storage.setItem(this.STORAGE_KEY, routes);
  }

  getRoutes(): Observable<Route[]> {
    this.loading.set(true);
    return of(this.routesState()).pipe(
      delay(200),
      tap(() => this.loading.set(false))
    );
  }

  getRouteById(id: string): Observable<Route | undefined> {
    return of(this.routesState().find(r => r.id === id)).pipe(delay(100));
  }

  assignDriver(routeId: string, driverId: string, driverName: string): Observable<Route> {
    const current = this.routesState();
    const index = current.findIndex(r => r.id === routeId);
    if (index === -1) throw new Error('Route not found');

    const updatedRoute: Route = {
      ...current[index],
      assignedDriverId: driverId,
      assignedDriverName: driverName
    };

    const updatedList = [...current];
    updatedList[index] = updatedRoute;
    this.persist(updatedList);

    if (this.selectedRoute()?.id === routeId) {
      this.selectedRoute.set(updatedRoute);
    }

    this.notification.showSuccess(`Driver ${driverName} assigned to route ${updatedRoute.code}`);
    return of(updatedRoute).pipe(delay(200));
  }

  assignVehicle(routeId: string, vehicleId: string, vehicleNumber: string): Observable<Route> {
    const current = this.routesState();
    const index = current.findIndex(r => r.id === routeId);
    if (index === -1) throw new Error('Route not found');

    const updatedRoute: Route = {
      ...current[index],
      assignedVehicleId: vehicleId,
      assignedVehicleNumber: vehicleNumber
    };

    const updatedList = [...current];
    updatedList[index] = updatedRoute;
    this.persist(updatedList);

    if (this.selectedRoute()?.id === routeId) {
      this.selectedRoute.set(updatedRoute);
    }

    this.notification.showSuccess(`Vehicle ${vehicleNumber} assigned to route ${updatedRoute.code}`);
    return of(updatedRoute).pipe(delay(200));
  }

  openRouteDrawer(route: Route): void {
    this.selectedRoute.set(route);
    this.isRouteDrawerOpen.set(true);
  }

  closeRouteDrawer(): void {
    this.isRouteDrawerOpen.set(false);
    this.selectedRoute.set(null);
  }
}
