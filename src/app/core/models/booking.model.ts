export type BookingStatus =
  | 'Accepted'
  | 'Requested'
  | 'Waiting'
  | 'On Going'
  | 'Completed'
  | 'Cancelled'
  | 'Declined'
  | 'No Show';

export interface BookingTimelineEvent {
  timestamp: string;
  status: BookingStatus;
  description: string;
  actor: string;
}

export interface Booking {
  id: string; // e.g. BK-1024
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeeDepartment: string;
  employeePhone: string;
  pickupLocation: string; // e.g. "Hostel Block A"
  dropLocation: string;   // e.g. "Academic Block"
  date: string;           // YYYY-MM-DD
  requestedPickupTime: string; // HH:mm (e.g. "08:30")
  plannedPickupTime: string;   // HH:mm (e.g. "08:35")
  actualPickupTime?: string;   // HH:mm (e.g. "08:38")
  plannedDropTime: string;     // HH:mm (e.g. "08:55")
  actualDropTime?: string;     // HH:mm (e.g. "08:58")
  status: BookingStatus;
  routeId: string;
  routeName: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  notes?: string;
  timeline: BookingTimelineEvent[];
  createdAt: string;
}

export interface BookingFilter {
  search?: string;
  status?: BookingStatus | 'ALL';
  date?: string;
  routeId?: string;
}
