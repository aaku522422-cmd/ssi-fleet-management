export type UserRole = 'driver' | 'supervisor' | 'admin';

export type LocationType = 'quarry' | 'processing_plant' | 'construction_site' | 'warehouse';

export type TripStatus = 'loading' | 'in_transit' | 'completed' | 'verified';

export type AttendanceStatus = 'present' | 'absent' | 'half_day';

export type ExpenseCategory = 
  | 'fuel_oil' 
  | 'equipment_repair' 
  | 'refreshments' 
  | 'tools_spares' 
  | 'miscellaneous';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  model: string;
  type: string;
  capacity: string;
  status?: string;
  created_at?: string;
}

export interface LocationItem {
  id: string;
  name: string;
  type: LocationType;
  address?: string;
  created_at?: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  source_id: string;
  dest_id: string;
  material: string;
  quantity: number;
  unit?: string;
  
  // Phase 1: Loading Stage
  start_odometer?: number;
  fuel_range?: number;
  loading_photo_url?: string;
  loading_gps_lat?: number;
  loading_gps_lng?: number;
  loading_gps_address?: string;

  // Phase 2: Offloading Stage
  end_odometer?: number;
  offloading_photo_url?: string;
  offloading_gps_lat?: number;
  offloading_gps_lng?: number;
  offloading_gps_address?: string;

  // Legacy fallback fields
  photo_url?: string;
  gps_lat?: number;
  gps_lng?: number;

  status: TripStatus;
  created_at: string;
  offloaded_at?: string;
  
  // Joined fields for UI convenience
  driver_name?: string;
  vehicle_number?: string;
  source_name?: string;
  dest_name?: string;
}

export interface FuelLog {
  id: string;
  driver_id: string;
  vehicle_id: string;
  odometer: number;
  litres: number;
  amount: number;
  receipt_url?: string;
  created_at: string;
  driver_name?: string;
  vehicle_number?: string;
}

export interface Expense {
  id: string;
  supervisor_id: string;
  category: ExpenseCategory;
  amount: number;
  vendor: string;
  bill_url?: string;
  notes?: string;
  created_at: string;
  supervisor_name?: string;
}

export interface AttendanceRecord {
  id: string;
  supervisor_id: string;
  employee_id: string;
  status: AttendanceStatus;
  date: string;
  created_at?: string;
  employee_name?: string;
  employee_role?: UserRole;
}

export interface DashboardMetrics {
  totalTripsToday: number;
  totalQuantityMovedToday: number;
  totalFuelLoggedToday: number;
  totalFuelLitresToday: number;
  totalExpensesToday: number;
  headcountPresent: number;
  headcountTotal: number;
  attendanceRate: number;
}
