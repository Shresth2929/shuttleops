export interface RouteStop {
  id: string;
  name: string;
  sequence: number;
  timeOffsetMinutes: number; // e.g. 0, 5, 12, 18, 25
  isMajorHub?: boolean;
}

export type RouteStatus = 'Active' | 'Under Maintenance' | 'Suspended';

export interface Route {
  id: string; // "RT-101"
  name: string; // "Hostel Block A ↔ Academic Block"
  code: string; // "H-AC"
  startPoint: string;
  endPoint: string;
  stops: RouteStop[];
  estimatedDurationMinutes: number;
  distanceKm: number;
  assignedVehicleId?: string;
  assignedVehicleNumber?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  status: RouteStatus;
  dailyTripsCount: number;
  peakHour: string;
}
