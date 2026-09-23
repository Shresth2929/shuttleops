import { Route } from '../models/route.model';

export const MOCK_ROUTES: Route[] = [
  {
    id: 'RT-101',
    name: 'Hostel Block A ↔ Academic Block',
    code: 'H-AC',
    startPoint: 'Hostel Block A',
    endPoint: 'Academic Block Central',
    estimatedDurationMinutes: 22,
    distanceKm: 4.2,
    assignedVehicleId: 'VEH-101',
    assignedVehicleNumber: 'KA-01-EA-4521',
    assignedDriverId: 'DRV-101',
    assignedDriverName: 'Amit Verma',
    status: 'Active',
    dailyTripsCount: 16,
    peakHour: '08:00 - 10:00',
    stops: [
      { id: 'ST-101', name: 'Hostel Block A', sequence: 1, timeOffsetMinutes: 0, isMajorHub: true },
      { id: 'ST-102', name: 'Hostel Block C Gate', sequence: 2, timeOffsetMinutes: 4 },
      { id: 'ST-103', name: 'Central Library Junction', sequence: 3, timeOffsetMinutes: 9, isMajorHub: true },
      { id: 'ST-104', name: 'Engineering Quad', sequence: 4, timeOffsetMinutes: 15 },
      { id: 'ST-105', name: 'Academic Block Central', sequence: 5, timeOffsetMinutes: 22, isMajorHub: true }
    ]
  },
  {
    id: 'RT-102',
    name: 'Campus Gate ↔ Data Centre',
    code: 'CG-DC',
    startPoint: 'Campus Main Gate',
    endPoint: 'Data Centre & IT Hub',
    estimatedDurationMinutes: 25,
    distanceKm: 5.8,
    assignedVehicleId: 'VEH-102',
    assignedVehicleNumber: 'KA-01-EA-5102',
    assignedDriverId: 'DRV-102',
    assignedDriverName: 'Rahul Sharma',
    status: 'Active',
    dailyTripsCount: 14,
    peakHour: '08:30 - 10:30',
    stops: [
      { id: 'ST-201', name: 'Campus Main Gate', sequence: 1, timeOffsetMinutes: 0, isMajorHub: true },
      { id: 'ST-202', name: 'Visitor Parking P1', sequence: 2, timeOffsetMinutes: 6 },
      { id: 'ST-203', name: 'Innovation Tower A', sequence: 3, timeOffsetMinutes: 13 },
      { id: 'ST-204', name: 'Bio-Research Lab', sequence: 4, timeOffsetMinutes: 19 },
      { id: 'ST-205', name: 'Data Centre & IT Hub', sequence: 5, timeOffsetMinutes: 25, isMajorHub: true }
    ]
  },
  {
    id: 'RT-103',
    name: 'Library ↔ Innovation Parking',
    code: 'LIB-PK',
    startPoint: 'Central Library Junction',
    endPoint: 'Innovation Parking Multi-level',
    estimatedDurationMinutes: 18,
    distanceKm: 3.5,
    assignedVehicleId: 'VEH-103',
    assignedVehicleNumber: 'KA-01-MJ-8834',
    assignedDriverId: 'DRV-103',
    assignedDriverName: 'Neeraj Kumar',
    status: 'Active',
    dailyTripsCount: 12,
    peakHour: '12:00 - 14:00',
    stops: [
      { id: 'ST-301', name: 'Central Library Junction', sequence: 1, timeOffsetMinutes: 0, isMajorHub: true },
      { id: 'ST-302', name: 'Auditorium Circle', sequence: 2, timeOffsetMinutes: 5 },
      { id: 'ST-303', name: 'Student Centre Cafeteria', sequence: 3, timeOffsetMinutes: 11 },
      { id: 'ST-304', name: 'Innovation Parking Multi-level', sequence: 4, timeOffsetMinutes: 18, isMajorHub: true }
    ]
  },
  {
    id: 'RT-104',
    name: 'Main Gate ↔ Research Park',
    code: 'MG-RP',
    startPoint: 'Campus Main Gate',
    endPoint: 'Tech & Research Park Block 3',
    estimatedDurationMinutes: 30,
    distanceKm: 7.1,
    assignedVehicleId: 'VEH-104',
    assignedVehicleNumber: 'KA-01-EA-9910',
    assignedDriverId: 'DRV-104',
    assignedDriverName: 'Arjun Mehta',
    status: 'Active',
    dailyTripsCount: 18,
    peakHour: '09:00 - 11:00',
    stops: [
      { id: 'ST-401', name: 'Campus Main Gate', sequence: 1, timeOffsetMinutes: 0, isMajorHub: true },
      { id: 'ST-402', name: 'Executive Guest House', sequence: 2, timeOffsetMinutes: 8 },
      { id: 'ST-403', name: 'Faculty Residences North', sequence: 3, timeOffsetMinutes: 16 },
      { id: 'ST-404', name: 'Nano-Tech Facility', sequence: 4, timeOffsetMinutes: 23 },
      { id: 'ST-405', name: 'Tech & Research Park Block 3', sequence: 5, timeOffsetMinutes: 30, isMajorHub: true }
    ]
  },
  {
    id: 'RT-105',
    name: 'Sports Complex ↔ Food Court',
    code: 'SC-FC',
    startPoint: 'Indoor Sports Complex',
    endPoint: 'Central Food Court & Plaza',
    estimatedDurationMinutes: 15,
    distanceKm: 2.8,
    assignedVehicleId: 'VEH-105',
    assignedVehicleNumber: 'KA-01-EA-3120',
    assignedDriverId: 'DRV-105',
    assignedDriverName: 'Vikram Singh',
    status: 'Active',
    dailyTripsCount: 10,
    peakHour: '17:00 - 19:00',
    stops: [
      { id: 'ST-501', name: 'Indoor Sports Complex', sequence: 1, timeOffsetMinutes: 0, isMajorHub: true },
      { id: 'ST-502', name: 'Swimming Arena', sequence: 2, timeOffsetMinutes: 4 },
      { id: 'ST-503', name: 'Open Amphitheatre', sequence: 3, timeOffsetMinutes: 9 },
      { id: 'ST-504', name: 'Central Food Court & Plaza', sequence: 4, timeOffsetMinutes: 15, isMajorHub: true }
    ]
  },
  {
    id: 'RT-106',
    name: 'Staff Quarters ↔ Admin Building',
    code: 'SQ-AD',
    startPoint: 'Staff Quarters Sector 4',
    endPoint: 'Administrative Secretariat',
    estimatedDurationMinutes: 20,
    distanceKm: 3.9,
    assignedVehicleId: 'VEH-106',
    assignedVehicleNumber: 'KA-01-MJ-7741',
    assignedDriverId: 'DRV-106',
    assignedDriverName: 'Suresh Patil',
    status: 'Active',
    dailyTripsCount: 8,
    peakHour: '08:30 - 09:30',
    stops: [
      { id: 'ST-601', name: 'Staff Quarters Sector 4', sequence: 1, timeOffsetMinutes: 0, isMajorHub: true },
      { id: 'ST-602', name: 'Community Health Clinic', sequence: 2, timeOffsetMinutes: 6 },
      { id: 'ST-603', name: 'Finance & Registrar Office', sequence: 3, timeOffsetMinutes: 13 },
      { id: 'ST-604', name: 'Administrative Secretariat', sequence: 4, timeOffsetMinutes: 20, isMajorHub: true }
    ]
  }
];
