import { Driver } from '../models/driver.model';

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'DRV-101',
    name: 'Amit Verma',
    phone: '+91 98450 12841',
    licenseNumber: 'DL-04-2018-847291',
    status: 'On Trip',
    currentVehicleId: 'VEH-101',
    currentVehicleNumber: 'KA-01-EA-4521',
    rating: 4.9,
    totalTripsToday: 6,
    shift: { startTime: '06:00', endTime: '15:00' },
    activities: [
      {
        id: 'ACT-101-1',
        driverId: 'DRV-101',
        type: 'Duty',
        startTime: '06:00',
        endTime: '15:00',
        date: '2026-09-22',
        notes: 'Morning Shift Duty Schedule'
      },
      {
        id: 'ACT-101-2',
        driverId: 'DRV-101',
        type: 'Pickup/Drop',
        startTime: '06:30',
        endTime: '07:15',
        date: '2026-09-22',
        routeId: 'RT-101',
        routeName: 'Hostel Block A ↔ Academic Block',
        bookingId: 'BK-1001',
        vehicleId: 'VEH-101',
        vehicleNumber: 'KA-01-EA-4521',
        notes: 'Hostel batch transfer'
      },
      {
        id: 'ACT-101-3',
        driverId: 'DRV-101',
        type: 'Pickup/Drop',
        startTime: '08:00',
        endTime: '09:00',
        date: '2026-09-22',
        routeId: 'RT-101',
        routeName: 'Hostel Block A ↔ Academic Block',
        bookingId: 'BK-1004',
        vehicleId: 'VEH-101',
        vehicleNumber: 'KA-01-EA-4521',
        notes: 'Peak morning student run'
      },
      {
        id: 'ACT-101-4',
        driverId: 'DRV-101',
        type: 'Break',
        startTime: '10:00',
        endTime: '10:45',
        date: '2026-09-22',
        notes: 'Tea & Breakfast break'
      },
      {
        id: 'ACT-101-5',
        driverId: 'DRV-101',
        type: 'Pickup/Drop',
        startTime: '11:15',
        endTime: '12:30',
        date: '2026-09-22',
        routeId: 'RT-101',
        routeName: 'Hostel Block A ↔ Academic Block',
        bookingId: 'BK-1012',
        vehicleId: 'VEH-101',
        vehicleNumber: 'KA-01-EA-4521',
        notes: 'Mid-day faculty transfer'
      },
      {
        id: 'ACT-101-6',
        driverId: 'DRV-101',
        type: 'Empty leg',
        startTime: '13:00',
        endTime: '13:30',
        date: '2026-09-22',
        notes: 'Re-positioning vehicle to South Depot'
      }
    ]
  },
  {
    id: 'DRV-102',
    name: 'Rahul Sharma',
    phone: '+91 97412 88401',
    licenseNumber: 'DL-04-2016-193842',
    status: 'Available',
    currentVehicleId: 'VEH-102',
    currentVehicleNumber: 'KA-01-EA-5102',
    rating: 4.8,
    totalTripsToday: 5,
    shift: { startTime: '07:00', endTime: '16:00' },
    activities: [
      {
        id: 'ACT-102-1',
        driverId: 'DRV-102',
        type: 'Duty',
        startTime: '07:00',
        endTime: '16:00',
        date: '2026-09-22',
        notes: 'General operations shift'
      },
      {
        id: 'ACT-102-2',
        driverId: 'DRV-102',
        type: 'Pickup/Drop',
        startTime: '07:30',
        endTime: '08:30',
        date: '2026-09-22',
        routeId: 'RT-102',
        routeName: 'Campus Gate ↔ Data Centre',
        bookingId: 'BK-1002',
        vehicleId: 'VEH-102',
        vehicleNumber: 'KA-01-EA-5102'
      },
      {
        id: 'ACT-102-3',
        driverId: 'DRV-102',
        type: 'Pickup/Drop',
        startTime: '09:15',
        endTime: '10:30',
        date: '2026-09-22',
        routeId: 'RT-102',
        routeName: 'Campus Gate ↔ Data Centre',
        bookingId: 'BK-1007',
        vehicleId: 'VEH-102',
        vehicleNumber: 'KA-01-EA-5102'
      },
      {
        id: 'ACT-102-4',
        driverId: 'DRV-102',
        type: 'Break',
        startTime: '11:00',
        endTime: '12:00',
        date: '2026-09-22',
        notes: 'Lunch break'
      },
      {
        id: 'ACT-102-5',
        driverId: 'DRV-102',
        type: 'Vehicle change',
        startTime: '12:30',
        endTime: '13:00',
        date: '2026-09-22',
        notes: 'Swapped to EV charger bay 3'
      }
    ]
  },
  {
    id: 'DRV-103',
    name: 'Neeraj Kumar',
    phone: '+91 99801 34912',
    licenseNumber: 'DL-04-2019-948201',
    status: 'On Break',
    currentVehicleId: 'VEH-103',
    currentVehicleNumber: 'KA-01-MJ-8834',
    rating: 4.7,
    totalTripsToday: 4,
    shift: { startTime: '08:00', endTime: '17:00' },
    activities: [
      {
        id: 'ACT-103-1',
        driverId: 'DRV-103',
        type: 'Duty',
        startTime: '08:00',
        endTime: '17:00',
        date: '2026-09-22'
      },
      {
        id: 'ACT-103-2',
        driverId: 'DRV-103',
        type: 'Pickup/Drop',
        startTime: '08:30',
        endTime: '09:45',
        date: '2026-09-22',
        routeId: 'RT-103',
        routeName: 'Library ↔ Innovation Parking',
        bookingId: 'BK-1005',
        vehicleId: 'VEH-103',
        vehicleNumber: 'KA-01-MJ-8834'
      },
      {
        id: 'ACT-103-3',
        driverId: 'DRV-103',
        type: 'Break',
        startTime: '10:30',
        endTime: '11:15',
        date: '2026-09-22',
        notes: 'Scheduled rest period'
      },
      {
        id: 'ACT-103-4',
        driverId: 'DRV-103',
        type: 'Pickup/Drop',
        startTime: '12:00',
        endTime: '13:15',
        date: '2026-09-22',
        routeId: 'RT-103',
        routeName: 'Library ↔ Innovation Parking',
        bookingId: 'BK-1014',
        vehicleId: 'VEH-103',
        vehicleNumber: 'KA-01-MJ-8834'
      }
    ]
  },
  {
    id: 'DRV-104',
    name: 'Arjun Mehta',
    phone: '+91 96110 59281',
    licenseNumber: 'DL-04-2015-773829',
    status: 'On Trip',
    currentVehicleId: 'VEH-104',
    currentVehicleNumber: 'KA-01-EA-9910',
    rating: 4.9,
    totalTripsToday: 7,
    shift: { startTime: '06:00', endTime: '15:00' },
    activities: [
      {
        id: 'ACT-104-1',
        driverId: 'DRV-104',
        type: 'Duty',
        startTime: '06:00',
        endTime: '15:00',
        date: '2026-09-22'
      },
      {
        id: 'ACT-104-2',
        driverId: 'DRV-104',
        type: 'Pickup/Drop',
        startTime: '06:45',
        endTime: '08:00',
        date: '2026-09-22',
        routeId: 'RT-104',
        routeName: 'Main Gate ↔ Research Park',
        bookingId: 'BK-1003',
        vehicleId: 'VEH-104',
        vehicleNumber: 'KA-01-EA-9910'
      },
      {
        id: 'ACT-104-3',
        driverId: 'DRV-104',
        type: 'Pickup/Drop',
        startTime: '09:00',
        endTime: '10:15',
        date: '2026-09-22',
        routeId: 'RT-104',
        routeName: 'Main Gate ↔ Research Park',
        bookingId: 'BK-1008',
        vehicleId: 'VEH-104',
        vehicleNumber: 'KA-01-EA-9910'
      },
      {
        id: 'ACT-104-4',
        driverId: 'DRV-104',
        type: 'Break',
        startTime: '11:00',
        endTime: '11:45',
        date: '2026-09-22'
      },
      {
        id: 'ACT-104-5',
        driverId: 'DRV-104',
        type: 'Pickup/Drop',
        startTime: '12:30',
        endTime: '14:00',
        date: '2026-09-22',
        routeId: 'RT-104',
        routeName: 'Main Gate ↔ Research Park',
        bookingId: 'BK-1015',
        vehicleId: 'VEH-104',
        vehicleNumber: 'KA-01-EA-9910'
      }
    ]
  },
  {
    id: 'DRV-105',
    name: 'Vikram Singh',
    phone: '+91 94480 77192',
    licenseNumber: 'DL-04-2017-662910',
    status: 'Available',
    currentVehicleId: 'VEH-105',
    currentVehicleNumber: 'KA-01-EA-3120',
    rating: 4.6,
    totalTripsToday: 3,
    shift: { startTime: '10:00', endTime: '19:00' },
    activities: [
      {
        id: 'ACT-105-1',
        driverId: 'DRV-105',
        type: 'Duty',
        startTime: '10:00',
        endTime: '19:00',
        date: '2026-09-22'
      },
      {
        id: 'ACT-105-2',
        driverId: 'DRV-105',
        type: 'Pickup/Drop',
        startTime: '10:30',
        endTime: '11:30',
        date: '2026-09-22',
        routeId: 'RT-105',
        routeName: 'Sports Complex ↔ Food Court',
        bookingId: 'BK-1010',
        vehicleId: 'VEH-105',
        vehicleNumber: 'KA-01-EA-3120'
      },
      {
        id: 'ACT-105-3',
        driverId: 'DRV-105',
        type: 'Empty leg',
        startTime: '12:00',
        endTime: '12:30',
        date: '2026-09-22',
        notes: 'Depot transfer for fast charge'
      }
    ]
  },
  {
    id: 'DRV-106',
    name: 'Suresh Patil',
    phone: '+91 98860 41209',
    licenseNumber: 'DL-04-2014-441829',
    status: 'Available',
    currentVehicleId: 'VEH-106',
    currentVehicleNumber: 'KA-01-MJ-7741',
    rating: 4.8,
    totalTripsToday: 3,
    shift: { startTime: '07:30', endTime: '16:30' },
    activities: [
      {
        id: 'ACT-106-1',
        driverId: 'DRV-106',
        type: 'Duty',
        startTime: '07:30',
        endTime: '16:30',
        date: '2026-09-22'
      },
      {
        id: 'ACT-106-2',
        driverId: 'DRV-106',
        type: 'Pickup/Drop',
        startTime: '08:00',
        endTime: '09:15',
        date: '2026-09-22',
        routeId: 'RT-106',
        routeName: 'Staff Quarters ↔ Admin Building',
        bookingId: 'BK-1006',
        vehicleId: 'VEH-106',
        vehicleNumber: 'KA-01-MJ-7741'
      },
      {
        id: 'ACT-106-3',
        driverId: 'DRV-106',
        type: 'Break',
        startTime: '10:00',
        endTime: '10:45',
        date: '2026-09-22'
      }
    ]
  },
  {
    id: 'DRV-107',
    name: 'Rajesh Goud',
    phone: '+91 97390 12098',
    licenseNumber: 'DL-04-2020-551920',
    status: 'Off Duty',
    rating: 4.7,
    totalTripsToday: 0,
    shift: { startTime: '14:00', endTime: '22:00' },
    activities: [
      {
        id: 'ACT-107-1',
        driverId: 'DRV-107',
        type: 'Duty',
        startTime: '14:00',
        endTime: '22:00',
        date: '2026-09-22',
        notes: 'Evening peak shift'
      }
    ]
  },
  {
    id: 'DRV-108',
    name: 'Manoj Pillai',
    phone: '+91 94490 88219',
    licenseNumber: 'DL-04-2018-331902',
    status: 'Off Duty',
    rating: 4.9,
    totalTripsToday: 0,
    shift: { startTime: '15:00', endTime: '23:00' },
    activities: [
      {
        id: 'ACT-108-1',
        driverId: 'DRV-108',
        type: 'Duty',
        startTime: '15:00',
        endTime: '23:00',
        date: '2026-09-22',
        notes: 'Night shift buffer duty'
      }
    ]
  }
];
