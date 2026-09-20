import { User, Vehicle, LocationItem, Trip, FuelLog, Expense, AttendanceRecord } from './types';

export const initialUsers: User[] = [
  { id: 'usr-1', name: 'Rajesh Kumar', role: 'driver', phone: '+91 9876543210' },
  { id: 'usr-2', name: 'Vikram Singh', role: 'driver', phone: '+91 9876543211' },
  { id: 'usr-3', name: 'Amit Sharma', role: 'supervisor', phone: '+91 9876543212' },
  { id: 'usr-4', name: 'Priya Patel', role: 'admin', phone: '+91 9876543213' },
  { id: 'usr-5', name: 'Ramesh Yadav', role: 'driver', phone: '+91 9876543214' },
  { id: 'usr-6', name: 'Suresh Verma', role: 'driver', phone: '+91 9876543215' }
];

export const initialVehicles: Vehicle[] = [
  { id: 'veh-1', vehicle_number: 'KA-04-TR-9021', model: 'Volvo FMX 440', type: 'Tipper Truck 16T', capacity: '16 Tons', status: 'Active' },
  { id: 'veh-2', vehicle_number: 'KA-04-TR-8840', model: 'Tata Prima 2830', type: 'Tipper Truck 14T', capacity: '14 Tons', status: 'Active' },
  { id: 'veh-3', vehicle_number: 'KA-04-EX-1044', model: 'CAT 320D3 Heavy', type: 'Excavator', capacity: '20 Tons', status: 'Maintenance' },
  { id: 'veh-4', vehicle_number: 'KA-04-CM-5012', model: 'Schwing Stetter', type: 'Concrete Mixer', capacity: '8 M3', status: 'Active' }
];

export const initialLocations: LocationItem[] = [
  { id: 'loc-1', name: 'Quarry Site Alpha', type: 'quarry', address: 'Sector 14, Granite Ridge, North Hills' },
  { id: 'loc-2', name: 'Crusher Plant Beta', type: 'processing_plant', address: 'Plot 88, Industrial Corridor' },
  { id: 'loc-3', name: 'Flyover Site C (NH-44)', type: 'construction_site', address: 'NH-44 Bypass Junction, Km 12' },
  { id: 'loc-4', name: 'Metro Line 2 Depot', type: 'construction_site', address: 'East Extension Depot Ground' }
];

const now = new Date();
const formatTime = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
const todayStr = new Date().toISOString().split('T')[0];

export const initialTrips: Trip[] = [
  {
    id: 'trp-101',
    driver_id: 'usr-1',
    vehicle_id: 'veh-1',
    source_id: 'loc-1',
    dest_id: 'loc-3',
    material: 'Aggregates 20mm',
    quantity: 15.5,
    unit: 'Tons',
    start_odometer: 45210.0,
    end_odometer: 45238.5,
    fuel_range: 420.0,
    loading_photo_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    loading_gps_lat: 12.9716,
    loading_gps_lng: 77.5946,
    offloading_photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    offloading_gps_lat: 12.9820,
    offloading_gps_lng: 77.6045,
    status: 'completed',
    created_at: formatTime(90),
    offloaded_at: formatTime(30),
    driver_name: 'Rajesh Kumar',
    vehicle_number: 'KA-04-TR-9021',
    source_name: 'Quarry Site Alpha',
    dest_name: 'Flyover Site C (NH-44)'
  },
  {
    id: 'trp-102',
    driver_id: 'usr-2',
    vehicle_id: 'veh-2',
    source_id: 'loc-2',
    dest_id: 'loc-4',
    material: 'Crushed M-Sand',
    quantity: 14.0,
    unit: 'Tons',
    start_odometer: 38920.0,
    fuel_range: 350.0,
    loading_photo_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    loading_gps_lat: 12.9810,
    loading_gps_lng: 77.6012,
    status: 'in_transit',
    created_at: formatTime(25),
    driver_name: 'Vikram Singh',
    vehicle_number: 'KA-04-TR-8840',
    source_name: 'Crusher Plant Beta',
    dest_name: 'Metro Line 2 Depot'
  }
];

export const initialFuelLogs: FuelLog[] = [
  {
    id: 'fl-201',
    driver_id: 'usr-1',
    vehicle_id: 'veh-1',
    odometer: 45210.5,
    litres: 85.0,
    amount: 7820.00,
    created_at: formatTime(180),
    driver_name: 'Rajesh Kumar',
    vehicle_number: 'KA-04-TR-9021',
    receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-301',
    supervisor_id: 'usr-3',
    category: 'equipment_repair',
    amount: 3450.00,
    vendor: 'Kavita Hydraulic Spares & Repairs',
    notes: 'Urgent hydraulic pipe replacement for excavator backhoe arm',
    created_at: formatTime(90),
    supervisor_name: 'Amit Sharma',
    bill_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  }
];

export const initialAttendance: AttendanceRecord[] = [
  { id: 'att-1', supervisor_id: 'usr-3', employee_id: 'usr-1', status: 'present', date: todayStr, employee_name: 'Rajesh Kumar', employee_role: 'driver' },
  { id: 'att-2', supervisor_id: 'usr-3', employee_id: 'usr-2', status: 'present', date: todayStr, employee_name: 'Vikram Singh', employee_role: 'driver' }
];
