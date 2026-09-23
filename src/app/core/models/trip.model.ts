import { BookingStatus } from './booking.model';

export interface Trip {
  id: string; // "TRP-8041"
  bookingId: string;
  date: string;
  routeId: string;
  routeName: string;
  pickupLocation: string;
  dropLocation: string;
  pickupTime: string;
  dropTime: string;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleNumber: string;
  passengerName: string;
  status: BookingStatus;
  durationMinutes: number;
  distanceKm: number;
  rating?: number;
  feedback?: string;
}
