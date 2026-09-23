export type VehicleType = 'Standard Van' | 'Electric Shuttle' | 'Mini Bus' | 'Campus EV';
export type VehicleStatus = 'In Service' | 'Maintenance' | 'Idle' | 'Charging';

export interface Vehicle {
  id: string; // "VEH-101"
  vehicleNumber: string; // "KA-01-EA-4521"
  type: VehicleType;
  capacity: number; // e.g. 14, 22
  currentOccupancy: number;
  batteryOrFuelPercent: number;
  status: VehicleStatus;
  currentDriverId?: string;
  currentDriverName?: string;
  assignedRouteId?: string;
  assignedRouteName?: string;
}
