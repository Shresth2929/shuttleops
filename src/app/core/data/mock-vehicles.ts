import { Vehicle } from '../models/vehicle.model';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'VEH-101',
    vehicleNumber: 'KA-01-EA-4521',
    type: 'Electric Shuttle',
    capacity: 18,
    currentOccupancy: 14,
    batteryOrFuelPercent: 88,
    status: 'In Service',
    currentDriverId: 'DRV-101',
    currentDriverName: 'Amit Verma',
    assignedRouteId: 'RT-101',
    assignedRouteName: 'Hostel Block A ↔ Academic Block'
  },
  {
    id: 'VEH-102',
    vehicleNumber: 'KA-01-EA-5102',
    type: 'Electric Shuttle',
    capacity: 18,
    currentOccupancy: 12,
    batteryOrFuelPercent: 74,
    status: 'In Service',
    currentDriverId: 'DRV-102',
    currentDriverName: 'Rahul Sharma',
    assignedRouteId: 'RT-102',
    assignedRouteName: 'Campus Gate ↔ Data Centre'
  },
  {
    id: 'VEH-103',
    vehicleNumber: 'KA-01-MJ-8834',
    type: 'Standard Van',
    capacity: 14,
    currentOccupancy: 9,
    batteryOrFuelPercent: 92,
    status: 'In Service',
    currentDriverId: 'DRV-103',
    currentDriverName: 'Neeraj Kumar',
    assignedRouteId: 'RT-103',
    assignedRouteName: 'Library ↔ Innovation Parking'
  },
  {
    id: 'VEH-104',
    vehicleNumber: 'KA-01-EA-9910',
    type: 'Mini Bus',
    capacity: 26,
    currentOccupancy: 21,
    batteryOrFuelPercent: 62,
    status: 'In Service',
    currentDriverId: 'DRV-104',
    currentDriverName: 'Arjun Mehta',
    assignedRouteId: 'RT-104',
    assignedRouteName: 'Main Gate ↔ Research Park'
  },
  {
    id: 'VEH-105',
    vehicleNumber: 'KA-01-EA-3120',
    type: 'Campus EV',
    capacity: 12,
    currentOccupancy: 0,
    batteryOrFuelPercent: 45,
    status: 'Charging',
    currentDriverId: 'DRV-105',
    currentDriverName: 'Vikram Singh',
    assignedRouteId: 'RT-105',
    assignedRouteName: 'Sports Complex ↔ Food Court'
  },
  {
    id: 'VEH-106',
    vehicleNumber: 'KA-01-MJ-7741',
    type: 'Standard Van',
    capacity: 14,
    currentOccupancy: 0,
    batteryOrFuelPercent: 95,
    status: 'Idle',
    currentDriverId: 'DRV-106',
    currentDriverName: 'Suresh Patil',
    assignedRouteId: 'RT-106',
    assignedRouteName: 'Staff Quarters ↔ Admin Building'
  }
];
