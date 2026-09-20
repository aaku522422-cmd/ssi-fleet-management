'use client';

import { useState, useEffect } from 'react';
import { 
  User, Vehicle, LocationItem, Trip, FuelLog, Expense, AttendanceRecord, 
  DashboardMetrics, UserRole, AttendanceStatus 
} from './types';
import { 
  initialUsers, initialVehicles, initialLocations, 
  initialTrips, initialFuelLogs, initialExpenses, initialAttendance 
} from './mock-data';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  USERS: 'ssi_users_v1',
  VEHICLES: 'ssi_vehicles_v1',
  LOCATIONS: 'ssi_locations_v1',
  TRIPS: 'ssi_trips_v2',
  FUEL_LOGS: 'ssi_fuel_logs_v1',
  EXPENSES: 'ssi_expenses_v1',
  ATTENDANCE: 'ssi_attendance_v1',
  ACTIVE_ROLE: 'ssi_active_role_v1'
};

export function useFleetStore() {
  const [activeRole, setActiveRoleState] = useState<UserRole>('driver');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [locations, setLocations] = useState<LocationItem[]>(initialLocations);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuelLogs);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as UserRole | null;
      if (savedRole) setActiveRoleState(savedRole);

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));

      const savedLocations = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
      if (savedLocations) setLocations(JSON.parse(savedLocations));

      const savedTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
      if (savedTrips) setTrips(JSON.parse(savedTrips));

      const savedFuelLogs = localStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
      if (savedFuelLogs) setFuelLogs(JSON.parse(savedFuelLogs));

      const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

      if (isSupabaseConfigured && supabase) {
        fetchFromSupabase();
      }
    } catch (e) {
      console.warn('Storage fallback to default mock data', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const fetchFromSupabase = async () => {
    if (!supabase) return;
    try {
      const [uRes, vRes, lRes, tRes, fRes, eRes, aRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('locations').select('*'),
        supabase.from('trips').select('*').order('created_at', { ascending: false }),
        supabase.from('fuel_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('attendance').select('*')
      ]);

      if (uRes.data?.length) setUsers(uRes.data);
      if (vRes.data?.length) setVehicles(vRes.data);
      if (lRes.data?.length) setLocations(lRes.data);
      if (tRes.data?.length) setTrips(tRes.data);
      if (fRes.data?.length) setFuelLogs(fRes.data);
      if (eRes.data?.length) setExpenses(eRes.data);
      if (aRes.data?.length) setAttendance(aRes.data);
    } catch (err) {
      console.error('Error fetching live Supabase data', err);
    }
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    }
  };

  // Phase 1: Create Loading Trip
  const addTrip = async (newTrip: Omit<Trip, 'id' | 'created_at' | 'status'>) => {
    const driver = users.find(u => u.id === newTrip.driver_id);
    const vehicle = vehicles.find(v => v.id === newTrip.vehicle_id);
    const source = locations.find(l => l.id === newTrip.source_id);
    const dest = locations.find(l => l.id === newTrip.dest_id);

    const tripRecord: Trip = {
      ...newTrip,
      id: `trp-${Date.now()}`,
      status: 'in_transit',
      created_at: new Date().toISOString(),
      driver_name: driver?.name || 'Driver',
      vehicle_number: vehicle?.vehicle_number || 'TRK-00',
      source_name: source?.name || 'Source',
      dest_name: dest?.name || 'Destination'
    };

    const updated = [tripRecord, ...trips];
    setTrips(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('trips').insert([{
          driver_id: newTrip.driver_id,
          vehicle_id: newTrip.vehicle_id,
          source_id: newTrip.source_id,
          dest_id: newTrip.dest_id,
          material: newTrip.material,
          quantity: newTrip.quantity,
          unit: newTrip.unit || 'Tons',
          start_odometer: newTrip.start_odometer,
          fuel_range: newTrip.fuel_range,
          loading_photo_url: newTrip.loading_photo_url,
          loading_gps_lat: newTrip.loading_gps_lat,
          loading_gps_lng: newTrip.loading_gps_lng,
          status: 'in_transit'
        }]);
      } catch (err) {
        console.error('Failed syncing loading trip to Supabase', err);
      }
    }
    return tripRecord;
  };

  // Phase 2: Complete Offload at Destination
  const completeTripOffload = async (
    tripId: string, 
    offloadData: {
      end_odometer: number;
      offloading_photo_url?: string;
      offloading_gps_lat?: number;
      offloading_gps_lng?: number;
    }
  ) => {
    const offloadedTime = new Date().toISOString();
    const updated = trips.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          ...offloadData,
          status: 'completed' as const,
          offloaded_at: offloadedTime
        };
      }
      return t;
    });

    setTrips(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('trips').update({
          end_odometer: offloadData.end_odometer,
          offloading_photo_url: offloadData.offloading_photo_url,
          offloading_gps_lat: offloadData.offloading_gps_lat,
          offloading_gps_lng: offloadData.offloading_gps_lng,
          status: 'completed',
          offloaded_at: offloadedTime
        }).eq('id', tripId);
      } catch (err) {
        console.error('Failed syncing trip completion to Supabase', err);
      }
    }
  };

  // Add Fuel Log
  const addFuelLog = async (newLog: Omit<FuelLog, 'id' | 'created_at'>) => {
    const driver = users.find(u => u.id === newLog.driver_id);
    const vehicle = vehicles.find(v => v.id === newLog.vehicle_id);

    const fuelRecord: FuelLog = {
      ...newLog,
      id: `fl-${Date.now()}`,
      created_at: new Date().toISOString(),
      driver_name: driver?.name || 'Driver',
      vehicle_number: vehicle?.vehicle_number || 'TRK-00'
    };

    const updated = [fuelRecord, ...fuelLogs];
    setFuelLogs(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(updated));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fuel_logs').insert([{
          driver_id: newLog.driver_id,
          vehicle_id: newLog.vehicle_id,
          odometer: newLog.odometer,
          litres: newLog.litres,
          amount: newLog.amount,
          receipt_url: newLog.receipt_url
        }]);
      } catch (err) {
        console.error('Failed syncing fuel log to Supabase', err);
      }
    }
    return fuelRecord;
  };

  // Add Expense
  const addExpense = async (newExp: Omit<Expense, 'id' | 'created_at'>) => {
    const supervisor = users.find(u => u.id === newExp.supervisor_id);

    const expenseRecord: Expense = {
      ...newExp,
      id: `exp-${Date.now()}`,
      created_at: new Date().toISOString(),
      supervisor_name: supervisor?.name || 'Supervisor'
    };

    const updated = [expenseRecord, ...expenses];
    setExpenses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expenses').insert([{
          supervisor_id: newExp.supervisor_id,
          category: newExp.category,
          amount: newExp.amount,
          vendor: newExp.vendor,
          bill_url: newExp.bill_url,
          notes: newExp.notes
        }]);
      } catch (err) {
        console.error('Failed syncing expense to Supabase', err);
      }
    }
    return expenseRecord;
  };

  // Update Attendance Status
  const markAttendance = async (employeeId: string, status: AttendanceStatus, supervisorId: string = 'usr-3') => {
    const todayStr = new Date().toISOString().split('T')[0];
    const employee = users.find(u => u.id === employeeId);

    const existingIndex = attendance.findIndex(a => a.employee_id === employeeId && a.date === todayStr);
    let updated: AttendanceRecord[];

    if (existingIndex >= 0) {
      updated = [...attendance];
      updated[existingIndex] = {
        ...updated[existingIndex],
        status,
        supervisor_id: supervisorId
      };
    } else {
      const record: AttendanceRecord = {
        id: `att-${Date.now()}-${employeeId}`,
        supervisor_id: supervisorId,
        employee_id: employeeId,
        status,
        date: todayStr,
        created_at: new Date().toISOString(),
        employee_name: employee?.name || 'Employee',
        employee_role: employee?.role || 'driver'
      };
      updated = [record, ...attendance];
    }

    setAttendance(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('attendance').upsert({
          supervisor_id: supervisorId,
          employee_id: employeeId,
          status,
          date: todayStr
        }, { onConflict: 'employee_id,date' });
      } catch (err) {
        console.error('Failed syncing attendance to Supabase', err);
      }
    }
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    const userItem: User = { ...newUser, id: `usr-${Date.now()}` };
    const updated = [...users, userItem];
    setUsers(updated);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  };

  const addVehicle = (newVeh: Omit<Vehicle, 'id'>) => {
    const vehItem: Vehicle = { ...newVeh, id: `veh-${Date.now()}` };
    const updated = [...vehicles, vehItem];
    setVehicles(updated);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updated));
  };

  const addLocation = (newLoc: Omit<LocationItem, 'id'>) => {
    const locItem: LocationItem = { ...newLoc, id: `loc-${Date.now()}` };
    const updated = [...locations, locItem];
    setLocations(updated);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(updated));
  };

  const metrics: DashboardMetrics = {
    totalTripsToday: trips.length,
    totalQuantityMovedToday: trips.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0),
    totalFuelLoggedToday: fuelLogs.reduce((acc, f) => acc + (Number(f.amount) || 0), 0),
    totalFuelLitresToday: fuelLogs.reduce((acc, f) => acc + (Number(f.litres) || 0), 0),
    totalExpensesToday: expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
    headcountPresent: attendance.filter(a => a.status === 'present' || a.status === 'half_day').length,
    headcountTotal: users.length,
    attendanceRate: users.length > 0 
      ? Math.round((attendance.filter(a => a.status === 'present' || a.status === 'half_day').length / users.length) * 100) 
      : 0
  };

  return {
    isLoaded,
    activeRole,
    setActiveRole,
    users,
    vehicles,
    locations,
    trips,
    fuelLogs,
    expenses,
    attendance,
    metrics,
    addTrip,
    completeTripOffload,
    addFuelLog,
    addExpense,
    markAttendance,
    addUser,
    addVehicle,
    addLocation
  };
}
