import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadChildren: () => import('./features/overview/overview.routes').then(m => m.OVERVIEW_ROUTES),
    title: 'Overview — ShuttleOps'
  },
  {
    path: 'bookings',
    loadChildren: () => import('./features/bookings/bookings.routes').then(m => m.BOOKINGS_ROUTES),
    title: 'Bookings — ShuttleOps'
  },
  {
    path: 'drivers',
    loadChildren: () => import('./features/drivers/drivers.routes').then(m => m.DRIVERS_ROUTES),
    title: 'Driver Schedule — ShuttleOps'
  },
  {
    path: 'routes',
    loadChildren: () => import('./features/routes/routes.routes').then(m => m.ROUTES_ROUTES),
    title: 'Routes — ShuttleOps'
  },
  {
    path: 'analytics',
    loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES),
    title: 'Demand & Usage — ShuttleOps'
  },
  {
    path: 'trips',
    loadChildren: () => import('./features/trips/trips.routes').then(m => m.TRIPS_ROUTES),
    title: 'Trip History — ShuttleOps'
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found — ShuttleOps'
  }
];
