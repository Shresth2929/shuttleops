export interface HourlyDemand {
  hour: string; // e.g. "08:00", "09:00"
  hourNumber: number; // 8, 9
  bookingCount: number;
  completedCount: number;
  cancelledCount: number;
  isPeak?: boolean;
}

export interface RouteDemand {
  routeId: string;
  routeName: string;
  totalBookings: number;
  completedBookings: number;
  occupancyRate: number; // percentage, e.g. 84
}

export interface DemandSummaryMetrics {
  totalBookingsToday: number;
  activeShuttlesCount: number;
  availableDriversCount: number;
  peakHourRange: string;
  pendingRequestsCount: number;
  fleetUtilizationRate: number;
  onTimeArrivalRate: number;
}
