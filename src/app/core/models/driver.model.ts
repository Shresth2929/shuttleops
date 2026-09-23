export type DriverStatus = 'Available' | 'On Trip' | 'On Break' | 'Off Duty';

export type DriverActivityType =
  | 'Duty'
  | 'Pickup/Drop'
  | 'Break'
  | 'Vehicle change'
  | 'Empty leg';

export interface DriverActivity {
  id: string;
  driverId: string;
  type: DriverActivityType;
  startTime: string; // "08:00"
  endTime: string;   // "10:30"
  date: string;      // "2026-09-22"
  routeId?: string;
  routeName?: string;
  bookingId?: string;
  vehicleId?: string;
  vehicleNumber?: string;
  notes?: string;
}

export interface DriverShift {
  startTime: string; // "06:00"
  endTime: string;   // "15:00"
}

export interface Driver {
  id: string; // "DRV-101"
  name: string;
  phone: string;
  licenseNumber: string;
  status: DriverStatus;
  currentVehicleId?: string;
  currentVehicleNumber?: string;
  shift: DriverShift;
  rating: number;
  totalTripsToday: number;
  activities: DriverActivity[];
}
