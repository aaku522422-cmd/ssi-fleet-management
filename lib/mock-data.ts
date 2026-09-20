import { User, Vehicle, LocationItem, Trip, FuelLog, Expense, AttendanceRecord } from './types';

// Standard UUID format for PostgreSQL compatibility
export const initialUsers: User[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Rajesh Kumar', role: 'driver', phone: '+91 9876543210' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Vikram Singh', role: 'driver', phone: '+91 9876543211' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Amit Sharma', role: 'supervisor', phone: '+91 9876543212' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Priya Patel', role: 'admin', phone: '+91 9876543213' }
];

export const initialVehicles: Vehicle[] = [
  { id: 'a1111111-1111-1111-1111-111111111111', vehicle_number: 'KA-04-TR-9021', model: 'Volvo FMX 440', type: 'Tipper Truck 16T', capacity: '16 Tons', status: 'Active' },
  { id: 'a2222222-2222-2222-2222-222222222222', vehicle_number: 'KA-04-TR-8840', model: 'Tata Prima 2830', type: 'Tipper Truck 14T', capacity: '14 Tons', status: 'Active' },
  { id: 'a3333333-3333-3333-3333-333333333333', vehicle_number: 'KA-04-EX-1044', model: 'CAT 320D3 Heavy', type: 'Excavator', capacity: '20 Tons', status: 'Maintenance' },
  { id: 'a4444444-4444-4444-4444-444444444444', vehicle_number: 'KA-04-CM-5012', model: 'Schwing Stetter', type: 'Concrete Mixer', capacity: '8 M3', status: 'Active' }
];

export const initialLocations: LocationItem[] = [
  { id: 'b1111111-1111-1111-1111-111111111111', name: 'Quarry Site Alpha', type: 'quarry', address: 'Sector 14, Granite Ridge, North Hills' },
  { id: 'b2222222-2222-2222-2222-222222222222', name: 'Crusher Plant Beta', type: 'processing_plant', address: 'Plot 88, Industrial Corridor' },
  { id: 'b3333333-3333-3333-3333-333333333333', name: 'Flyover Site C (NH-44)', type: 'construction_site', address: 'NH-44 Bypass Junction, Km 12' },
  { id: 'b4444444-4444-4444-4444-444444444444', name: 'Metro Line 2 Depot', type: 'construction_site', address: 'East Extension Depot Ground' }
];

const now = new Date();
const formatTime = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
const todayStr = new Date().toISOString().split('T')[0];

export const initialTrips: Trip[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    driver_id: '11111111-1111-1111-1111-111111111111',
    vehicle_id: 'a1111111-1111-1111-1111-111111111111',
    source_id: 'b1111111-1111-1111-1111-111111111111',
    dest_id: 'b3333333-3333-3333-3333-333333333333',
    material: 'Aggregates 20mm',
    quantity: 15.5,
    unit: 'Tons',
    start_odometer: 45210.0,
    end_odometer: 45238.5,
    fuel_range: 420.0,
    loading_photo_url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
    loading_gps_lat: 12.9716,
    loading_gps_lng: 77.5946,
    loading_gps_address: 'Quarry Site Alpha, Sector 14 Granite Ridge',
    source_time: '10:30 AM',
    offloading_photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    offloading_gps_lat: 12.9820,
    offloading_gps_lng: 77.6045,
    offloading_gps_address: 'Flyover Site C, NH-44 Bypass Junction, Km 12',
    dest_time: '11:45 AM',
    rest_time_minutes: 15,
    fuel_consumed_litres: 7.5,
    mileage: 3.80,
    status: 'completed',
    created_at: formatTime(90),
    offloaded_at: formatTime(30),
    driver_name: 'Rajesh Kumar',
    vehicle_number: 'KA-04-TR-9021',
    source_name: 'Quarry Site Alpha',
    dest_name: 'Flyover Site C (NH-44)'
  }
];

export const initialFuelLogs: FuelLog[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    driver_id: '11111111-1111-1111-1111-111111111111',
    vehicle_id: 'a1111111-1111-1111-1111-111111111111',
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
    id: 'e1111111-1111-1111-1111-111111111111',
    supervisor_id: '33333333-3333-3333-3333-333333333333',
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
  { id: 'f1111111-1111-1111-1111-111111111111', supervisor_id: '33333333-3333-3333-3333-333333333333', employee_id: '11111111-1111-1111-1111-111111111111', status: 'present', date: todayStr, employee_name: 'Rajesh Kumar', employee_role: 'driver' },
  { id: 'f2222222-2222-2222-2222-222222222222', supervisor_id: '33333333-3333-3333-3333-333333333333', employee_id: '22222222-2222-2222-2222-222222222222', status: 'present', date: todayStr, employee_name: 'Vikram Singh', employee_role: 'driver' }
];
